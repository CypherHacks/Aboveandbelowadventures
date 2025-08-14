// src/components/PackageDetail.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Calendar,
  Shield,
  CheckCircle,
  Info
} from 'lucide-react';
import type { Package, ItineraryItem, Review } from '../types/package';

interface PackageDetailProps {
  packageItem: Package;
  onBookNow: (pkg: Package) => void;
  onBack: () => void;
}

const PackageDetail: React.FC<PackageDetailProps> = ({
  packageItem: pkg,
  onBookNow,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'itinerary' | 'reviews'>('highlights');

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors duration-300 group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">All Adventures</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          className="grid lg:grid-cols-2 gap-12 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Column - Details */}
          <div>
            <span className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
              {pkg.category.toUpperCase()}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
              {pkg.name}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed font-light mb-8">
              {pkg.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Duration</div>
                <div className="text-white font-bold">{pkg.duration}</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Group Size</div>
                <div className="text-white font-bold">{pkg.groupSize}</div>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Rating</div>
                <div className="text-white font-bold">{pkg.rating}/5</div>
              </div>
              <div className="text-center">
                <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm text-gray-400">Price</div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold">
                  {pkg.price}
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => onBookNow(pkg)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Book This Adventure
            </motion.button>
          </div>

          {/* Right Column - Styled Gallery */}
          <div className="space-y-4">
            {pkg.gallery && pkg.gallery.length > 0 ? (
              <>
                {/* Large main image */}
                <motion.img
                  key={pkg.gallery[0]}
                  src={pkg.gallery[0]}
                  alt="Main gallery image"
                  className="w-full h-80 object-cover rounded-3xl shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Thumbnails */}
                <div className="grid grid-cols-3 gap-4">
                  {pkg.gallery.slice(1, 4).map((url, idx) => (
                    <motion.img
                      key={url}
                      src={url}
                      alt={`Gallery thumbnail ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-2xl shadow-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-80 bg-gray-700 rounded-3xl flex items-center justify-center text-gray-400">
                No images available
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'highlights'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('highlights')}
          >
            Highlights
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'itinerary'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('itinerary')}
          >
            Itinerary
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'reviews'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({pkg.reviewsList?.length ?? pkg.reviews})
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            {activeTab === 'highlights' && (
              <>
                <h2 className="text-3xl font-bold text-white mb-6">Experience Highlights</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-cyan-400 mt-0.5" />
                      <span className="text-gray-300">{h}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'itinerary' && (
              <>
                <h2 className="text-3xl font-bold text-white mb-8">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {pkg.itinerary.map((item: ItineraryItem, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        className="flex space-x-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                            <Icon className="w-6 h-6 text-cyan-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-cyan-400 font-bold text-sm bg-cyan-900/30 px-2 py-1 rounded-full">
                              {item.time}
                            </span>
                            <h3 className="text-white font-bold text-lg">{item.title}</h3>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'reviews' && (
              <>
                <h2 className="text-3xl font-bold text-white mb-6">Customer Reviews</h2>
                {pkg.reviewsList && pkg.reviewsList.length > 0 ? (
                  pkg.reviewsList.map((r: Review, i: number) => (
                    <div key={i} className="border-b border-gray-700/50 pb-6 mb-6">
                      <div className="flex items-center mb-3">
                        <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                          {r.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{r.author}</div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                className={`w-4 h-4 ${n <= r.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 italic font-light">“{r.comment}”</p>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No reviews yet.</div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* What's Included */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span>What's Included</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                {pkg.included.map((inc, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Info className="w-6 h-6 text-orange-400" />
                <span>Not Included</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                {pkg.notIncluded.map((ni, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                    <span>{ni}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-cyan-400" />
                <span>Requirements</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                {pkg.requirements.map((req, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Book Now Card */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/30">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  {pkg.price}
                </div>
                <div className="text-gray-400 text-sm">per person</div>
              </div>
              <div className="space-y-4 mb-6 text-gray-300 text-sm">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Group Size</span>
                  <span>{pkg.groupSize}</span>
                </div>
              </div>
              <motion.button
                onClick={() => onBookNow(pkg)}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book Now
              </motion.button>
              <p className="text-xs text-gray-400 text-center mt-3">
                No payment required. We'll contact you to confirm details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
