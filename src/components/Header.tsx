// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative font-bold text-xl transition-all duration-300 px-6 py-3 rounded-xl ${
      isActive 
        ? 'text-cyan-300 bg-cyan-900/30 shadow-sm' 
        : 'text-gray-100 hover:text-cyan-300 hover:bg-white/10'
    } before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 before:transition-all before:duration-300 before:transform before:-translate-x-1/2 ${
      isActive ? 'before:w-8' : 'hover:before:w-8'
    }`;

  return (
    <header className="sticky top-0 left-0 right-0 z-50">
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl' 
          : 'backdrop-blur-lg'
      }`}>
        {/* Main Navigation Container */}
        <div className="container mx-auto px-6 flex justify-between items-center min-h-10 py-0">
          {/* Logo + Company Name */}
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="flex items-center space-x-4 group">
              {/* Updated Logo Container - Now Circular */}
             {/* Logo Container with Independent Background Control */}
<div className="relative">
  {/* White Background Circle - Size Controlled Here */}
  <div className="absolute bg-white rounded-full -z-10 
      h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] 
      md:h-[140px] md:w-[140px] lg:h-[160px] lg:w-[160px]
      top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      group-hover:bg-cyan-50 transition-colors duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
  </div>
  
  {/* Logo - Maintains Original Size */}
  <img 
    src={logo} 
    alt="Logo" 
    className="relative z-10 h-36 sm:h-40 md:h-44 lg:h-48 w-auto transition-all duration-300 group-hover:scale-105" 
  />
</div>
              
              {/* Company Name with Gradient */}
              <div className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-200 via-sky-300 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-sky-400 group-hover:to-cyan-500 transition-all duration-300">
                    Above & Below Adventures</h1>
                <div className="h-0.5 w-0 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/packages" className={linkClass}>
              Packages
            </NavLink>
            <NavLink to="/gallery" className={linkClass}>
              Gallery
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            
            {/* CTA Button - Only Contact Us Remains */}
            <div className="ml-8">
              <NavLink
                to="/contact"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold text-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Us
              </NavLink>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative p-3 text-white hover:text-cyan-300 transition-all duration-300 hover:bg-white/10 rounded-lg group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            {isMenuOpen ? (
              <X className="w-8 h-8 relative z-10 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="w-8 h-8 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700">
            <div className="container mx-auto px-6 py-6">
              <div className="flex flex-col space-y-1">
                <NavLink 
                  to="/" 
                  end 
                  className={({ isActive }) => 
                    `block px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-cyan-300 bg-cyan-900/30 border-l-4 border-cyan-500' 
                        : 'text-gray-100 hover:text-cyan-300 hover:bg-white/10 hover:pl-8'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/packages" 
                  className={({ isActive }) => 
                    `block px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-cyan-300 bg-cyan-900/30 border-l-4 border-cyan-500' 
                        : 'text-gray-100 hover:text-cyan-300 hover:bg-white/10 hover:pl-8'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Packages
                </NavLink>
                <NavLink 
                  to="/gallery" 
                  className={({ isActive }) => 
                    `block px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-cyan-300 bg-cyan-900/30 border-l-4 border-cyan-500' 
                        : 'text-gray-100 hover:text-cyan-300 hover:bg-white/10 hover:pl-8'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gallery
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `block px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-cyan-300 bg-cyan-900/30 border-l-4 border-cyan-500' 
                        : 'text-gray-100 hover:text-cyan-300 hover:bg-white/10 hover:pl-8'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
                
                {/* Mobile CTA Button - Only Contact Us Remains */}
                <div className="pt-6 border-t border-gray-700 mt-6">
                  <NavLink
                    to="/contact"
                    className="block text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;