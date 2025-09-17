'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Logo from './logo';
import MainNav from './main-nav';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);

    const sections = document.querySelectorAll<HTMLElement>('section');
    let currentSection = 'profile';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 120) {
        currentSection = section.getAttribute('id') || 'profile';
      }
    });

    setActiveSection(currentSection);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLinkClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsSheetOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'border-b border-border/40 bg-background/80 backdrop-blur-lg'
          : 'bg-background/0'
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
            <div className="hidden md:block">
            <MainNav activeSection={activeSection} onLinkClick={handleLinkClick} />
            </div>
             <ThemeToggle />
            <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                    <Logo />
                </SheetHeader>
                <div className="mt-8">
                    <MainNav
                    activeSection={activeSection}
                    onLinkClick={handleLinkClick}
                    isMobile={true}
                    />
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
