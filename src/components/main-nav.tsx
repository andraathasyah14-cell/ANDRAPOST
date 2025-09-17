'use client';

import { cn } from '@/lib/utils';
import type { FC } from 'react';

type NavLink = {
  id: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'opini', label: 'Opini' },
  { id: 'publikasi', label: 'Publikasi' },
  { id: 'feedback', label: 'Kritik & Saran' },
];

interface MainNavProps {
  activeSection: string;
  onLinkClick: (id: string) => void;
  className?: string;
  isMobile?: boolean;
}

const MainNav: FC<MainNavProps> = ({
  activeSection,
  onLinkClick,
  className,
  isMobile = false,
}) => {
  return (
    <nav className={cn('flex', className)}>
      <ul
        className={cn('flex', {
          'flex-col space-y-2': isMobile,
          'items-center space-x-2': !isMobile,
        })}
      >
        {navLinks.map((link) => (
          <li key={link.id}>
            <button
              onClick={() => onLinkClick(link.id)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                activeSection === link.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                {
                  'w-full text-left': isMobile,
                }
              )}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNav;
