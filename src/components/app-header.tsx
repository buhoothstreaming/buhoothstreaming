"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAppLogo } from '@/lib/logo';

export default function AppHeader() {
  const router = useRouter();
  const [logo, setLogo] = useState(() => getAppLogo());

  useEffect(() => {
    setLogo(getAppLogo());
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-background border-b border-border">
      <Link href="/channels">
        <Image src={logo} alt="Logo" width={100} height={40} className="object-contain" referrerPolicy="no-referrer" data-ai-hint="app logo"/>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => router.push('/search')} className="rounded-full hover:bg-black/50">
        <Search className="h-6 w-6" />
        <span className="sr-only">Search</span>
      </Button>
    </header>
  );
}