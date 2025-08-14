// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PackageLoader from '../components/PackageLoader';
import { motion } from 'framer-motion';
import { Heart, Leaf, Star, Globe, MapPin, Camera, Car, ExternalLink } from 'lucide-react';
import HeroImage from '../assets/jordan.png'

type Destination = {
  id: string;
  name: string;
  description: string;
  image: string;
  highlights: string[];
  location: string;
};

const destinations: Destination[] = [
  {
    id: '1',
    name: 'Petra',
    description: 'The ancient Nabataean city carved into rose-red sandstone cliffs, one of the New Seven Wonders of the World.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Treasury_petra_crop.jpeg/330px-Treasury_petra_crop.jpeg',
    highlights: ['The Treasury', 'Monastery', 'Royal Tombs', 'Siq Canyon'],
    location: 'Ma\'an Governorate'
  },
  {
    id: '2',
    name: 'Wadi Rum',
    description: 'The Valley of the Moon - a protected desert wilderness with dramatic sandstone mountains and red sand valleys.',
    image: 'https://pictures.altai-travel.com/1920x0/petra-to-wadi-rum-header-adobe-stock-3433.jpg',
    highlights: ['Desert Safari', 'Rock Bridges', 'Ancient Petroglyphs', 'Bedouin Culture'],
    location: 'Aqaba Governorate'
  },
  {
    id: '3',
    name: 'Dead Sea',
    description: 'The lowest point on Earth, famous for its therapeutic salt waters and mineral-rich mud.',
    image: 'https://images.squarespace-cdn.com/content/v1/64ba44348b6a05559a816bc1/1690282697224-Q4RJU99FL0HYLW9KFZ3M/Jordan%2BDead%2BSea%2Bon%2Ba%2BBudget-title.jpg',
    highlights: ['Natural Floating', 'Mineral Mud', 'Spa Resorts', 'Stunning Sunsets'],
    location: 'Jordan Valley'
  },
  {
    id: '4',
    name: 'Amman',
    description: 'Jordan\'s vibrant capital blending ancient history with modern culture, built on seven hills.',
    image: 'https://i0.wp.com/www.touristjordan.com/wp-content/uploads/2022/08/jordan12.jpg?resize=800%2C533&ssl=1',
    highlights: ['Roman Theatre', 'Citadel Hill', 'Rainbow Street', 'Traditional Souks'],
    location: 'Capital City'
  }
];

