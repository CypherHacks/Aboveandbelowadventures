// src/pages/AboutPage.tsx
import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => (
  <>
    <Header />
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
      <About />
    </main>
    <Footer />
  </>
);

export default AboutPage;