import React, { useState } from 'react';

type ApiError = { msg: string; param: 'name' | 'email' | 'subject' | 'message' };

const API_BASE_URL = import.meta.env?.VITE_API_URL || '/api';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<boolean | null>(null);

  const resetAlerts = () => {
    setGlobalError(null);
    setSuccess(null);
    setFieldErrors({});
    setSkipped(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAlerts();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('Server returned non-JSON. Check Netlify redirects and function path.');
      }

      if (!res.ok) {
        if (data?.errors?.length) {
          const errs: Record<string, string> = {};
          (data.errors as ApiError[]).forEach((e) => (errs[e.param] = e.msg));
          setFieldErrors(errs);
        }
        throw new Error(data?.message || 'Request failed');
      }

      setSuccess(data?.message || 'Message sent successfully!');
      setSkipped(Boolean(data?.skipped));
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setGlobalError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white/80 dark:bg-neutral-900/60 shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>

        {globalError && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {globalError}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}
        {skipped && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800">
            Heads up: email sending is <b>disabled</b> (SMTP not configured). The form was received, but no email was sent.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring
                ${fieldErrors.name ? 'border-red-400' : 'border-neutral-300'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              minLength={2}
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring
                ${fieldErrors.email ? 'border-red-400' : 'border-neutral-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring
                ${fieldErrors.subject ? 'border-red-400' : 'border-neutral-300'}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              required
              minLength={5}
            />
            {fieldErrors.subject && <p className="text-xs text-red-600 mt-1">{fieldErrors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="message">Message</label>
            <textarea
              id="message"
              className={`w-full min-h-[120px] rounded-lg border px-3 py-2 outline-none focus:ring
                ${fieldErrors.message ? 'border-red-400' : 'border-neutral-300'}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              required
              minLength={10}
            />
            {fieldErrors.message && <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        <div className="mt-6 text-xs text-neutral-500 space-y-1">
          <p>API Base: <code>{API_BASE_URL}</code></p>
          <p>Debug SMTP: <code>{API_BASE_URL}/debug/smtp</code></p>
          <p>Tip: run <code>netlify dev</code> for local proxy of <code>/api</code> → function.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
