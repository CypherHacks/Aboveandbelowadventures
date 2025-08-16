// netlify/functions/api.ts
import type { Handler, HandlerEvent } from '@netlify/functions';
import nodemailer from 'nodemailer';

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const reply = (statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) => ({
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

const routeFrom = (event: HandlerEvent) => {
  // ex: "/.netlify/functions/api/contact" -> "/contact"
  const raw = event.path || '/';
  const cleaned = raw.replace(/^\/\.netlify\/functions\/api/, '');
  return cleaned || '/';
};

const getSMTPConfig = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    TO_EMAIL,
    FROM_EMAIL,
  } = process.env;

  const present = {
    host: !!SMTP_HOST,
    port: !!SMTP_PORT,
    user: !!SMTP_USER,
    pass: !!SMTP_PASS,
  };

  return {
    present,
    values: {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === 'true', // true for 465, false for 587 (STARTTLS)
      user: SMTP_USER,
      pass: SMTP_PASS,
      to: TO_EMAIL || SMTP_USER,
      from: FROM_EMAIL || (SMTP_USER ? `Website Contact <${SMTP_USER}>` : undefined),
    },
  };
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

const buildTransporter = () => {
  const { present, values } = getSMTPConfig();

  // If any core field missing, skip sending (dev-friendly)
  if (!present.host || !present.port || !present.user || !present.pass) {
    console.warn('[api] SMTP not fully configured — will skip real send.');
    return { transporter: null as nodemailer.Transporter | null, values };
  }

  const transporter = nodemailer.createTransport({
    host: values.host,
    port: values.port,
    secure: values.secure, // 465=true, 587=false
    auth: { user: values.user, pass: values.pass },
  });

  return { transporter, values };
};

const sendEmail = async (payload: Required<ContactBody>) => {
  const { transporter, values } = buildTransporter();

  if (!transporter) {
    return { skipped: true as const, info: null };
  }

  // Verify SMTP credentials/connectivity
  await transporter.verify();

  const info = await transporter.sendMail({
    from: values.from,
    to: values.to,
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    replyTo: payload.email, // DO NOT set "from" to user email (DMARC/SPF)
  });

  return { skipped: false as const, info: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected } };
};

export const handler: Handler = async (event) => {
  const method = event.httpMethod.toUpperCase();
  const route = routeFrom(event);

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

  // Health
  if (method === 'GET' && (route === '/' || route === '/health')) {
    return reply(200, { ok: true, message: 'API is healthy.' });
  }

  // Quick SMTP debug (no secrets leaked)
  // GET /debug/smtp -> { present: {host,port,user,pass}, secure, port, to, from, verify: 'ok'|'fail' }
  if (method === 'GET' && route === '/debug/smtp') {
    try {
      const { present, values } = getSMTPConfig();
      if (!present.host || !present.port || !present.user || !present.pass) {
        return reply(200, {
          ok: true,
          configured: false,
          present,
          details: 'One or more SMTP env vars are missing. Configure them then redeploy.',
        });
      }
      const transporter = nodemailer.createTransport({
        host: values.host,
        port: values.port,
        secure: values.secure,
        auth: { user: values.user!, pass: values.pass! },
      });
      await transporter.verify();
      return reply(200, {
        ok: true,
        configured: true,
        present,
        effective: { port: values.port, secure: values.secure, to: values.to, from: values.from },
        verify: 'ok',
      });
    } catch (err: any) {
      console.error('[api] SMTP verify failed:', err?.message || err);
      const { present, values } = getSMTPConfig();
      return reply(200, {
        ok: false,
        configured: true,
        present,
        effective: { port: values.port, secure: values.secure, to: values.to, from: values.from },
        verify: 'fail',
        error: String(err?.message || err),
      });
    }
  }

  // Contact
  if (method === 'POST' && route === '/contact') {
    if (!event.body) return reply(400, { success: false, message: 'Missing body' });

    let body: ContactBody;
    try {
      body = JSON.parse(event.body);
    } catch {
      return reply(400, { success: false, message: 'Invalid JSON body' });
    }

    const errors = validate(body);
    if (errors.length) return reply(400, { success: false, message: 'Validation error', errors });

    try {
      const result = await sendEmail({
        name: body.name!.trim(),
        email: body.email!.trim(),
        subject: body.subject!.trim(),
        message: body.message!.trim(),
      });

      return reply(200, {
        success: true,
        skipped: result.skipped,
        info: result.info,
        message: result.skipped
          ? 'Form received — email sending is disabled (SMTP not configured).'
          : 'Thanks! Your message has been sent.',
      });
    } catch (err) {
      console.error('[api] Email send failed:', err);
      return reply(500, { success: false, message: 'Failed to send email. Please try again later.' });
    }
  }

  return reply(404, { success: false, message: `Not found: ${method} ${route}` });
};
