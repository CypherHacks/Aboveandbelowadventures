// src/pages/PackageDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PackageDetail from '../components/PackageDetail';
import BookingModal from '../components/BookingModal';
import Footer from '../components/Footer';
import PackageLoader from '../components/PackageLoader';
import { supabase } from '../lib/supabaseClient';
import type { Package, ItineraryItem, Review } from '../types/package';
import * as Icons from 'lucide-react';

type RawItineraryItem = {
  time: string;
  title: string;
  description: string;
  icon: string;
};

type RawReview = {
  author: string;
  rating: number;
  comment: string;
};

const PackageDetailPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!packageId) {
        setError('Package ID is missing');
        setLoading(false);
        return;
      }
      const id = parseInt(packageId, 10);
      if (isNaN(id)) {
        setError('Invalid package ID format');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch package
        const { data: rawPkgData, error: pkgErr } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();
        if (pkgErr) throw pkgErr;
        const rawPkg = rawPkgData as any;

        // Fetch itinerary
        const { data: rawItinData, error: itinErr } = await supabase
          .from('itinerary_items')
          .select('time, title, description, icon')
          .eq('package_id', id)
          .order('id', { ascending: true });
        if (itinErr) throw itinErr;
        const rawItinerary = (rawItinData ?? []) as RawItineraryItem[];

        // Fetch reviews
        const { data: rawRevData, error: revErr } = await supabase
          .from('reviews')
          .select('author, rating, comment')
          .eq('package_id', id)
          .order('created_at', { ascending: false });
        if (revErr) throw revErr;
        const rawReviews = (rawRevData ?? []) as RawReview[];

        const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
          Car: Icons.Car,
          MapPin: Icons.MapPin,
          Camera: Icons.Camera,
          Utensils: Icons.Utensils,
          Clock: Icons.Clock,
          Star: Icons.Star,
          CheckCircle: Icons.CheckCircle,
          Info: Icons.Info,
          Calendar: Icons.Calendar,
          Shield: Icons.Shield,
          Users: Icons.Users,
        };

        const itinerary: ItineraryItem[] = rawItinerary.map(item => ({
          time: item.time,
          title: item.title,
          description: item.description,
          icon: iconMap[item.icon] || Icons.Info,
        }));

        const reviewsList: Review[] = rawReviews.map(r => ({
          author: r.author,
          rating: r.rating,
          comment: r.comment,
        }));

        const formatted: Package = {
          id: rawPkg.id,
          name: rawPkg.name,
          category: rawPkg.category,
          duration: rawPkg.duration ?? '',
          groupSize: rawPkg.group_size ?? '',
          price: rawPkg.price ?? '',
          rating: rawPkg.rating ?? 0,
          reviews: rawPkg.reviews ?? reviewsList.length,
          image: rawPkg.image_url ?? '',
          gallery: rawPkg.gallery ?? [],
          description: rawPkg.description ?? '',
          highlights: rawPkg.highlights ?? [],
          itinerary,
          included: rawPkg.included ?? [],
          notIncluded: rawPkg.not_included ?? [],
          requirements: rawPkg.requirements ?? [],
          reviewsList,
          image_url: undefined
        };

        setPkg(formatted);
      } catch (e) {
        console.error(e);
        setError('Failed to load package details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [packageId]);

  const handleBack = () => navigate('/packages');
  const handleBookNow = () => setBookingOpen(true);

  const handleConfirm = async (data: {
    name: string;
    email: string;
    date: string;
    participants: number;
    notes: string;
  }) => {
    if (!pkg) return;
    try {
      await supabase.from('bookings').insert([{
        package_id: pkg.id,
        name: data.name,
        email: data.email,
        date: data.date,
        participants: data.participants,
        notes: data.notes,
      }]);

      // Close modal and show success
      setBookingOpen(false);
      setShowSuccess(true);

      // Hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (e) {
      console.error(e);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gradient-to-b from-gray-900 to-purple-900 min-h-screen pb-12 relative">
        <div className="container mx-auto px-4 py-6">
          <button onClick={handleBack} className="mb-4 text-cyan-400">
            ← Back to Packages
          </button>
          {loading || !pkg ? (
            <PackageLoader detailMode />
          ) : (
            <PackageDetail
              packageItem={pkg}
              onBookNow={handleBookNow}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Booking confirmed! 🎉
          </div>
        )}
      </div>
      <Footer />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setBookingOpen(false)}
        onConfirm={handleConfirm}
        packageItem={pkg}
      />
    </>
  );
};

export default PackageDetailPage;
