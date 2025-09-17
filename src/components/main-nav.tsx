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
          'items-center space-x-6': !isMobile,
        })}
      >
        {navLinks.map((link) => (
          <li key={link.id}>
            <button
              onClick={() => onLinkClick(link.id)}
              className={cn(
                'text-lg font-medium transition-colors hover:text-primary focus:outline-none focus:text-primary',
                activeSection === link.id
                  ? 'text-primary'
                  : 'text-muted-foreground',
                {
                  'w-full text-left p-2 rounded-md': isMobile,
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
