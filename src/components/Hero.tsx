// src/components/Hero.tsx
import { ArrowRight, Star, Users, Zap, Globe, Eye } from 'lucide-react';

interface HeroProps {
  onViewPackage: (id: string) => void;
  backgroundImage: string;
  featuredPackage: {
    id: string;
    name: string;
    duration: string;
    price: string;
    image: string;
  };
  stats: {
    adventurers: string;
    rating: string;
    destinations: string;
  };
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
}

const Hero: React.FC<HeroProps> = ({ 
  onViewPackage,
  backgroundImage,
  featuredPackage,
  stats,
  tagline,
  title,
  subtitle,
  description
}) => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-[160px] -mt-[160px]">
      {/* Background with enhanced overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-purple-900/85 to-indigo-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
      </div>

      {/* Main Content - Responsive padding */}
      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 border border-cyan-400/30">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tracking-wide text-sm sm:text-base">{tagline}</span>
              </div>
              
              {/* Responsive heading sizes */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-none tracking-tight">
                <span className="block text-white">{title}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 animate-pulse">
                  {subtitle}
                </span>
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-300 mt-2 lg:mt-4">
                  Beyond Imagination
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 lg:mb-10 leading-relaxed font-light max-w-2xl">
                {description}
              </p>

              {/* Stats - Responsive grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl lg:rounded-2xl mb-2 sm:mb-3 mx-auto border border-cyan-400/30">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stats.adventurers}</div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Adventurers</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl lg:rounded-2xl mb-2 sm:mb-3 mx-auto border border-cyan-400/30">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stats.rating}</div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Rating</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl lg:rounded-2xl mb-2 sm:mb-3 mx-auto border border-cyan-400/30">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stats.destinations}</div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Destinations</div>
                </div>
              </div>

              {/* Responsive buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => onViewPackage(featuredPackage.id)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl lg:rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center space-x-2 sm:space-x-3 transform hover:scale-105 border border-cyan-400/30"
                >
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">Explore Adventures</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button className="border-2 border-cyan-400/50 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl lg:rounded-2xl font-bold hover:bg-cyan-400/10 transition-all duration-300 backdrop-blur-sm hover:border-cyan-400 text-sm sm:text-base">
                  View All Packages
                </button>
              </div>
            </div>

            {/* Right content - Featured package card */}
            <div className="lg:justify-self-end mt-8 lg:mt-0">
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 shadow-lg">
                    FEATURED TOUR
                  </span>
                  <img
                    src={featuredPackage.image}
                    alt={featuredPackage.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-xl lg:rounded-2xl border border-cyan-500/20"
                  />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">{featuredPackage.name}</h3>
                <div className="flex justify-between items-center text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  <span>Duration: {featuredPackage.duration}</span>
                  <span className="text-cyan-400 font-bold text-lg sm:text-xl">{featuredPackage.price}</span>
                </div>
                <button
                  onClick={() => onViewPackage(featuredPackage.id)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 sm:py-4 rounded-xl lg:rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30 text-sm sm:text-base"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
    </section>
  );
};

export default Hero;