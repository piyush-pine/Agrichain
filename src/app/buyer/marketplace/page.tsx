
import { PublicMarketplace } from '@/components/marketplace/PublicMarketplace';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function MarketplacePage() {
    return (
        <div className="relative z-10 min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow py-8">
               <PublicMarketplace />
            </main>
            <Footer />
        </div>
    );
}
