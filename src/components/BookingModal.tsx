// src/components/BookingModal.tsx
import React, { useState } from 'react';
import { Package } from '../types/package';

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
  onConfirm: (formData: BookingData) => void;
  packageItem: Package | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  packageItem,
}) => {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    date: '',
    participants: 1,
    notes: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  if (!isOpen || !packageItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-cyan-500/30 w-full max-w-md p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            Book {packageItem.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-400 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-gray-400 mb-2">
                Preferred Date
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="participants" className="block text-gray-400 mb-2">
                Participants
              </label>
              <input
                id="participants"
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                min={1}
                max={20}
                required
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-gray-400 mb-2">
                Special Requests
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-purple-700 transition-all"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