const DestinationCard: React.FC<{ 
  destination: Destination; 
  index: number;
}> = ({ destination, index }) => (
  <motion.div
    className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col transition-all duration-500"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    whileHover={{ 
      y: -8,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    }}
  >
    <div className="relative overflow-hidden">
      <div className="bg-slate-700 animate-pulse w-full h-56" />
      <img 
        src={destination.image} 
        alt={destination.name} 
        className="w-full h-56 object-cover absolute top-0 left-0 opacity-0 group-hover:scale-110 transition-all duration-700"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '1';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="absolute top-4 left-4">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {destination.location}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{destination.name}</h3>
      </div>
    </div>
    
    <div className="p-6 flex-1 flex flex-col">
      <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-4">
        {destination.description}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {destination.highlights.map((highlight, i) => (
          <div 
            key={i} 
            className="bg-slate-800/60 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-600/30 flex items-center gap-1"
          >
            <Camera className="w-3 h-3 text-amber-400" />
            {highlight}
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const CarRentalPromotion: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 rounded-3xl p-8 overflow-hidden border border-slate-700/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.5),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          className="inline-flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-white mb-1">Need a Ride?</h2>
            <p className="text-blue-200 text-sm">Powered by Save Rent A Car</p>
          </div>
        </motion.div>
        
        <motion.p 
          className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Explore Jordan's famous destinations with freedom and comfort. 
          <span className="text-cyan-300 font-semibold"> Save Rent A Car</span> offers reliable vehicles 
          to make your journey seamless from Amman to Petra and beyond.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="https://saverentacar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <Car className="w-5 h-5" />
            <span>Browse Rental Cars</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Best Prices</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Online Booking</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span>Diverse fleet</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative -mt-[160px] pt-[160px] overflow-hidden min-h-[100vh]">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('https://images.pexels.com/photos/21014/pexels-photo.jpg')] bg-cover bg-center filter brightness-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-amber-900/70 to-orange-900/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(245,158,11,0.3),transparent_70%)]" />
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-6 py-16 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 min-h-[85vh]">
          <motion.div 
            className="flex-1 max-w-2xl"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full w-3 h-3 shadow-lg" />
              <span className="uppercase tracking-wider text-sm font-bold text-amber-300 letterspacing-wide">
                Discover Jordan's Treasures
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] mb-6 lg:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-white">Jordan's</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Iconic
              </span>
              <br />
              <span className="text-white">Destinations</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-slate-200 leading-relaxed mb-8 lg:mb-10 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              From the ancient rose city of Petra to the otherworldly landscapes of Wadi Rum—discover 
              the most breathtaking destinations that make Jordan unforgettable.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <button
                onClick={() => navigate('/packages')}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-8 py-4 lg:py-5 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 text-lg"
              >
                <span>View Packages</span>
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
          
         <motion.div
  className="flex-1 relative max-w-4xl" // increased max width
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.3 }}
>
  <div className="relative">
    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur-lg opacity-30" />
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700/50">
      <div className="bg-slate-700 animate-pulse w-full h-[500px] lg:h-[700px]" /> {/* taller placeholder */}
      <img
        src={HeroImage}
        alt="Jordan landscape"
        className="w-full h-[500px] lg:h-[700px] object-cover absolute top-0 left-0 opacity-0" // taller actual image
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '1';
        }}
      />
    </div>
  </div>
</motion.div>

        </div>
      </section>

      {/* Famous Destinations */}
      <section id="famous-destinations" className="container mx-auto px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12 lg:mb-16">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-amber-500 rounded-full w-2 h-2" />
            <span className="uppercase tracking-widest text-sm font-medium text-amber-400">Must-Visit Places</span>
          </motion.div>
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Famous Destinations
          </motion.h2>
          <motion.p 
            className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover Jordan's most iconic locations that have captivated travelers for centuries. 
            Each destination offers unique experiences and unforgettable memories.
          </motion.p>
        </div>
        
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <PackageLoader key={i} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {destinations.map((destination, index) => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Jordan */}
      <section className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm py-16 sm:py-20 lg:py-24 border-y border-slate-700/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Why Travel with Us in Jordan?
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We blend authenticity, sustainability, and local insight so your journey feels personal and unforgettable.
            </motion.p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Heart className="w-8 h-8 text-rose-400" />, 
                title: 'Authentic Culture', 
                description: 'Experience traditions curated with local communities and genuine hospitality.' 
              },
              { 
                icon: <Leaf className="w-8 h-8 text-emerald-400" />, 
                title: 'Sustainable Travel', 
                description: 'Journeys designed to preserve landscapes and uplift local communities.' 
              },
              { 
                icon: <Star className="w-8 h-8 text-amber-400" />, 
                title: 'Curated Experiences', 
                description: 'Handpicked destinations and activities tailored to different explorer styles.' 
              },
              { 
                icon: <Globe className="w-8 h-8 text-cyan-400" />, 
                title: 'Expert Guidance', 
                description: 'Local insights and expert knowledge to make your visit truly memorable.' 
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="group flex flex-col items-center text-center gap-4 p-8 bg-slate-800/40 hover:bg-slate-700/50 rounded-3xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div className="w-16 h-16 bg-slate-700/50 group-hover:bg-slate-600/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl text-white">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Rental Partnership */}
      <section className="container mx-auto px-6 py-16 sm:py-20 lg:py-24">
        <CarRentalPromotion />
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;