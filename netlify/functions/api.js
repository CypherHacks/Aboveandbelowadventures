// netlify/functions/api.js
const nodemailer = require('nodemailer');

// Lazy requires for optional providers so build doesn't fail if libs missing
let sgMail = null;

// ---------- CORS ----------
const parseAllowed = (raw) =>
  (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const corsOrigin = (event) => {
  const allowed = parseAllowed(process.env.ALLOWED_ORIGINS);
  const reqOrigin =
    event.headers?.origin ||
    event.headers?.Origin ||
    '';
  if (allowed.length === 0) return '*';
  if (!reqOrigin) return allowed[0];
  return allowed.includes(reqOrigin) ? reqOrigin : allowed[0];
};

const corsHeaders = (event) => ({
  'Access-Control-Allow-Origin': corsOrigin(event),
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
});

const json = (event, statusCode, data, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders(event),
    ...extraHeaders,
  },
  body: JSON.stringify(data),
});

const routeFrom = (event) => {
  const raw = event.path || '/';
  const cleaned = raw.replace(/^\/\.netlify\/functions\/api/, '');
  return cleaned || '/';
};

// ---------- Validation ----------
const validate = (b) => {
  const e = [];
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
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
  const secureFlag = String(process.env.EMAIL_SECURE ?? process.env.SMTP_SECURE ?? '').toLowerCase();
  const secure = secureFlag === 'true'; // 465 => true, 587 => false (STARTTLS)
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const to = process.env.RECIPIENT_EMAIL || process.env.TO_EMAIL || user;
  const from = process.env.FROM_EMAIL || (user ? `Website Contact <${user}>` : undefined);
  return { host, port, secure, user, pass, to, from };
};
const smtpConfigured = (c) => Boolean(c.host && c.port && c.user && c.pass);
const buildSMTPTransporter = (c) => {
  if (!smtpConfigured(c)) return null;
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,      // false on 587 -> STARTTLS
    requireTLS: !c.secure, // enforce STARTTLS when secure=false
    auth: { user: c.user, pass: c.pass },
    tls: { minVersion: 'TLSv1.2', servername: c.host },
  });
};

const hasSendgrid = () => Boolean(process.env.SENDGRID_API_KEY);
const provider = () => (hasSendgrid() ? 'sendgrid' : 'smtp');

const DEBUG_EMAIL = String(process.env.DEBUG_EMAIL || '').toLowerCase() === 'true';

// ---------- Senders ----------
const sendViaSMTP = async (payload) => {
  const cfg = envSMTP();
  const transporter = buildSMTPTransporter(cfg);
  if (!transporter) {
    return { method: 'smtp', skipped: true, info: null, error: 'SMTP not fully configured' };
  }
  // verify first (Outlook will throw 535 here if blocked)
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
  return { method: 'smtp', skipped: false, info: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected } };
};

const sendViaSendgrid = async (payload) => {
  if (!sgMail) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
  const to = process.env.RECIPIENT_EMAIL || from;
  if (!from) throw new Error('FROM_EMAIL (or SENDGRID_FROM) is required for SendGrid');

  const msg = {
    to,
    from, // must be a VERIFIED Single Sender or from a verified domain in SendGrid
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

  const resp = await sgMail.send(msg);
  return { method: 'sendgrid', skipped: false, info: { statusCode: resp[0]?.statusCode } };
};

const sendEmail = async (payload) => {
  const p = provider();
  if (p === 'sendgrid') return sendViaSendgrid(payload);
  return sendViaSMTP(payload);
};

// ---------- Handler ----------
exports.handler = async (event) => {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const route = routeFrom(event);

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { ...corsHeaders(event) }, body: '' };
  }

  // Health
  if (method === 'GET' && (route === '/' || route === '/health')) {
    return json(event, 200, { ok: true, message: 'API is healthy.' });
  }

  // Provider debug
  if (method === 'GET' && route === '/debug/provider') {
    const smtp = envSMTP();
    return json(event, 200, {
      provider: provider(),
      sendgrid: { present: hasSendgrid() },
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

  // SendGrid sandbox test
  if (method === 'GET' && route === '/debug/sendgrid') {
    try {
      if (!hasSendgrid()) return json(event, 200, { ok: false, reason: 'SENDGRID_API_KEY not set' });
      if (!sgMail) {
        sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      }
      const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
      const to = process.env.RECIPIENT_EMAIL || from;
      if (!from) return json(event, 200, { ok: false, reason: 'FROM_EMAIL (or SENDGRID_FROM) is required' });

      const resp = await sgMail.send({
        to,
        from,
        subject: 'SendGrid sandbox verify',
        text: 'This is a sandbox verification — no real delivery.',
        mailSettings: { sandboxMode: { enable: true } },
      });

      return json(event, 200, { ok: true, statusCode: resp[0]?.statusCode || null });
    } catch (err) {
      return json(event, 200, { ok: false, error: String(err?.message || err) });
    }
  }

  // SMTP debug
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
      const transporter = buildSMTPTransporter(cfg);
      await transporter.verify();
      return json(event, 200, {
        ok: true,
        configured: true,
        verify: 'ok',
        effective: { host: cfg.host, port: cfg.port, secure: cfg.secure, to: cfg.to, from: cfg.from },
      });
    } catch (err) {
      return json(event, 200, { ok: false, configured: true, verify: 'fail', error: String(err?.message || err) });
    }
  }

  // Contact
  if (method === 'POST' && route === '/contact') {
    if (!event.body) return json(event, 400, { success: false, message: 'Missing body' });

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return json(event, 400, { success: false, message: 'Invalid JSON body' });
    }

    const errors = validate(body);
    if (errors.length) return json(event, 400, { success: false, message: 'Validation error', errors });

    try {
      const result = await sendEmail({
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject.trim(),
        message: body.message.trim(),
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
    } catch (err) {
      const msg = String(err?.message || err);
      return json(event, 500, { success: false, message: 'Failed to send email. Please try again later.', ...(DEBUG_EMAIL ? { error: msg } : {}) });
    }
  }

  return json(event, 404, { success: false, message: `Not found: ${method} ${route}` });
};
