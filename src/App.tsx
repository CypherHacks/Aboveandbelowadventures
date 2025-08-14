// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PackageDetailPage from './pages/PackageDetailPage';
import GalleryPage from './pages/GalleryPage'; // New import

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:packageId" element={<PackageDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} /> {/* New route */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;