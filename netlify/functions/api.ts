// netlify/functions/api.ts
import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

const app = express();

// ---------- DEBUG MODE CORS (TEMPORARY) ----------
// Allow anything so we don't fight CORS while debugging.
// REVERT to allowlist once email is working.
app.use(
  cors({
    origin: true, // reflect request origin
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 0,
  })
);
app.options(['*', '/api/*', '/.netlify/functions/api/*'], (_req, res) => res.sendStatus(204));

// Helmet after CORS so it doesn't add strict defaults that interfere during debug
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- Rate limit (kept small) ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many contact form submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- SMTP (force Outlook consumer host while debugging) ----------
const SMTP_HOST = process.env.EMAIL_HOST || 'smtp-mail.outlook.com';
const SMTP_PORT = Number(process.env.EMAIL_PORT || 587);

function buildTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,       // STARTTLS on 587
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    pool: false,         // simpler during debug
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  });
}

// ---------- Validation ----------
const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ---------- Health ----------
const healthPaths = ['/api/health', '/.netlify/functions/api/health', '/health'];
app.get(healthPaths, (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user_set: !!process.env.EMAIL_USER,
      pass_set: !!process.env.EMAIL_PASS,
      rcpt_set: !!process.env.RECIPIENT_EMAIL,
      node: process.version,
    },
  });
});

// ---------- Contact ----------
const contactPaths = ['/api/contact', '/.netlify/functions/api/contact', '/contact'];
app.post(contactPaths, limiter, contactValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message } = req.body as {
      name: string; email: string; subject: string; message: string;
    };

    // env sanity
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
      return res.status(500).json({
        success: false,
        message: 'Email configuration is incomplete.',
        debug: {
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASS: !!process.env.EMAIL_PASS,
          RECIPIENT_EMAIL: !!process.env.RECIPIENT_EMAIL,
        }
      });
    }

    const transporter = buildTransporter();

    // Try verify (ok if it fails; some servers allow send without verify)
    try {
      await transporter.verify();
      console.log('SMTP verify OK on', SMTP_HOST);
    } catch (vErr: any) {
      console.warn('SMTP verify failed:', vErr?.code, vErr?.message);
    }

    const toOwner = {
      from: process.env.EMAIL_USER, // must equal authenticated mailbox for Outlook
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>`,
      replyTo: email,
    };

    const toSender = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for contacting us, ${name}!`,
      html: `<p>Hello ${name},</p>
             <p>Thank you for your message. We will get back to you soon.</p>`,
    };

    await transporter.sendMail(toOwner);
    await transporter.sendMail(toSender);

    res.json({ success: true, message: "Message sent successfully! We'll get back to you soon." });
  } catch (err: any) {
    // SHOW REAL ERROR BACK TO CLIENT (for debugging)
    console.error('Contact form error:', {
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
      command: err?.command,
      message: err?.message,
      stack: err?.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Email send failed',
      errorCode: err?.code || 'UNKNOWN',
      responseCode: err?.responseCode,
      errorMessage: err?.message || 'No message',
      command: err?.command,
    });
  }
});

// ---------- 404 JSON ----------
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}` });
});

// ---------- Error handler ----------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ---------- Export ----------
const handlerFn = serverless(app);
export const handler = async (event: any, context: any) => handlerFn(event, context);
