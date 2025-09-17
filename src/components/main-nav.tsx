'use client';

import { cn } from '@/lib/utils';
import {
  User,
  Lightbulb,
  BookOpen,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';
import type { FC } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavLink = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export const navLinks: NavLink[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'ongoing', label: 'Ongoing', icon: ClipboardList },
  { id: 'opini', label: 'Opini', icon: Lightbulb },
  { id: 'publikasi', label: 'Publikasi', icon: BookOpen },
  { id: 'feedback', label: 'Kritik & Saran', icon: MessageSquare },
];

interface MainNavProps {
  activeSection: string;
  onLinkClick: (id: string) => void;
  className?: string;
}

const MainNav: FC<MainNavProps> = ({
  activeSection,
  onLinkClick,
  className,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <nav className={cn('flex', className)}>
        <ul className="flex flex-col space-y-1">
          {navLinks.map((link) => (
            <li key={link.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onLinkClick(link.id)}
                    className={cn(
                      'flex items-center justify-center h-12 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50',
                      activeSection === link.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    aria-label={link.label}
                  >
                    <link.icon className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{link.label}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>
    </TooltipProvider>
  );
};

export default MainNav;
