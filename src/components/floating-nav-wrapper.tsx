'use client';

import { useState, useEffect } from 'react';
import MainNav from './main-nav';

export default function FloatingNavWrapper() {
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
  
  const handleLinkClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-40 hidden md:block">
      <div className="p-2 rounded-full bg-card/80 border border-border/40 shadow-lg backdrop-blur-sm">
        <MainNav activeSection={activeSection} onLinkClick={handleLinkClick} />
      </div>
    </div>
  );
}
