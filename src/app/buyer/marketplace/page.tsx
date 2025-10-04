
import { PublicMarketplace } from '@/components/marketplace/PublicMarketplace';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase/auth/use-user';

export default function MarketplacePage() {
    return (
        <FirebaseClientProvider>
            <UserProvider>
                <div className="relative z-10 min-h-screen flex flex-col bg-background">
                    <Header />
                    <main className="flex-grow py-8">
                       <PublicMarketplace />
                    </main>
                    <Footer />
                </div>
            </UserProvider>
        </FirebaseClientProvider>
    );
}
