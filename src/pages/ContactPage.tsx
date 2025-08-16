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

  // Map embed (public "pb" string; no API key needed)
  const EMBED_PB_DEFAULT =
    '!1m14!1m12!1m3!1d259.6334850964639!2d35.00049877480332!3d29.528781598829834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sjo!4v1755376092024!5m2!1sen!2sjo';
  const MAPS_EMBED_PB =
    (import.meta.env.VITE_GOOGLE_MAPS_EMBED_PB as string | undefined) ||
    EMBED_PB_DEFAULT;

  // Public-facing details (display only)
  const contactInfo = {
    email: 'aboveandbelowadventures@gmail.com',
    phone: '+962 79 723 7623',
    address: 'The Royal Yacht Club of Jordan, Aqaba 77110',
    hours: 'Mon - Sun: 9:00 AM – 8:00 PM',
    website: 'www.aboveandbelowadventuresjo.com',
    // Match the embed location so buttons open the same spot
    coordinates: { lat: 29.528781598829834, lng: 35.00049877480332 },
  };

  // Social links (edit these)
  const socials = {
    instagram: 'https://www.instagram.com/above_and_below_adventures/?igsh=MW9keDg1enE3amxtbg%3D%3D#',
    facebook: 'https://www.facebook.com/aboveandbelow.info/',
    tripadvisor: 'https://www.tripadvisor.com/Attraction_Review-g298101-d7368530-Reviews-Above_and_Below_Adventures_Day_Tours-Aqaba_Al_Aqabah_Governorate.html', // e.g., https://www.tripadvisor.com/Attraction_Review-...
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

  // Buttons (Open in Maps / Directions)
  const openUrl = contactInfo.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${contactInfo.coordinates.lat},${contactInfo.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`;

  const directionsUrl = contactInfo.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${contactInfo.coordinates.lat},${contactInfo.coordinates.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactInfo.address)}`;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
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
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const apiErrors: ApiError[] | undefined = data?.errors;
        if (Array.isArray(apiErrors) && apiErrors.length) {
          const mapped: Record<string, string> = {};
          apiErrors.forEach((e) => (mapped[e.param] = e.msg));
          setErrors(mapped);
          setServerError('Please fix the highlighted fields and try again.');
        } else {
          setServerError(
            data?.message || 'Failed to send your message. Please try again.'
          );
        }
        setIsSuccess(false);
        return;
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 6000);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapsSrc = `https://www.google.com/maps/embed?pb=${MAPS_EMBED_PB}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-bounce" />
        </div>

        <section className="container mx-auto px-4 py-20 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full mb-6">
              <FiMail className="text-4xl text-cyan-400" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6 animate-pulse">
              Let&apos;s Connect
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ready to bring your ideas to life? Drop us a message and let&apos;s create something amazing together.
            </p>
          </div>

          {/* 2 / 3 split on large screens */}
          <div className="grid gap-12 max-w-7xl mx-auto lg:grid-cols-5">
            {/* Contact Information Card (2/5) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500">
                <h3 className="text-2xl font-bold text-white mb-6 md:mb-8 flex items-center">
                  <FiPhone className="mr-3 text-cyan-400" />
                  Get in Touch
                </h3>

                <div className="space-y-3 md:space-y-4">
                  {/* Email row */}
                  <div className="w-full min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-cyan-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <FiMail className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm">Email</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        title={contactInfo.email}
                        className="block text-white hover:text-cyan-400 transition-colors font-medium truncate"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone row */}
                  <div className="w-full min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-purple-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                      <FiPhone className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm">Phone</p>
                      <a
                        href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                        title={contactInfo.phone}
                        className="block text-white hover:text-purple-400 transition-colors font-medium truncate"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  {/* Address row */}
                  <div className="w-full min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-green-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                      <FiMapPin className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white font-medium truncate" title={contactInfo.address}>
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  {/* Hours row */}
                  <div className="w-full min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-yellow-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-lg">
                      <FiClock className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm">Business Hours</p>
                      <p className="text-white font-medium truncate" title={contactInfo.hours}>
                        {contactInfo.hours}
                      </p>
                    </div>
                  </div>

                  {/* Website row */}
                  <div className="w-full min-h-[64px] flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-indigo-500/10">
                    <div className="shrink-0 bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg">
                      <FiGlobe className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm">Website</p>
                      <p className="text-white font-medium truncate" title={contactInfo.website}>
                        {contactInfo.website}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Socials (Instagram + Facebook + Tripadvisor + WhatsApp) */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-4">Follow Us</p>
                  <div className="flex flex-wrap gap-4">
                    {/* Instagram */}
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 rounded-xl hover:scale-110 transition-transform"
                      aria-label="Instagram"
                      title="Instagram"
                    >
                      <FiInstagram className="text-white" />
                    </a>
                    {/* Facebook */}
                    <a
                      href={socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl hover:scale-110 transition-transform"
                      aria-label="Facebook"
                      title="Facebook"
                    >
                      <FaFacebook className="text-white" />
                    </a>
                    {/* Tripadvisor */}
                    <a
                      href={socials.tripadvisor}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl hover:scale-110 transition-transform"
                      aria-label="Tripadvisor"
                      title="Tripadvisor"
                    >
                      <FaTripadvisor className="text-white" />
                    </a>
                    {/* WhatsApp */}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl hover:scale-110 transition-transform"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                    >
                      <FaWhatsapp className="text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form + Map (3/5) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Success */}
              {isSuccess && (
                <div className="p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-500 p-2 rounded-full">
                      <FiCheckCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-green-100 font-bold text-lg">
                        Message sent successfully!
                      </h3>
                      <p className="text-green-200">
                        Thanks for reaching out. We&apos;ll get back to you shortly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Server Error */}
              {serverError && (
                <div className="p-6 bg-red-900/40 border border-red-500/40 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3 text-red-100">
                    <FiAlertTriangle className="text-xl" />
                    <p className="font-medium">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500"
                noValidate
              >
                <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
                  <FiMessageSquare className="mr-3 text-purple-400" />
                  Send us a Message
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-cyan-200 font-medium" htmlFor="name">
                      <FiUser className="mr-2" /> Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      aria-invalid={!!errors.name}
                      className={`w-full px-4 py-4 rounded-2xl bg-gray-700/50 text-white border transition-all focus:outline-none focus:ring-2 focus:scale-105 ${
                        errors.name
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-gray-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-cyan-200 font-medium" htmlFor="email">
                      <FiMail className="mr-2" /> Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={!!errors.email}
                      className={`w-full px-4 py-4 rounded-2xl bg-gray-700/50 text-white border transition-all focus:outline-none focus:ring-2 focus:scale-105 ${
                        errors.email
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-gray-600/50 focus:ring-purple-400/50 focus:border-purple-400/50'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="flex items-center text-cyan-200 font-medium" htmlFor="subject">
                    <FiMessageSquare className="mr-2" /> Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    aria-invalid={!!errors.subject}
                    className={`w-full px-4 py-4 rounded-2xl bg-gray-700/50 text-white border transition-all focus:outline-none focus:ring-2 focus:scale-105 ${
                      errors.subject
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-gray-600/50 focus:ring-pink-400/50 focus:border-pink-400/50'
                    }`}
                    placeholder="What can we help you with?"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-sm flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-8">
                  <label className="flex items-center text-cyan-200 font-medium" htmlFor="message">
                    <FiMessageSquare className="mr-2" /> Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={!!errors.message}
                    className={`w-full px-4 py-4 rounded-2xl bg-gray-700/50 text-white border transition-all focus:outline-none focus:ring-2 focus:scale-105 resize-none ${
                      errors.message
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-gray-600/50 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                    }`}
                    placeholder="Tell us about your trip, ideas, or any questions you have..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 ${
                    isSubmitting
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:from-cyan-400 hover:via-purple-500 hover:to-pink-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="text-xl" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              {/* Map (free Google public embed) */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl p-8 rounded-3xl border border-green-500/20 shadow-2xl shadow-green-500/10">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <FiMapPin className="mr-3 text-green-400" />
                  Find Us Here
                </h3>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-green-500/20">
                  <iframe
                    src={mapsSrc}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                    title="Location Map"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-2xl" />
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all transform hover:scale-105"
                  >
                    <FiMapPin className="text-sm" />
                    <span>Open in Google Maps</span>
                  </a>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 rounded-xl text-white font-medium hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-105"
                  >
                    <span role="img" aria-label="compass">
                      🧭
                    </span>
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Contact Methods */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-xl px-8 py-4 rounded-full border border-gray-600/30">
              <span className="text-gray-300">Prefer direct contact?</span>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline decoration-dotted break-all"
              >
                {contactInfo.email}
              </a>
              <span className="text-gray-500">|</span>
              <a
                href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline decoration-dotted"
              >
                {contactInfo.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
