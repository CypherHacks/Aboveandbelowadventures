// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiSend, FiUser, FiMail, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-300">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have a question or want to work together? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {isSuccess && (
              <div className="mb-8 p-4 bg-green-900/50 border border-green-500 rounded-2xl flex items-center space-x-3">
                <FiCheckCircle className="text-green-400 text-2xl flex-shrink-0" />
                <div>
                  <h3 className="text-green-100 font-medium">Message sent successfully!</h3>
                  <p className="text-green-200 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}
            
            <form
              onSubmit={handleSubmit}
              className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="block text-cyan-200 font-medium" htmlFor="name">
                    <FiUser className="inline mr-1" /> Your Name
                  </label>
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-700/80 text-white focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-cyan-400 border-gray-600'}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="block text-cyan-200 font-medium" htmlFor="email">
                    <FiMail className="inline mr-1" /> Email Address
                  </label>
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-700/80 text-white focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-cyan-400 border-gray-600'}`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="block text-cyan-200 font-medium" htmlFor="message">
                    <FiMessageSquare className="inline mr-1" /> Your Message
                  </label>
                </div>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-700/80 text-white focus:outline-none focus:ring-2 ${errors.message ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-cyan-400 border-gray-600'}`}
                  placeholder="Tell us about your project..."
                />
                {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold flex items-center justify-center space-x-2 transition-all ${isSubmitting ? 'opacity-70' : 'hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/20'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-lg" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center text-gray-400">
              <p>Prefer email? Reach us directly at <a href="mailto:contact@example.com" className="text-cyan-400 hover:underline">contact@example.com</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;