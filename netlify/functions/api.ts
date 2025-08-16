import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

// ---------- Express app ----------
const app = express();

// Build allowlist from env + always allow Netlify preview domains
const allowedFromEnv = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedFromEnv.includes(origin)) return cb(null, true);
      try {
        const host = new URL(origin).hostname;
        if (host.endsWith('.netlify.app')) return cb(null, true);
      } catch {
        // ignore bad Origin values
      }
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 86400,
  })
);

// Preflight handler
app.options('/api/*', (_req, res) => res.sendStatus(204));

// ---------- Rate limit ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact form submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Helpers ----------
function pickDefaultHost(emailUser?: string) {
  if (emailUser && /@(outlook|hotmail|live)\.com$/i.test(emailUser)) {
    return 'smtp-mail.outlook.com';
  }
  return 'smtp.office365.com';
}

function buildTransporter(host: string) {
  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    requireTLS: true,
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
}

async function trySendBothHosts(sendFn: (host: string) => Promise<void>) {
  const primary = process.env.EMAIL_HOST || pickDefaultHost(process.env.EMAIL_USER);
  const fallback =
    primary === 'smtp.office365.com' ? 'smtp-mail.outlook.com' : 'smtp.office365.com';

  try {
    await sendFn(primary);
    return { hostUsed: primary, fallbackTried: false };
  } catch (errPrimary: any) {
    console.warn('Primary SMTP failed:', primary, errPrimary?.code, errPrimary?.message);
    try {
      await sendFn(fallback);
      return { hostUsed: fallback, fallbackTried: true };
    } catch (errFallback: any) {
      const combined = new Error(
        `SMTP failed (primary ${primary}: ${errPrimary?.code || errPrimary?.message}; fallback ${fallback}: ${errFallback?.code || errFallback?.message})`
      ) as any;
      combined.code = errFallback?.code || errPrimary?.code || 'SMTP_FAIL';
      combined.primary = { host: primary, code: errPrimary?.code, msg: errPrimary?.message };
      combined.fallback = { host: fallback, code: errFallback?.code, msg: errFallback?.message };
      throw combined;
    }
  }
}

// ---------- Validation ----------
const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ---------- Health ----------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: {
      host: process.env.EMAIL_HOST || pickDefaultHost(process.env.EMAIL_USER),
      user_set: !!process.env.EMAIL_USER,
      pass_set: !!process.env.EMAIL_PASS,
      rcpt_set: !!process.env.RECIPIENT_EMAIL,
      node: process.version,
    },
  });
});

// ---------- Contact ----------
app.post('/api/contact', limiter, contactValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message } = req.body as {
      name: string; email: string; subject: string; message: string;
    };

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
      console.error('Missing email env:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        RECIPIENT_EMAIL: !!process.env.RECIPIENT_EMAIL,
      });
      return res.status(500).json({ success: false, message: 'Email configuration is incomplete.' });
    }

    const sendWithHost = async (host: string) => {
      const transporter = buildTransporter(host);

      try {
        await transporter.verify();
        console.log('SMTP verify OK on', host);
      } catch (vErr: any) {
        console.warn('SMTP verify failed on', host, vErr?.code, vErr?.message);
      }

      const recipientMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `New Contact Form Submission: ${subject}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Subject:</strong> ${subject}</p>
               <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>`,
        replyTo: email,
      };

      const autoReplyOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Thank you for contacting us, ${name}!`,
        html: `<p>Hello ${name},</p>
               <p>Thank you for your message. We will get back to you soon.</p>`,
      };

      await Promise.all([
        transporter.sendMail(recipientMailOptions),
        transporter.sendMail(autoReplyOptions),
      ]);
    };

    const outcome = await trySendBothHosts(sendWithHost);
    console.log('Mail sent successfully via host:', outcome.hostUsed, 'fallback used:', outcome.fallbackTried);
    res.json({ success: true, message: "Message sent successfully! We'll get back to you soon." });
  } catch (err: any) {
    console.error('Contact form error:', {
      code: err?.code,
      message: err?.message,
      primary: err?.primary,
      fallback: err?.fallback,
      stack: err?.stack,
    });
    res.status(500).json({
      success: false,
      message: `Failed to send message (${err?.code || 'UNKNOWN'}).`,
    });
  }
});

// ---------- Error handler ----------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ---------- Export handler ----------
const handlerFn = serverless(app);
export const handler = async (event: any, context: any) => handlerFn(event, context);
