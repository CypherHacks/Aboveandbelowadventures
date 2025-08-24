// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FiSend,
  FiUser,
  FiMail,
  FiMessageSquare,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiClock,
  FiGlobe,
  FiInstagram,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaFacebook, FaWhatsapp, FaTripadvisor } from 'react-icons/fa';

type ApiError = { msg: string; param: string };

const ContactPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || '/.netlify/functions/api';

  // Map embed via deterministic lat/lng (no PB, no API key)
  const EMBED_COORDS = { lat: 29.528769, lng: 35.000269 };

  // Public-facing details (display only)
  const contactInfo = {
    email: 'aboveandbelowadventures@gmail.com',
    phone: '+962 79 723 7623',
    address: 'The Royal Yacht Club of Jordan, Aqaba 77110',
    hours: 'Mon - Sun: 9:00 AM – 8:00 PM',
    website: 'www.aboveandbelowadventuresjo.com',
    // Match the embed location so buttons open the same spot
    coordinates: EMBED_COORDS,
  };

  // Social links (edit these)
  const socials = {
    instagram:
      'https://www.instagram.com/above_and_below_adventures/?igsh=MW9keDg1enE3amxtbg%3D%3D#',
    facebook: 'https://www.facebook.com/aboveandbelow.info/',
    tripadvisor:
      'https://www.tripadvisor.com/Attraction_Review-g298101-d7368530-Reviews-Above_and_Below_Adventures_Day_Tours-Aqaba_Al_Aqabah_Governorate.html',
    whatsappPhone: '+962 79 723 7623', // must include country code
    whatsappMessage: 'Hello! I’d like to plan a trip with Above & Below Adventures.',
  };
  const whatsappDigits = socials.whatsappPhone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    socials.whatsappMessage
  )}`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mapsSrc = `https://www.google.com/maps?q=${EMBED_COORDS.lat},${EMBED_COORDS.lng}&z=18&hl=en&output=embed&t=k&v=2`;

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email))
      newErrors.email = 'Please enter a valid email';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10)
      newErrors.message = 'Message should be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // API might return { errors: [{ msg, param }, ...] } or { message: '...' }
        if (data?.errors?.length) {
          const fieldErrors: Record<string, string> = {};
          (data.errors as ApiError[]).forEach((e: ApiError) => {
            if (e.param) fieldErrors[e.param] = e.msg;
          });
          if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
        }
        setServerError(
          data?.message || 'Failed to send message. Please try again.'
        );
        setIsSuccess(false);
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Auto-hide success after a few seconds
      setTimeout(() => setIsSuccess(false), 6000);
    } catch {
      setServerError(
        'Network error. Please check your connection and try again.'
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buttons (Open in Maps / Directions)
  const openUrl = contactInfo.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${contactInfo.coordinates.lat},${contactInfo.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`;

  const directionsUrl = contactInfo.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${contactInfo.coordinates.lat},${contactInfo.coordinates.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactInfo.address)}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Sticky quick actions (mobile only) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30">
          <div className="mx-3 mb-3 rounded-2xl shadow-xl border border-white/10 overflow-hidden backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/50">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 text-white text-sm active:opacity-80"
                aria-label="Call us"
              >
                <FiPhone />
                <span>Call</span>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-white text-sm active:opacity-80"
                aria-label="Chat on WhatsApp"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
              <a
                href={directionsUrl}
                className="flex items-center justify-center gap-2 py-3 text-white text-sm active:opacity-80"
                aria-label="Get directions"
              >
                <FiMapPin />
                <span>Go</span>
              </a>
            </div>
          </div>
        </nav>

        <section className="relative px-4 pt-12 pb-28 sm:pb-20 md:py-20">
          <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Contact <span className="text-cyan-400">Above &amp; Below</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
              Questions, custom trips, or group bookings? Send us a message and we’ll get back quickly.
            </p>

            {/* Live regions for a11y */}
            <div
              aria-live="polite"
              className="sr-only"
            >
              {isSuccess ? 'Message sent successfully!' : serverError || ''}
            </div>

            {isSuccess && (
              <div
                className="mt-5 inline-flex items-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-4 py-2"
                role="status"
              >
                <FiCheckCircle className="mr-2" />
                <span>Message sent successfully! We’ll reply shortly.</span>
              </div>
            )}
            {serverError && (
              <div
                className="mt-5 inline-flex items-center rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 px-4 py-2"
                role="alert"
              >
                <FiAlertTriangle className="mr-2" />
                <span>{serverError}</span>
              </div>
            )}
          </div>

          {/* 2 / 3 split on large screens */}
          <div className="grid gap-8 sm:gap-10 max-w-7xl mx-auto lg:grid-cols-5">
            {/* Contact Information Card (2/5) */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl rounded-2xl p-5 sm:p-7 md:p-8 border border-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-7 flex items-center">
                  <FiPhone className="mr-3 text-cyan-400 shrink-0" />
                  Get in Touch
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {/* Email row */}
                  <div className="w-full min-h-[60px] sm:min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiMail className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm">Email</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        title={contactInfo.email}
                        className="block text-white hover:text-cyan-400 transition-colors font-medium truncate text-sm sm:text-base"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone row */}
                  <div className="w-full min-h-[60px] sm:min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiPhone className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm">Phone</p>
                      <a
                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                        className="block text-white hover:text-cyan-400 transition-colors font-medium truncate text-sm sm:text-base"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  {/* Address row */}
                  <div className="w-full min-h-[60px] sm:min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiMapPin className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm">Address</p>
                      <p className="text-white font-medium truncate text-sm sm:text-base">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  {/* Hours row */}
                  <div className="w-full min-h-[60px] sm:min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiClock className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm">Hours</p>
                      <p className="text-white font-medium truncate text-sm sm:text-base">
                        {contactInfo.hours}
                      </p>
                    </div>
                  </div>

                  {/* Website row */}
                  <div className="w-full min-h-[60px] sm:min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiGlobe className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs sm:text-sm">Website</p>
                      <a
                        href={`https://${contactInfo.website.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-white hover:text-cyan-400 transition-colors font-medium truncate text-sm sm:text-base"
                        title={contactInfo.website}
                      >
                        {contactInfo.website}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Socials */}
                <div className="mt-5 sm:mt-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <a
                      href={socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit our Facebook"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm"
                    >
                      <FaFacebook />
                      <span>Facebook</span>
                    </a>

                    <a
                      href={socials.tripadvisor}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Read our Tripadvisor reviews"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm"
                    >
                      <FaTripadvisor />
                      <span>Tripadvisor</span>
                    </a>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Message us on WhatsApp"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-200 transition-colors text-sm"
                    >
                      <FaWhatsapp />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="See our Instagram"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm"
                    >
                      <FiInstagram />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map + Contact Form (3/5) */}
            <div className="lg:col-span-3">
              {/* Map card */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl rounded-2xl p-5 sm:p-7 md:p-8 border border-green-500/10 hover:shadow-green-500/20 transition-all duration-500">
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <FiMapPin className="mr-3 text-green-400 shrink-0" />
                  Find Us Here
                </h3>

                {/* Responsive aspect-ratio map */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-green-500/20 aspect-[4/3] sm:aspect-[16/9]">
                  <iframe
                    src={mapsSrc}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Above & Below Adventures Map"
                  ></iframe>
                </div>

                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  <a
                    href={openUrl}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 px-5 py-3 rounded-xl text-white font-medium hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-[1.02] w-full sm:w-auto"
                  >
                    <span role="img" aria-label="map">
                      🗺️
                    </span>
                    <span>Open in Google Maps</span>
                  </a>
                  <a
                    href={directionsUrl}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 rounded-xl text-white font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all transform hover:scale-[1.02] w-full sm:w-auto"
                  >
                    <span role="img" aria-label="compass">
                      🧭
                    </span>
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="mt-8 sm:mt-10 md:mt-12 bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl rounded-2xl p-5 sm:p-7 md:p-8 border border-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500">
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <FiSend className="mr-3 text-purple-400 shrink-0" />
                  Send Us a Message
                </h3>

                <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-gray-300 mb-1 font-medium text-sm sm:text-base"
                      >
                        Name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiUser />
                        </span>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          autoComplete="name"
                          inputMode="text"
                          className={`w-full text-base pl-10 pr-3 py-3 rounded-xl bg-white/7.5 backdrop-blur border ${
                            errors.name ? 'border-rose-500/50' : 'border-white/10'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-white`}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                      </div>
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-rose-300">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-300 mb-1 font-medium text-sm sm:text-base"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiMail />
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                          inputMode="email"
                          className={`w-full text-base pl-10 pr-3 py-3 rounded-xl bg-white/7.5 backdrop-blur border ${
                            errors.email ? 'border-rose-500/50' : 'border-white/10'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-white`}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                      </div>
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-rose-300">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="subject"
                        className="block text-gray-300 mb-1 font-medium text-sm sm:text-base"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Trip type, dates, or topic"
                        autoComplete="off"
                        inputMode="text"
                        className={`w-full text-base px-3 py-3 rounded-xl bg-white/7.5 backdrop-blur border ${
                          errors.subject ? 'border-rose-500/50' : 'border-white/10'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-white`}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                      />
                      {errors.subject && (
                        <p id="subject-error" className="mt-1 text-sm text-rose-300">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="message"
                        className="block text-gray-300 mb-1 font-medium text-sm sm:text-base"
                      >
                        Message
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-3 text-gray-400">
                          <FiMessageSquare />
                        </span>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Tell us about your trip, ideas, or any questions you have..."
                          className={`w-full text-base pl-10 pr-3 py-3 rounded-xl bg-white/7.5 backdrop-blur border ${
                            errors.message ? 'border-rose-500/50' : 'border-white/10'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-white resize-y`}
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? 'message-error' : undefined}
                        />
                      </div>
                      {errors.message && (
                        <p id="message-error" className="mt-1 text-sm text-rose-300">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 rounded-xl text-white font-medium hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                      aria-label={isSubmitting ? 'Sending message' : 'Send message'}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FiSend aria-hidden="true" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    {isSuccess && (
                      <span className="text-emerald-300 inline-flex items-center gap-1">
                        <FiCheckCircle /> Sent!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Alternative Contact Methods */}
          <div className="mt-12 sm:mt-16">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 px-4 sm:px-6 py-3 rounded-2xl border border-white/10">
                <span className="text-white/70 text-sm">Prefer chat?</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors text-sm"
                >
                  <FaWhatsapp />
                  <span>WhatsApp us</span>
                </a>
                <span className="hidden sm:inline text-white/40">•</span>
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm"
                >
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
                <span className="hidden sm:inline text-white/40">•</span>
                <a
                  href={socials.tripadvisor}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors text-sm"
                >
                  <FaTripadvisor />
                  <span>Tripadvisor</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
