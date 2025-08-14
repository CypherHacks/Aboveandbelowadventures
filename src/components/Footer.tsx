import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
} from 'lucide-react';
import logo from '../assets/logo.png';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Home', to: '/' },
    { name: 'Tour Packages', to: '/packages' },
    { name: 'About Us', to: '/about' },
    { name: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      href: 'https://facebook.com/yourcompany',
      color: 'hover:from-blue-500 hover:to-blue-700'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      href: 'https://instagram.com/yourcompany',
      color: 'hover:from-pink-500 hover:to-purple-600'
    },
    { 
      name: 'WhatsApp', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      href: 'https://wa.me/yournumber',
      color: 'hover:from-green-500 hover:to-green-700',
      isImage: true
    },
    { 
      name: 'TripAdvisor', 
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAilBMVEUA61sA7VwA8F0A814A1lMAvEkAq0IAwksA2VQA7FsA9F4A01IAgTIAJg8AAAAALhIAhTQA41gA3VYAayoAHQsAYSYAnD0AWiMACwUAeS8AFgkADwYAIw4AKxEAyU4A9l8AMxQAEwgAGwsAcSwAQRoAlToAaCkAoD4As0UATx8Ady4Ap0EAPRgAjTfyrsZwAAABNUlEQVR4Ac3RRYLEIBQE0PDpOFTcId7eff/rTWAzeoCpDfJwnP8cxogY+1M4nVzP8wNOXz1kR6JYSNgk6YmbntBalud5UKAsq7Su06Ys2870ZKHBvEc7KJ2MEyfikyu1GlokFh2Wz1r1y4qUOyFtWJdeyd1hjsVYDZvrnxVExC9tch3dy6ADiyGb29t0JJsx3rA7pl63d24nunhMebW7kYuuQRw9X5dsOipmKp3hTs0qkVG/63mKIftueuJJBt/wp13qY46Ucp98aFVNHq4WPZwnF9iiYNB6yajBMk4CLrOP0JZZlJ34dFFal2LicRbFgwrtPalG4lJ0uiwHquGRc+ZJeOTY8DewlMC9KtdtB9QA1NyI1fHxSprjeK+Gwutdv7qYf/2vIxSyzAlDMvW/ftUc4j/nA89zGjJlkfnSAAAAAElFTkSuQmCC',
      href: 'https://tripadvisor.com/yourcompany',
      color: 'hover:from-yellow-500 hover:to-green-600',
      isImage: true
    },
  ];

  return (
    <footer id="contact" className="bg-gradient-to-t from-black via-gray-900 to-gray-800 text-white relative">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Company Logo" 
                className="w-16 h-16 object-contain" 
              />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ABOVE & BELOW ADVENTURES
                </h3>
                <p className="text-sm text-cyan-300 font-medium mt-1">
                  ASEZA REG NO: OP21121309
                </p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed font-light">
              Pioneering the future of experiential travel in Jordan. We create
              transformative journeys that blend cutting-edge innovation with
              authentic cultural immersion, redefining what adventure means.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => 
                      `block py-2 pl-1 text-gray-400 hover:text-cyan-400 transition-all duration-300 font-light hover:pl-2 ${
                        isActive ? 'text-cyan-400 font-medium' : ''
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>+962 79 7237623</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>aboveandbelow2014@outlook.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                <span>
                 The Royal Yacht Club of Jordan, Aqaba 77110
                </span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Connect With Us</h4>
            <div className="space-y-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-4 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <div className={`w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gradient-to-r ${social.color} transition-all duration-300 border border-gray-700/50 hover:border-transparent group-hover:scale-110`}>
                    {social.isImage ? (
                      <img 
                        src={social.icon} 
                        alt={social.name} 
                        className="w-5 h-5 object-contain" 
                      />
                    ) : (
                      <social.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-light group-hover:translate-x-1 transition-transform duration-300">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm font-light">
              © 2025 Your Company Name. All rights reserved. Licensed premium tour operator in Jordan.
            </div>
            <div className="flex space-x-6 text-sm">
              <NavLink 
                to="/privacy" 
                className={({ isActive }) => 
                  `text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-light ${
                    isActive ? 'text-cyan-400' : ''
                  }`
                }
              >
                Privacy Policy
              </NavLink>
              <NavLink 
                to="/terms" 
                className={({ isActive }) => 
                  `text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-light ${
                    isActive ? 'text-cyan-400' : ''
                  }`
                }
              >
                Terms of Service
              </NavLink>
              <NavLink 
                to="/cookies" 
                className={({ isActive }) => 
                  `text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-light ${
                    isActive ? 'text-cyan-400' : ''
                  }`
                }
              >
                Cookie Policy
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;