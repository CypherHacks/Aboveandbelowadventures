// src/components/FeaturedPackages.tsx
import React, { useState } from 'react';
import { Package } from '../types/package';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

interface FeaturedPackagesProps {
  packages: Package[];
  onViewPackage: (id: number) => void;
}

const FeaturedPackages: React.FC<FeaturedPackagesProps> = ({
  packages,
  onViewPackage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [] = useState(false);

  // Get unique categories from packages
  const categories = ['All', ...new Set(packages.map((pkg) => pkg.category || 'Uncategorized'))];

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || pkg.category === category;
    return matchesSearch && matchesCategory;
  });

  // Helper to build image URL
  const getImageUrl = (pkg: Package) => {
    if (pkg.image_url?.startsWith('http')) return pkg.image_url;
    if (pkg.image?.startsWith('http')) return pkg.image;
    return `${import.meta.env.VITE_API_BASE_URL || ''}${pkg.image_url || pkg.image || '/placeholder.jpg'}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('All');
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Search & Filter Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex flex-col space-y-4">
          {/* Search Bar with Icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-purple-300" />
            </div>
            <input
              type="text"
              placeholder="Search packages by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 text-white placeholder-purple-300/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="text-purple-300 hover:text-white transition" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="w-full md:w-1/2 relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <FiFilter className="text-purple-300" />
  </div>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full pl-10 pr-4 py-3 appearance-none rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
  >
    {categories.map((cat, idx) => (
      <option 
        key={idx} 
        value={cat}
        className="bg-gray-800 text-white" // Added explicit background and text color
      >
        {cat}
      </option>
    ))}
  </select>
  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
    <FiChevronDown className="text-purple-300" />
  </div>
</div>

            <div className="flex items-center space-x-3">
              {(searchTerm || category !== 'All') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-purple-200 hover:text-white bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition"
                >
                  <FiX size={16} />
                  <span>Clear filters</span>
                </button>
              )}

              <div className="text-sm text-purple-200 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                Showing {filteredPackages.length} of {packages.length} packages
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count and Empty State */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-white mb-2">No packages found</h3>
          <p className="text-purple-300 max-w-md mx-auto">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:shadow-purple-500/20 hover:border-purple-500/30 transition-all cursor-pointer flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getImageUrl(pkg)}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                  {pkg.category || 'Featured'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Details */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition">
                  {pkg.name}
                </h3>
                <p className="text-purple-200 text-sm flex-1 mb-4 line-clamp-3">
                  {pkg.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <div>
                   
                    <span className="block text-lg font-bold text-cyan-400">
                      {isNaN(Number(pkg.price)) ? pkg.price : `$${pkg.price}`}
                    </span>
                  </div>
                  <button
                    onClick={() => onViewPackage(pkg.id)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-transform"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedPackages;