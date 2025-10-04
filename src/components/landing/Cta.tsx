import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

const Cta = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to transform agricultural supply chains?</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto text-primary-foreground/90">
          Join AgriChain today and be part of the movement towards transparency, fairness, and efficiency in Indian agriculture.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition shadow-md hover:shadow-lg h-auto">
            <Link href="/register">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-6 py-3 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition h-auto">
            <Link href="#">
              <BookOpen className="w-5 h-5 mr-2" />
              Read Documentation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Cta;
