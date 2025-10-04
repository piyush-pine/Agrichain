
import { PublicMarketplace } from '@/components/marketplace/PublicMarketplace';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase/auth/use-user';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function MarketplacePage() {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
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
        </NextIntlClientProvider>
    );
}
