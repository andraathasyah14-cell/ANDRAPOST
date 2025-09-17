'use client';

import MainNav from './main-nav';

interface FloatingNavProps {
  activeSection: string;
}

export default function FloatingNav({ activeSection }: FloatingNavProps) {
  const handleLinkClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-40 hidden md:block">
      <div className="p-2 rounded-full bg-card/80 border border-border/40 shadow-lg backdrop-blur-sm">
        <MainNav activeSection={activeSection} onLinkClick={handleLinkClick} />
      </div>
    </div>
  );
}
