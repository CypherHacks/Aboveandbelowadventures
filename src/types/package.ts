// src/types/package.ts
import type { ComponentType, SVGProps } from 'react';

export type ItineraryItem = {
  time: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export interface Review {
  author: string;
  rating: number;
  comment: string;
}

export interface Package {
  image_url: string | undefined;
  id: number;
  name: string;
  category: string;
  duration: string;
  groupSize: string;
  price: string;
  rating: number;
  reviews: number;            // total number of reviews
  image: string;              // main image URL
  gallery: string[];          // additional images
  description: string;
  highlights: string[];
  itinerary: ItineraryItem[];
  included: string[];
  notIncluded: string[];
  requirements: string[];
  reviewsList?: Review[];     // detailed review entries
}
