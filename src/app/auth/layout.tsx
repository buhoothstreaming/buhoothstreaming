"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { getAppLogo } from '@/lib/app-logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState(getAppLogo());

  useEffect(() => {
    setLogo(getAppLogo());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="mb-8">
            <Image src={logo} alt="بحوث Streaming Logo" width={200} height={80} data-ai-hint="app logo"/>
        </div>
        <div className="w-full max-sm:max-w-xs">
            {children}
        </div>
    </main>
  );
}