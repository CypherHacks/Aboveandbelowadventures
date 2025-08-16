// netlify/functions/api.js
// Gmail SMTP (App Password) only. Nodemailer + debug routes. CommonJS for Netlify.
const nodemailer = require('nodemailer');

// ---------- CORS ----------
const parseAllowed = (raw) =>
  (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const corsOrigin = (event) => {
  const allowed = parseAllowed(process.env.ALLOWED_ORIGINS);
  const reqOrigin = event.headers?.origin || event.headers?.Origin || '';
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

// ---------- Gmail SMTP ----------
const envSMTP = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure = String(process.env.EMAIL_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.RECIPIENT_EMAIL || user;
  const from = user; // Gmail requires the from to be the authenticated user (or alias)
  return { host, port, secure, user, pass, to, from };
};

const smtpConfigured = (c) => Boolean(c.host && c.port && c.user && c.pass);
const buildSMTPTransporter = (c) => {
  if (!smtpConfigured(c)) return null;
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,          // true on 465 (SSL), false on 587 (STARTTLS)
    requireTLS: !c.secure,     // enforce STARTTLS when secure=false
    auth: { user: c.user, pass: c.pass },
    tls: { minVersion: 'TLSv1.2', servername: c.host },
  });
};

const sendViaGmail = async ({ subject, text, replyTo }) => {
  const cfg = envSMTP();
  if (!smtpConfigured(cfg)) throw new Error('Gmail SMTP not fully configured. Set EMAIL_* env vars.');
  const transporter = buildSMTPTransporter(cfg);

  // Verify first (surfaces auth/connection errors clearly)
  await transporter.verify();

  const info = await transporter.sendMail({
    from: cfg.from,
    to: cfg.to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  return {
    messageId: info.messageId || null,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    response: info.response || null,
  };
};

// ---------- Handler ----------
exports.handler = async (event) => {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const route = routeFrom(event);

  // Preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { ...corsHeaders(event) }, body: '' };
  }

  // Health
  if (method === 'GET' && (route === '/' || route === '/health')) {
    return json(event, 200, { ok: true, message: 'API is healthy.' });
  }

  // Provider debug
  if (method === 'GET' && route === '/debug/provider') {
    const c = envSMTP();
    return json(event, 200, {
      provider: 'gmail-smtp',
      smtp: {
        configured: smtpConfigured(c),
        host: c.host,
        port: c.port,
        secure: c.secure,
        userPresent: Boolean(c.user),
        passPresent: Boolean(c.pass),
        to: c.to,
        from: c.from,
      },
    });
  }

  // SMTP verify
  if (method === 'GET' && route === '/debug/smtp') {
    try {
      const c = envSMTP();
      if (!smtpConfigured(c)) {
        return json(event, 200, {
          ok: true,
          configured: false,
          present: { host: !!c.host, port: !!c.port, user: !!c.user, pass: !!c.pass },
          effective: { host: c.host, port: c.port, secure: c.secure, to: c.to, from: c.from },
          note: 'Set EMAIL_* env vars and redeploy.',
        });
      }
      const transporter = buildSMTPTransporter(c);
      await transporter.verify();
      return json(event, 200, {
        ok: true,
        configured: true,
        verify: 'ok',
        effective: { host: c.host, port: c.port, secure: c.secure, to: c.to, from: c.from },
      });
    } catch (err) {
      return json(event, 200, { ok: false, configured: true, verify: 'fail', error: String(err?.message || err) });
    }
  }

  // LIVE test — sends a real email now
  if (method === 'GET' && route === '/debug/gmail/live') {
    try {
      const now = new Date().toISOString();
      const info = await sendViaGmail({
        subject: `Gmail LIVE test ${now}`,
        text: `Live test at ${now}. If you see this, Gmail SMTP is delivering.`,
      });
      return json(event, 200, { ok: true, live: true, info });
    } catch (err) {
      return json(event, 200, { ok: false, live: true, error: String(err?.message || err) });
    }
  }

  // Contact submit
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
      const info = await sendViaGmail({
        subject: `New Contact: ${body.subject.trim()}`,
        text: [
          `Name: ${body.name.trim()}`,
          `Email: ${body.email.trim()}`,
          `Subject: ${body.subject.trim()}`,
          '',
          body.message.trim(),
        ].join('\n'),
        replyTo: body.email.trim(),
      });

      return json(event, 200, {
        success: true,
        provider: 'gmail-smtp',
        info,
        message: 'Thanks! Your message has been sent.',
      });
    } catch (err) {
      const msg = String(err?.message || err);
      const debug = String(process.env.DEBUG_EMAIL || '').toLowerCase() === 'true';
      return json(event, 500, { success: false, message: 'Failed to send email.', ...(debug ? { error: msg } : {}) });
    }
  }

  return json(event, 404, { success: false, message: `Not found: ${method} ${route}` });
};
