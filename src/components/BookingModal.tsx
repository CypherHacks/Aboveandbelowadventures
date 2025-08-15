// src/components/BookingModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Package } from '../types/package';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface BookingData {
  name: string;
  email: string;
  date: string;
  participants: number;
  notes: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: BookingData) => Promise<void> | void; // supports async
  packageItem: Package | null;
  autoCloseDelayMs?: number; // optional: default 1800
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  packageItem,
  autoCloseDelayMs = 1800,
}) => {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    date: '',
    participants: 1,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Today for <input type="date" min>
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset internal states when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'participants'
          ? Math.max(1, Math.min(20, parseInt(value, 10) || 1))
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // defensive: prevent bubbling to any outer <form>
    setError(null);
    setIsSubmitting(true);

    try {
      // Call parent handler BUT DO NOT navigate in the parent
      await onConfirm(formData);

      setIsSubmitting(false);
      setIsSuccess(true);

      // Clear form (optional)
      setFormData({
        name: '',
        email: '',
        date: '',
        participants: 1,
        notes: '',
      });

      // Auto-close after a short success state
      const t = setTimeout(() => {
        setIsSuccess(false);
        onClose(); // User remains on the same page (package page)
      }, autoCloseDelayMs);
      return () => clearTimeout(t);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setError(
        err?.message ||
          'Something went wrong while saving your booking. Please try again.'
      );
    }
  };

  if (!isOpen || !packageItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Book ${packageItem.name}`}
        className="relative w-full max-w-md rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            Book {packageItem.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="rounded-full p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Success state */}
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircleIcon className="h-16 w-16 animate-bounce text-green-400" />
            <h4 className="text-xl font-semibold text-white">
              Booking Confirmed!
            </h4>
            <p className="text-gray-300">
              Thanks! We’ve received your request for{' '}
              <span className="font-medium text-white">
                {packageItem.name}
              </span>
              . We’ll follow up by email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white outline-none ring-cyan-500 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white outline-none ring-cyan-500 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="date" className="mb-2 block text-gray-300">
                Preferred Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={todayStr}
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white outline-none ring-cyan-500 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="participants" className="mb-2 block text-gray-300">
                Participants
              </label>
              <input
                id="participants"
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                required
                min={1}
                max={20}
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white outline-none ring-cyan-500 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-gray-300">
                Special Requests
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-600 bg-gray-700/50 px-4 py-3 text-white outline-none ring-cyan-500 transition focus:ring-2"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-3 font-medium text-white transition hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
