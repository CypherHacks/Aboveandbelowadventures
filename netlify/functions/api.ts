// netlify/functions/api.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import nodemailer from 'nodemailer';

// ---------- CORS ----------
const parseAllowed = (raw?: string) =>
  (raw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOrigin = (event: HandlerEvent) => {
  const allowed = parseAllowed(process.env.ALLOWED_ORIGINS);
  const reqOrigin =
    (event.headers?.origin as string | undefined) ||
    (event.headers?.Origin as string | undefined) ||
    '';
  if (allowed.length === 0) return '*';
  if (!reqOrigin) return allowed[0];
  return allowed.includes(reqOrigin) ? reqOrigin : allowed[0];
};

const corsHeaders = (event: HandlerEvent) => ({
  'Access-Control-Allow-Origin': corsOrigin(event),
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
});

// ---------- helpers ----------
const send = (event: HandlerEvent, statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders(event),
    ...extraHeaders,
  },
  body: JSON.stringify(data),
});

const routeFrom = (event: HandlerEvent) => {
  const raw = event.path || '/';
  const cleaned = raw.replace(/^\/\.netlify\/functions\/api/, '');
  return cleaned || '/';
};

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
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

// Read EMAIL_* (your setup) or SMTP_* (alternate)
const envEmail = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 0);
  const secureFlag = (process.env.EMAIL_SECURE ?? process.env.SMTP_SECURE ?? '').toString().toLowerCase();
  const secure = secureFlag === 'true'; // 465 => true, 587 => false (STARTTLS)
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const to = process.env.RECIPIENT_EMAIL || process.env.TO_EMAIL || user;
  const from = process.env.FROM_EMAIL || (user ? `Website Contact <${user}>` : undefined);
  return { host, port, secure, user, pass, to, from };
};

const isConfigured = (c: ReturnType<typeof envEmail>) => Boolean(c.host && c.port && c.user && c.pass);

const buildTransporter = (c: ReturnType<typeof envEmail>) => {
  if (!isConfigured(c)) return null;
  return nodemailer.createTransport({
    host: c.host!,
    port: c.port!,
    secure: c.secure,      // false on 587 -> STARTTLS
    requireTLS: !c.secure, // enforce STARTTLS when secure=false
    auth: { user: c.user!, pass: c.pass! },
    // tighten TLS for modern providers
    tls: { minVersion: 'TLSv1.2', servername: c.host },
  });
};

const DEBUG_EMAIL = String(process.env.DEBUG_EMAIL || '').toLowerCase() === 'true';

const sendEmail = async (payload: Required<ContactBody>) => {
  const cfg = envEmail();
  const transporter = buildTransporter(cfg);

  if (!transporter) {
    return { skipped: true as const, info: null, error: 'EMAIL_*/SMTP_* not fully configured' };
  }

  // Verify credentials/connectivity first — surfaces most config errors
  await transporter.verify();

  const info = await transporter.sendMail({
    from: cfg.from,
    to: cfg.to,
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    replyTo: payload.email, // Never set From to visitor (DMARC)
  });

  return { skipped: false as const, info: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected } };
};

// ---------- handler ----------
export const handler: Handler = async (event) => {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const route = routeFrom(event);

  // CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...corsHeaders(event) },
      body: '',
    };
  }

  // Health
  if (method === 'GET' && (route === '/' || route === '/health')) {
    return send(event, 200, { ok: true, message: 'API is healthy.' });
  }

  // SMTP debug
  if (method === 'GET' && route === '/debug/smtp') {
    try {
      const cfg = envEmail();
      if (!isConfigured(cfg)) {
        return send(event, 200, {
          ok: true,
          configured: false,
          present: { host: !!cfg.host, port: !!cfg.port, user: !!cfg.user, pass: !!cfg.pass },
          effective: { host: cfg.host, port: cfg.port, secure: cfg.secure, to: cfg.to, from: cfg.from },
          note: 'Set EMAIL_* (or SMTP_*) vars and redeploy.',
        });
      }
      const transporter = buildTransporter(cfg)!;
      await transporter.verify();
      return send(event, 200, {
        ok: true,
        configured: true,
        verify: 'ok',
        effective: { host: cfg.host, port: cfg.port, secure: cfg.secure, to: cfg.to, from: cfg.from },
      });
    } catch (err: any) {
      const msg = String(err?.message || err);
      return send(event, 200, {
        ok: false,
        configured: true,
        verify: 'fail',
        error: msg,
      });
    }
  }

  // Contact
  if (method === 'POST' && route === '/contact') {
    if (!event.body) return send(event, 400, { success: false, message: 'Missing body' });

    let body: ContactBody;
    try {
      body = JSON.parse(event.body);
    } catch {
      return send(event, 400, { success: false, message: 'Invalid JSON body' });
    }

    const errors = validate(body);
    if (errors.length) return send(event, 400, { success: false, message: 'Validation error', errors });

    try {
      const result = await sendEmail({
        name: body.name!.trim(),
        email: body.email!.trim(),
        subject: body.subject!.trim(),
        message: body.message!.trim(),
      });

      return send(event, 200, {
        success: true,
        skipped: result.skipped,
        info: result.info,
        message: result.skipped
          ? 'Form received — email sending is disabled (EMAIL_*/SMTP_* not fully configured).'
          : 'Thanks! Your message has been sent.',
      });
    } catch (err: any) {
      const msg = String(err?.message || err);
      // Return concise provider error when DEBUG_EMAIL is on (helps you fix creds/host quickly)
      return send(event, 500, {
        success: false,
        message: 'Failed to send email. Please try again later.',
        ...(DEBUG_EMAIL ? { error: msg } : {}),
      });
    }
  }

  // 404
  return send(event, 404, { success: false, message: `Not found: ${method} ${route}` });
};
