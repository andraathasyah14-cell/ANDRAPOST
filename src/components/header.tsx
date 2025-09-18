
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { ThemeToggle } from './theme-toggle';
import { navLinks } from './main-nav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { handleLogout } from '@/lib/actions';
import { auth } from '@/lib/firebase-client';


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();


  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
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
    setMobileNavOpen(false);
  };

  const onLogout = async () => {
    await handleLogout();
    await auth.signOut();
    router.push('/login');
    router.refresh();
  };
  
  const AuthButton = () => {
    if (loading) {
      return <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
    }
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin01">
              Admin Panel
            </Link>
          </Button>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )
    }
    return (
      <Button asChild>
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Admin Login
        </Link>
      </Button>
    )
  }

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
          <div className="hidden sm:flex">
             <AuthButton />
          </div>
          <ThemeToggle />
          <div className="md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Buka menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <Logo />
                </SheetHeader>
                <div className="mt-8 flex flex-col justify-between h-[calc(100%-4rem)]">
                  <ul className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                      <li key={link.id}>
                        <button
                          onClick={() => handleLinkClick(link.id)}
                          className="flex items-center w-full p-3 rounded-md text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                        >
                          <link.icon className="mr-3 h-5 w-5" />
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="sm:hidden">
                    <AuthButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
