"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AppHeader() {
  const router = useRouter();
  const [logo, setLogo] = useState("https://k.top4top.io/p_36885vv362.png");

  useEffect(() => {
    const now = new Date();
    
    // Original promo period
    const startDate1 = new Date('2026-06-30T00:00:00');
    const endDate1 = new Date('2026-07-16T00:00:00');
    
    // Anniversary period
    const startDate2 = new Date('2026-07-23T00:00:00');
    const endDate2 = new Date('2026-07-24T05:00:00');

    // Mourning Day
    const startDate3 = new Date('2026-09-22T00:00:00');
    const endDate3 = new Date('2026-09-23T06:30:00');

    // Iraqi Independence Day 2026 - Extended to covers full day + early morning of next day
    const startDate4 = new Date('2026-10-03T00:00:00');
    const endDate4 = new Date('2026-10-04T02:30:00');

    if (now >= startDate1 && now < endDate1) {
      setLogo("https://g.top4top.io/p_38330txup1.png");
    } else if (now >= startDate2 && now < endDate2) {
      setLogo("https://a.top4top.io/p_3856ltiqu1.png");
    } else if (now >= startDate3 && now < endDate3) {
      setLogo("https://c.top4top.io/p_3917mkdmh1.png");
    } else if (now >= startDate4 && now < endDate4) {
      setLogo("https://d.top4top.io/p_3928xkymg1.png");
    } else {
      setLogo("https://k.top4top.io/p_36885vv362.png");
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-background border-b border-border">
      <Link href="/channels">
        <Image src={logo} alt="Logo" width={100} height={40} className="object-contain" data-ai-hint="app logo"/>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => router.push('/search')} className="rounded-full hover:bg-black/50">
        <Search className="h-6 w-6" />
        <span className="sr-only">Search</span>
      </Button>
    </header>
  );
}