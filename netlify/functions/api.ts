// netlify/functions/api.ts
import type { Handler } from '@netlify/functions';
import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

// ---- Express app (fully self-contained) ----
const app = express();

// ---- CORS: allow same-origin (Netlify) + localhost dev via netlify dev ----
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8888', // netlify dev proxy
  process.env.FRONTEND_URL, // e.g., https://aboveandbelowadventures.netlify.app
].filter(Boolean) as string[];

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin(origin, cb) {
      // Same-origin requests in Netlify Functions often send an Origin header.
      // If no origin (SSR/fetch), allow.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

// ---- Rate limit ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact form submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Outlook SMTP transporter (serverless-hardened) ----
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,            // STARTTLS on 587
    requireTLS: true,         // enforce TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  });

// ---- Validation ----
const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ---- Health (use /api/health to route through the function) ----
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: {
      host: process.env.EMAIL_HOST ? 'set' : 'missing',
      port: process.env.EMAIL_PORT ? 'set' : 'missing',
      user: process.env.EMAIL_USER ? 'set' : 'missing',
      pass: process.env.EMAIL_PASS ? 'set' : 'missing', // don't log the value
      recipient: process.env.RECIPIENT_EMAIL ? 'set' : 'missing',
    },
  });
});

// ---- Contact endpoint (note: /api/contact so Netlify redirect hits it) ----
app.options('/api/contact', cors());
app.post('/api/contact', limiter, contactValidation, async (req: Request, res: Response) => {
  try {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message } = req.body as {
      name: string; email: string; subject: string; message: string;
    };

    // Sanity check env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
      console.error('Missing email env:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        RECIPIENT_EMAIL: !!process.env.RECIPIENT_EMAIL,
      });
      return res.status(500).json({ success: false, message: 'Email configuration is incomplete.' });
    }

    const transporter = createTransporter();

    // Verify (soft-fail)
    try {
      await transporter.verify();
      console.log('SMTP verified OK');
    } catch (vErr: any) {
      console.warn('SMTP verify failed (continuing):', vErr?.code, vErr?.message);
    }

    // Emails
    const recipientMailOptions = {
      from: process.env.EMAIL_USER, // must match mailbox for Outlook
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>`,
      replyTo: email,
    };

    const autoReplyOptions = {
      from: process.env.EMAIL_USER, // keep same mailbox
      to: email,
      subject: `Thank you for contacting us, ${name}!`,
      html: `<p>Hello ${name},</p>
             <p>Thank you for your message. We will get back to you soon.</p>`,
    };

    await Promise.all([
      transporter.sendMail(recipientMailOptions),
      transporter.sendMail(autoReplyOptions),
    ]);

    res.json({ success: true, message: "Message sent successfully! We'll get back to you soon." });
  } catch (err: any) {
    console.error('Contact form error:', {
      code: err?.code,
      response: err?.response,
      message: err?.message,
      stack: err?.stack,
    });
    res.status(500).json({
      success: false,
      message: `Failed to send message (${err?.code || 'UNKNOWN'}).`,
    });
  }
});

// ---- Error handler ----
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ---- Export Netlify handler ----
const handlerFn = serverless(app);
export const handler: Handler = async (event, context) => {
  return handlerFn(event, context);
};
