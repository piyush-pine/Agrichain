"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

declare global {
  interface Window {
    anime: any;
  }
}

const Hero = () => {
  const dashboardImage = PlaceHolderImages.find((img) => img.id === 'dashboard-preview');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.anime) {
      const timeline = window.anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
      });
      
      timeline.add({
        targets: '.hero-content',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: 200
      }, '-=800')
      .add({
        targets: '.hero-image',
        opacity: [0, 1],
        translateX: [30, 0],
        delay: 400
      }, '-=800');
    }
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-grow flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="hero-content">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            <span className="text-green-600">Transparent</span> Supply Chain for Indian Agriculture
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            AgriChain leverages blockchain technology to create a fair, transparent, and efficient agricultural supply chain ecosystem connecting farmers directly with buyers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg h-auto">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition h-auto">
              <Link href="#">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative hero-image">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            {dashboardImage && (
              <Image
                src={dashboardImage.imageUrl}
                alt={dashboardImage.description}
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
                data-ai-hint={dashboardImage.imageHint}
              />
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Blockchain Verified</p>
                <p className="text-xs text-gray-500">Immutable records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
