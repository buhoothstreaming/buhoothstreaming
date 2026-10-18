"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tv, Film, Clapperboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';


export default function NavBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const navItems = [
    { href: '/channels', label: t('channels'), icon: Tv },
    { href: '/movies', label: t('movies'), icon: Film },
    { href: '/series', label: t('series'), icon: Clapperboard },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center text-xs relative focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              {isActive && <div className="absolute top-0 h-1 w-full bg-primary rounded-b-full"></div>}
              <item.icon className={cn('h-6 w-6 mb-1', isActive ? 'text-primary' : 'text-gray-400')} />
              <span className={cn(isActive ? 'text-primary' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
