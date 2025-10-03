"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

declare global {
    interface Window {
      anime: any;
    }
}

const Header = () => {
  const logo = PlaceHolderImages.find((img) => img.id === 'agrichain-logo');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.anime) {
        window.anime({
            targets: 'nav',
            opacity: [0, 1],
            translateY: [-20, 0],
            easing: 'easeOutExpo',
            duration: 1000
        });
    }
  }, []);

  return (
    <nav className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              {logo && (
                <Image
                  src={logo.imageUrl}
                  alt={logo.description}
                  width={32}
                  height={32}
                  data-ai-hint={logo.imageHint}
                />
              )}
              <span className="text-xl font-bold text-green-600">AgriChain</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="language-selector flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer transition-transform hover:scale-105">
              <span className="text-sm text-gray-600">EN</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            <Link href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">
              Features
            </Link>
            <Link href="#roles" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">
              How It Works
            </Link>
            <Link href="#about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600">
              About
            </Link>
            <div className="ml-4 flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
