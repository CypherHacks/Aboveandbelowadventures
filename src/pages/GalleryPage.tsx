// src/pages/GalleryPage.tsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

// Import each image explicitly
import img1 from '../assets/1.jpeg';
import img2 from '../assets/2.jpeg';
import img3 from '../assets/3.jpeg';
import img4 from '../assets/4.jpeg';
import img5 from '../assets/5.jpeg';
import img6 from '../assets/6.jpeg';
import img7 from '../assets/7.jpeg';
import img8 from '../assets/8.jpeg';
import img9 from '../assets/9.jpeg';
import img10 from '../assets/10.jpeg';
import img11 from '../assets/11.jpeg';
import img12 from '../assets/12.jpeg';
import img13 from '../assets/13.jpeg';
import img14 from '../assets/14.jpeg';
import img15 from '../assets/15.jpeg';
import img16 from '../assets/16.jpeg';
import img17 from '../assets/17.jpeg';
import img18 from '../assets/18.jpeg';
import img19 from '../assets/19.jpeg';
import img20 from '../assets/20.jpeg';
import img21 from '../assets/21.jpeg';
import img22 from '../assets/22.jpeg';
import img23 from '../assets/23.jpeg';
import img24 from '../assets/24.jpeg';
import img25 from '../assets/25.jpeg';
import img26 from '../assets/26.jpeg';
import img27 from '../assets/27.jpeg';
import img28 from '../assets/28.jpeg';
import img29 from '../assets/29.jpeg';
import img30 from '../assets/30.jpeg';
import img31 from '../assets/31.jpeg';
import img32 from '../assets/32.jpeg';
import img33 from '../assets/33.jpeg';
import img34 from '../assets/34.jpeg';
import img35 from '../assets/35.jpeg';
import img36 from '../assets/36.jpeg';
import img37 from '../assets/37.jpeg';
import img38 from '../assets/38.jpeg';

// Put them in an array
const galleryImages = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
  img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
  img31, img32, img33, img34, img35, img36, img37, img38
];

const GalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <Header />

      <main className="container mx-auto px-6 py-16">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Travel Gallery</h1>
          <p className="text-gray-300 text-lg">
            A collection of breathtaking moments captured from our journeys
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.03 }}
              className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer break-inside-avoid"
            >
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-auto transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-4">
                <p className="text-white font-semibold text-lg">
                  Photo {index + 1}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
