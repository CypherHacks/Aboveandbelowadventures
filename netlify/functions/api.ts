// netlify/functions/api.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import nodemailer from 'nodemailer';

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const send = (statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...extraHeaders,
  },
  body: JSON.stringify(data),
});

const stripApiPrefix = (event: HandlerEvent) => {
  // event.path example: "/.netlify/functions/api/contact"
  const raw = event.path || '/';
  const cleaned = raw.replace(/^\/\.netlify\/functions\/api/, '');
  return cleaned || '/';
};

const validate = (b: ContactBody) => {
  const e: Array<{ msg: string; param: keyof ContactBody }> = [];
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  if (!s(b.name)) e.push({ msg: 'Name is required', param: 'name' });
  else if (s(b.name).length < 2) e.push({ msg: 'Name must be at least 2 characters', param: 'name' });

  const email = s(b.email);
  if (!email) e.push({ msg: 'Email is required', param: 'email' });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.push({ msg: 'Please enter a valid email', param: 'email' });

  if (!s(b.subject)) e.push({ msg: 'Subject is required', param: 'subject' });
  else if (s(b.subject).length < 5) e.push({ msg: 'Subject must be at least 5 characters', param: 'subject' });

  if (!s(b.message)) e.push({ msg: 'Message is required', param: 'message' });
  else if (s(b.message).length < 10) e.push({ msg: 'Message should be at least 10 characters', param: 'message' });

  return e;
};

const sendEmail = async (payload: Required<ContactBody>) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    TO_EMAIL,
    FROM_EMAIL,
  } = process.env;

  // If SMTP is not configured, do not crash—return success to unblock UI testing
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('[api] SMTP not configured — skipping real send.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === 'true', // true=465, false=587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const to = TO_EMAIL || SMTP_USER;
  const from = FROM_EMAIL || `Website Contact <${SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    replyTo: payload.email,
  });

  return { skipped: false };
};

export const handler: Handler = async (event) => {
  const method = event.httpMethod.toUpperCase();
  const route = stripApiPrefix(event);

  // CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: '',
    };
  }

  if (method === 'GET' && (route === '/' || route === '/health')) {
    return send(200, { ok: true, message: 'API is healthy.' });
  }

  if (method === 'POST' && route === '/contact') {
    if (!event.body) return send(400, { success: false, message: 'Missing body' });

    let body: ContactBody;
    try {
      body = JSON.parse(event.body);
    } catch {
      return send(400, { success: false, message: 'Invalid JSON body' });
    }

    const errors = validate(body);
    if (errors.length) return send(400, { success: false, message: 'Validation error', errors });

    try {
      await sendEmail({
        name: body.name!.trim(),
        email: body.email!.trim(),
        subject: body.subject!.trim(),
        message: body.message!.trim(),
      });
      return send(200, { success: true, message: 'Thanks! Your message has been sent.' });
    } catch (err) {
      console.error('[api] Email send failed:', err);
      return send(500, { success: false, message: 'Failed to send email. Please try again later.' });
    }
  }

  return send(404, { success: false, message: `Not found: ${method} ${route}` });
};
