
import VantaBackground from '@/components/client/VantaBackground';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import RoleCards from '@/components/landing/RoleCards';
import FeatureCards from '@/components/landing/FeatureCards';
import Cta from '@/components/landing/Cta';
import { PublicMarketplace } from '@/components/marketplace/PublicMarketplace';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <VantaBackground />
      <div className="relative z-10 min-h-screen flex flex-col bg-background/80 backdrop-blur-sm">
        <Header />
        <main className="flex-grow">
          <Hero />
          <PublicMarketplace isHomePage={true} />
          <RoleCards />
          <FeatureCards />
          <Cta />
        </main>
        <Footer />
      </div>
    </>
  );
}
