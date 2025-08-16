// netlify/functions/api.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import nodemailer from 'nodemailer';

// Lazy requires for optional providers so build doesn't explode if not installed
let sendgridMail: any = null;
let ResendClient: any = null;

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

const json = (event: HandlerEvent, statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) => ({
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

// ---------- Provider config ----------
const envSMTP = () => {
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
const smtpConfigured = (c: ReturnType<typeof envSMTP>) => Boolean(c.host && c.port && c.user && c.pass);
const buildSMTPTransporter = (c: ReturnType<typeof envSMTP>) => {
  if (!smtpConfigured(c)) return null;
  return nodemailer.createTransport({
    host: c.host!,
    port: c.port!,
    secure: c.secure,      // false on 587 -> STARTTLS
    requireTLS: !c.secure, // enforce STARTTLS when secure=false
    auth: { user: c.user!, pass: c.pass! },
    tls: { minVersion: 'TLSv1.2', servername: c.host },
  });
};

const hasSendgrid = () => Boolean(process.env.SENDGRID_API_KEY);
const hasResend = () => Boolean(process.env.RESEND_API_KEY);
const provider = () => (hasSendgrid() ? 'sendgrid' : hasResend() ? 'resend' : 'smtp') as
  | 'sendgrid'
  | 'resend'
  | 'smtp';

const DEBUG_EMAIL = String(process.env.DEBUG_EMAIL || '').toLowerCase() === 'true';

// ---------- Senders ----------
const sendViaSMTP = async (payload: Required<ContactBody>) => {
  const cfg = envSMTP();
  const transporter = buildSMTPTransporter(cfg);
  if (!transporter) {
    return { method: 'smtp' as const, skipped: true, info: null, error: 'SMTP not fully configured' };
  }
  // verify first (this is where Outlook throws 535)
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
    replyTo: payload.email,
  });
  return { method: 'smtp' as const, skipped: false, info: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected } };
};

const sendViaSendgrid = async (payload: Required<ContactBody>) => {
  if (!sendgridMail) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sendgridMail = require('@sendgrid/mail');
    sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  // IMPORTANT: FROM must match a verified Single Sender (or a verified domain)
  const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
  const to = process.env.RECIPIENT_EMAIL || from;
  if (!from) throw new Error('FROM_EMAIL (or SENDGRID_FROM) is required for SendGrid');

  const msg = {
    to,
    from, // must be VERIFIED in SendGrid (Single Sender is OK)
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    reply_to: payload.email,
  };

  const resp = await sendgridMail.send(msg);
  return { method: 'sendgrid' as const, skipped: false, info: { statusCode: resp[0]?.statusCode } };
};

const sendViaResend = async (payload: Required<ContactBody>) => {
  if (!ResendClient) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ResendClient = require('resend').Resend;
  }
  const resend = new ResendClient(process.env.RESEND_API_KEY);
  const from = process.env.FROM_EMAIL || 'contact@your-domain.com'; // must be a verified sender/domain in Resend
  const to = process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER;
  const result = await resend.emails.send({
    from,
    to: [to!],
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    reply_to: payload.email,
  });
  if ((result as any).error) throw new Error(String((result as any).error));
  return { method: 'resend' as const, skipped: false, info: { id: (result as any).data?.id } };
};

// Combined sender — prefers SendGrid, then Resend, then SMTP
const sendEmail = async (payload: Required<ContactBody>) => {
  const p = provider();
  if (p === 'sendgrid') return sendViaSendgrid(payload);
  if (p === 'resend') return sendViaResend(payload);
  return sendViaSMTP(payload);
};

// ---------- handler ----------
export const handler: Handler = async (event) => {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const route = routeFrom(event);

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { ...corsHeaders(event) }, body: '' };
  }

  if (method === 'GET' && (route === '/' || route === '/health')) {
    return json(event, 200, { ok: true, message: 'API is healthy.' });
  }

  // Which provider will be used?
  if (method === 'GET' && route === '/debug/provider') {
    const smtp = envSMTP();
    return json(event, 200, {
      provider: provider(),
      sendgrid: { present: hasSendgrid() },
      resend: { present: hasResend() },
      smtp: {
        configured: smtpConfigured(smtp),
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        userPresent: Boolean(smtp.user),
        passPresent: Boolean(smtp.pass),
        to: smtp.to,
        from: smtp.from,
      },
    });
  }

  // SendGrid sandbox test — checks key + sender identity without actually delivering
  if (method === 'GET' && route === '/debug/sendgrid') {
    try {
      if (!hasSendgrid()) return json(event, 200, { ok: false, reason: 'SENDGRID_API_KEY not set' });
      if (!sendgridMail) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        sendgridMail = require('@sendgrid/mail');
        sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
      }
      const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
      const to = process.env.RECIPIENT_EMAIL || from;
      if (!from) return json(event, 200, { ok: false, reason: 'FROM_EMAIL (or SENDGRID_FROM) is required' });

      const resp = await sendgridMail.send({
        to,
        from, // must be verified Single Sender or domain
        subject: 'SendGrid sandbox verify',
        text: 'This is a sandbox verification — no real delivery.',
        mailSettings: { sandboxMode: { enable: true } },
      });

      return json(event, 200, { ok: true, statusCode: resp[0]?.statusCode || null });
    } catch (err: any) {
      return json(event, 200, { ok: false, error: String(err?.message || err) });
    }
  }

  // SMTP debug (kept for completeness)
  if (method === 'GET' && route === '/debug/smtp') {
    try {
      const cfg = envSMTP();
      if (!smtpConfigured(cfg)) {
        return json(event, 200, {
          ok: true,
          configured: false,
          present: { host: !!cfg.host, port: !!cfg.port, user: !!cfg.user, pass: !!cfg.pass },
          effective: { host: cfg.host, port: cfg.port, secure: cfg.secure, to: cfg.to, from: cfg.from },
          note: 'Set EMAIL_* (or SMTP_*) vars and redeploy.',
        });
      }
      const transporter = buildSMTPTransporter(cfg)!;
      await transporter.verify();
      return json(event, 200, {
        ok: true,
        configured: true,
        verify: 'ok',
        effective: { host: cfg.host, port: cfg.port, secure: cfg.secure, to: cfg.to, from: cfg.from },
      });
    } catch (err: any) {
      return json(event, 200, { ok: false, configured: true, verify: 'fail', error: String(err?.message || err) });
    }
  }

  // Contact handler
  if (method === 'POST' && route === '/contact') {
    if (!event.body) return json(event, 400, { success: false, message: 'Missing body' });

    let body: ContactBody;
    try {
      body = JSON.parse(event.body);
    } catch {
      return json(event, 400, { success: false, message: 'Invalid JSON body' });
    }

    const errors = validate(body);
    if (errors.length) return json(event, 400, { success: false, message: 'Validation error', errors });

    try {
      const result = await sendEmail({
        name: body.name!.trim(),
        email: body.email!.trim(),
        subject: body.subject!.trim(),
        message: body.message!.trim(),
      });

      return json(event, 200, {
        success: true,
        method: result.method,
        skipped: result.skipped ?? false,
        info: result.info ?? null,
        message: result.skipped
          ? 'Form received — email sending is disabled (provider not configured).'
          : 'Thanks! Your message has been sent.',
      });
    } catch (err: any) {
      const msg = String(err?.message || err);
      return json(event, 500, { success: false, message: 'Failed to send email. Please try again later.', ...(DEBUG_EMAIL ? { error: msg } : {}) });
    }
  }

  return json(event, 404, { success: false, message: `Not found: ${method} ${route}` });
};
