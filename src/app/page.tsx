import VantaBackground from '@/components/client/VantaBackground';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import RoleCards from '@/components/landing/RoleCards';
import FeatureCards from '@/components/landing/FeatureCards';
import Cta from '@/components/landing/Cta';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <VantaBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <RoleCards />
          <FeatureCards />
          <Cta />
        </main>
        <Footer />
      </div>
    </>
  );
}
