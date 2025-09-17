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
import FloatingNav from '@/components/floating-nav';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  const handleScroll = () => {
    const sections = document.querySelectorAll<HTMLElement>('section');
    let currentSection = 'profile';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 120) {
        currentSection = section.getAttribute('id') || 'profile';
      }
    });

    setActiveSection(currentSection);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <FloatingNav activeSection={activeSection} />
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
