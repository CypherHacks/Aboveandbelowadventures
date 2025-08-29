import React from 'react';
import { NavLink } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTripadvisor, FaWhatsapp } from 'react-icons/fa';
import logo from '../assets/logo.png';

type SocialItem = {
  name: string;
  href: string;
  Icon: React.ElementType;
  color: string; // tailwind gradient on hover
  aria?: string;
  title?: string;
};

const Footer: React.FC = () => {
  // ---------- QUICK LINKS (added Gallery) ----------
  const quickLinks = [
    { name: 'Home', to: '/' },
    { name: 'Gallery', to: '/gallery' },       // ✅ new fast link
    { name: 'Tour Packages', to: '/packages' },
    { name: 'About Us', to: '/about' },
    { name: 'Contact', to: '/contact' },
  ];

  // ---------- CONTACT INFO ----------
  const PHONE_DISPLAY = '+962 79 7237623';
  const EMAIL = 'aboveandbelowadventures@gmail.com';
  const ADDRESS = 'The Royal Yacht Club of Jordan, Aqaba 77110';

  // ---------- SOCIALS (match Contact page behavior) ----------
  // Put your real public pages here:
  const INSTAGRAM_URL = 'https://www.instagram.com/above_and_below_adventures/?igsh=MW9keDg1enE3amxtbg%3D%3D#';
  const FACEBOOK_URL  = 'https://www.facebook.com/aboveandbelow.info/';
  const TRIP_URL      = 'https://www.tripadvisor.com/Attraction_Review-g298101-d7368530-Reviews-Above_and_Below_Adventures_Day_Tours-Aqaba_Al_Aqabah_Governorate.html';

const toWADigits = (raw: string, countryCode = '962') => {
  let d = raw.replace(/\D/g, '');     // strip everything except digits
  if (d.startsWith('00')) d = d.slice(2); // 00962… -> 962…
  if (d.startsWith('0')) d = countryCode + d.slice(1); // 07… -> 9627…
  return d; // e.g. 962797237623
};

// EXAMPLE USE
const WHATSAPP_NUMBER = '+962 79 723 7623'; // or '079 723 7623' or '00962 79 723 7623'
const waDigits = toWADigits(WHATSAPP_NUMBER, '962'); // -> '962797237623'
const waMessage = "Hello! I’d like to plan a trip with Above & Below Adventures.";
const WHATSAPP_URL = `https://wa.me/${waDigits}?text=${encodeURIComponent(waMessage)}`;

  const socialLinks: SocialItem[] = [
    {
      name: 'Instagram',
      Icon: FaInstagram,
      href: INSTAGRAM_URL,
      color: 'hover:from-pink-500 hover:to-purple-600',
      aria: 'Instagram',
      title: 'Instagram',
    },
    {
      name: 'Facebook',
      Icon: FaFacebook,
      href: FACEBOOK_URL,
      color: 'hover:from-blue-500 hover:to-blue-700',
      aria: 'Facebook',
      title: 'Facebook',
    },
    {
      name: 'Tripadvisor',
      Icon: FaTripadvisor,
      href: TRIP_URL,
      color: 'hover:from-emerald-500 hover:to-teal-600',
      aria: 'Tripadvisor',
      title: 'Tripadvisor',
    },
    {
      name: 'WhatsApp',
      Icon: FaWhatsapp,
      href: WHATSAPP_URL,
      color: 'hover:from-green-500 hover:to-green-700',
      aria: 'WhatsApp chat',
      title: 'WhatsApp',
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
                <a href={`tel:+${PHONE_DISPLAY.replace(/\D/g, '')}`} className="hover:text-cyan-300 transition-colors">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <a href={`mailto:${EMAIL}`} className="hover:text-cyan-300 transition-colors">
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                <span>{ADDRESS}</span>
              </li>
            </ul>
          </div>

          {/* Connect With Us (now mirrors Contact page behavior) */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Connect With Us</h4>
            <div className="space-y-4">
              {socialLinks.map(({ name, href, Icon, color, aria, title }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={aria || name}
                  title={title || name}
                  className="group flex items-center space-x-4 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <div className={`w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-gradient-to-r ${color} transition-all duration-300 border border-gray-700/50 hover:border-transparent group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-light group-hover:translate-x-1 transition-transform duration-300">
                    {name}
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
