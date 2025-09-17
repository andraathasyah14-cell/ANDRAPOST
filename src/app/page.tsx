'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import HeroSection from '@/components/sections/hero-section';
import OpinionSection from '@/components/sections/opinion-section';
import PublicationSection from '@/components/sections/publication-section';
import OngoingSection from '@/components/sections/ongoing-section';
import FeedbackSection from '@/components/sections/feedback-section';
import Footer from '@/components/footer';
import LoadingScreen from '@/components/loading-screen';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <OpinionSection />
        <PublicationSection />
        <OngoingSection />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  );
}
