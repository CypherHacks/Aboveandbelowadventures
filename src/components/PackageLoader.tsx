// src/components/PackageLoader.tsx
import React from 'react';

interface PackageLoaderProps {
  detailMode?: boolean;
}

const PackageLoader: React.FC<PackageLoaderProps> = ({ detailMode = false }) => {
  if (detailMode) {
    return (
      <div className="animate-pulse">
        {/* Category badge placeholder */}
        <div className="h-8 bg-gray-700 rounded-full w-40 mb-10" />
        
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left column - text placeholders */}
          <div>
            <div className="h-6 bg-gray-700 rounded-full w-32 mb-6" />
            <div className="h-10 bg-gray-700 rounded-full w-80 mb-4" />
            
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-gray-700 rounded-full w-full" />
              <div className="h-4 bg-gray-700 rounded-full w-4/5" />
              <div className="h-4 bg-gray-700 rounded-full w-3/4" />
            </div>
            
            {/* Stats placeholders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-2xl mb-2 mx-auto" />
                  <div className="h-3 bg-gray-700 rounded-full w-16 mx-auto mb-1" />
                  <div className="h-4 bg-gray-700 rounded-full w-20 mx-auto" />
                </div>
              ))}
            </div>
            
            <div className="h-12 bg-gray-700 rounded-2xl w-64" />
          </div>
          
          {/* Right column - reserved space for gallery without ghost boxes */}
          <div className="space-y-4">
            {/* Large main image reserved space */}
            <div className="w-full h-80" />
            {/* Thumbnails reserved space */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card mode loader
  return (
    <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/30 animate-pulse">
      <div className="bg-gray-700 rounded-2xl w-full h-48 mb-4" />
      <div className="h-6 bg-gray-700 rounded-full w-4/5 mb-3" />
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-20" />
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-700 rounded-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded-full w-16" />
        ))}
      </div>
      <div className="h-12 bg-gray-700 rounded-2xl w-full" />
    </div>
  );
};

export default PackageLoader;
