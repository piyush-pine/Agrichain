
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { CartSheet } from '../cart/CartSheet';
import { ThemeToggle } from '../ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

declare global {
    interface Window {
      anime: any;
    }
}

const languages: { [key: string]: string } = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  mr: 'मराठी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
};

const LanguageSwitcher = () => {
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';

    const handleLocaleChange = (newLocale: string) => {
        Cookies.set('NEXT_LOCALE', newLocale);
        const newPath = `/${newLocale}/${pathname.split('/').slice(2).join('/')}`;
        window.location.assign(newPath);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="language-selector flex items-center space-x-2 bg-muted px-3 py-1 rounded-full cursor-pointer transition-transform hover:scale-105">
                    <span className="text-sm text-muted-foreground uppercase">{currentLocale}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.entries(languages).map(([code, name]) => (
                    <DropdownMenuItem key={code} onSelect={() => handleLocaleChange(code)}>
                        {name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


const Header = () => {
  const logo = PlaceHolderImages.find((img) => img.id === 'agrichain-logo');
  const { user } = useUser();

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
    <nav className="bg-background/90 backdrop-filter backdrop-blur-lg shadow-sm sticky top-0 z-50">
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
              <span className="text-xl font-bold text-primary">AgriClear</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/buyer/marketplace" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary">
              Marketplace
            </Link>
            <Link href="#features" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary">
              Features
            </Link>
            <Link href="#about" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary">
              About
            </Link>
            <div className="ml-4 flex items-center space-x-2">
              <ThemeToggle />
              <CartSheet />
              {user ? (
                 <Button asChild>
                    <Link href={`/${user.role}/dashboard`}>Dashboard</Link>
                 </Button>
              ) : (
                <>
                    <Button variant="secondary" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Register</Link>
                    </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
