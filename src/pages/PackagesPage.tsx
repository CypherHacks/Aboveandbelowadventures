// src/pages/PackagesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PackageLoader from '../components/PackageLoader';
import FeaturedPackages from '../components/FeaturedPackages';
import { getPackages } from '../services/packages';
import type { Package } from '../types/package';

const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleView = (id: number) => {
    navigate(`/packages/${id}`);
  };

  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      try {
        const pkgs = await getPackages();
        setPackages(pkgs);
      } catch (err) {
        console.error(err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 animate-gradient">
        <section className="container mx-auto px-4 py-16">
          {/* Page Title */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Discover Unforgettable Adventures
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Explore our curated collection of premium tours designed to create lasting memories
            </motion.p>
          </div>

          {/* Loader / Error / Packages */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <PackageLoader key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-xl mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:scale-105 transform transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <FeaturedPackages packages={packages} onViewPackage={handleView} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PackagesPage;
