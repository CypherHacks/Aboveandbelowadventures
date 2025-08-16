// netlify/functions/api.js
// Force SendGrid only. If SENDGRID_API_KEY is missing or sender isn't verified, we fail clearly.
const sgMail = require('@sendgrid/mail');

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

// ---------- SendGrid only ----------
const requireSendGrid = () => {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
  const to = process.env.RECIPIENT_EMAIL || from;
  const bcc = process.env.BCC_EMAIL;
  if (!key) throw new Error('SENDGRID_API_KEY is not set');
  if (!from) throw new Error('FROM_EMAIL (or SENDGRID_FROM) is required and must be a VERIFIED Single Sender in SendGrid');
  sgMail.setApiKey(key);
  return { from, to, bcc };
};

const sendViaSendGrid = async (payload) => {
  const { from, to, bcc } = requireSendGrid();

  const msg = {
    to,
    from,                // MUST be your verified sender
    subject: `New Contact: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].join('\n'),
    reply_to: payload.email,
    mailSettings: { sandboxMode: { enable: false } }, // real send
  };
  if (bcc) msg.bcc = bcc;

  const resp = await sgMail.send(msg);
  return { method: 'sendgrid', statusCode: resp[0]?.statusCode || null };
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

  // Provider check (always sendgrid in this forced version)
  if (method === 'GET' && route === '/debug/provider') {
    const present = Boolean(process.env.SENDGRID_API_KEY);
    return json(event, 200, {
      provider: 'sendgrid',
      sendgrid: {
        present,
        from: process.env.FROM_EMAIL || process.env.SENDGRID_FROM || null,
        to: process.env.RECIPIENT_EMAIL || process.env.FROM_EMAIL || null,
        bcc: process.env.BCC_EMAIL || null,
      },
    });
  }

  // SendGrid sandbox test (no real delivery)
  if (method === 'GET' && route === '/debug/sendgrid') {
    try {
      const { from, to } = requireSendGrid();
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
      const result = await sendViaSendGrid({
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject.trim(),
        message: body.message.trim(),
      });

      return json(event, 200, {
        success: true,
        provider: result.method,
        info: { statusCode: result.statusCode },
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
