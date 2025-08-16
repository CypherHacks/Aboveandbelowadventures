// netlify/functions/api.js
// SendGrid-only sender with debug routes (sandbox + live). CommonJS for Netlify.
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
    'Content-Type:': 'application/json', // keep classic header too
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

const sendViaSendGrid = async ({ subject, text, replyTo, bcc, sandbox = false }) => {
  const { from, to } = requireSendGrid();
  const msg = {
    to,
    from, // must be your verified Single Sender
    subject,
    text,
    mailSettings: { sandboxMode: { enable: sandbox } },
  };
  if (replyTo) msg.reply_to = replyTo;
  if (bcc) msg.bcc = bcc;

  const resp = await sgMail.send(msg);
  const statusCode = resp[0]?.statusCode || null;
  const headers = resp[0]?.headers || {};
  const messageId =
    headers['x-message-id'] ||
    headers['X-Message-Id'] ||
    headers['x-messageid'] ||
    headers['X-MessageID'] ||
    null;

  return { statusCode, messageId };
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

  // SendGrid sandbox test — no real delivery
  if (method === 'GET' && route === '/debug/sendgrid') {
    try {
      const data = await sendViaSendGrid({
        subject: 'SendGrid sandbox verify',
        text: 'This is a sandbox verification — no real delivery.',
        sandbox: true,
      });
      return json(event, 200, { ok: true, ...data });
    } catch (err) {
      return json(event, 200, { ok: false, error: String(err?.message || err) });
    }
  }

  // LIVE test — sends a real message (use this to confirm delivery)
  if (method === 'GET' && route === '/debug/sendgrid/live') {
    try {
      const bcc = process.env.BCC_EMAIL || undefined;
      const now = new Date().toISOString();
      const data = await sendViaSendGrid({
        subject: `SendGrid LIVE test ${now}`,
        text: `Live test at ${now}. If you see this, SendGrid is delivering.`,
        sandbox: false,
        bcc,
      });
      return json(event, 200, { ok: true, live: true, ...data });
    } catch (err) {
      return json(event, 200, { ok: false, live: true, error: String(err?.message || err) });
    }
  }

  // Contact submission
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
      const bcc = process.env.BCC_EMAIL || undefined;
      const result = await sendViaSendGrid({
        subject: `New Contact: ${body.subject.trim()}`,
        text: [
          `Name: ${body.name.trim()}`,
          `Email: ${body.email.trim()}`,
          `Subject: ${body.subject.trim()}`,
          '',
          body.message.trim(),
        ].join('\n'),
        replyTo: body.email.trim(),
        bcc,
        sandbox: false,
      });

      return json(event, 200, {
        success: true,
        provider: 'sendgrid',
        info: { statusCode: result.statusCode, messageId: result.messageId },
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
