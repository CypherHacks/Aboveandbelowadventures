// backend/src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();

// ---- CORS (allow local dev + your Netlify site) ----
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8888', // netlify dev
  process.env.FRONTEND_URL, // e.g., https://aboveandbelowadventures.netlify.app
].filter(Boolean) as string[];

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin(origin, cb) {
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

// ---- Outlook SMTP transporter ----
// Hardened Outlook transporter for Netlify Functions
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,             // 587 uses STARTTLS
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    requireTLS: true,          // make STARTTLS mandatory
    pool: true,                // serverless-friendly connection pooling
    maxConnections: 1,         // avoid multiple concurrent SMTP connects
    tls: {
      minVersion: 'TLSv1.2',
      // ciphers: 'TLSv1.2',   // usually not needed; uncomment if TLS errors persist
      rejectUnauthorized: true // keep this true in prod
    },
    // authMethod: 'LOGIN',    // uncomment if EAUTH persists
  });

// ---- Validation ----
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ---- Health ----
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---- Contact endpoint ----
app.options('/api/contact', cors());

app.post('/api/contact', limiter, contactValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const transporter = createTransporter();

    // optional: you can skip verify() in serverless to reduce failures/latency
    try {
      await transporter.verify();
      console.log('SMTP verified OK');
    } catch (vErr: any) {
      console.error('SMTP verify failed:', vErr?.code, vErr?.message);
      // continue anyway; sometimes verify fails but sendMail works
    }

    const recipientMailOptions = {
      from: process.env.EMAIL_USER,    // must match authenticated mailbox
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>`,
      replyTo: email,
    };

    const autoReplyOptions = {
      from: process.env.EMAIL_USER,    // keep same mailbox for Outlook
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
    // temporarily expose the code to help you debug from the UI
    res.status(500).json({
      success: false,
      message: `Failed to send message (${err?.code || 'UNKNOWN'}).`,
    });
  }
});


// ---- Error handler ----
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err?.stack || err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default app;
