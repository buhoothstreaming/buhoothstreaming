"use client";
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';

import { getAppLogo } from '@/lib/logo';

export default function SplashScreen() {
  const { t } = useLanguage();
  const messages = [
    t('splash1'),
    t('splash2'),
    t('splash3'),
    t('splash4')
  ];

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(messages[0]);
  const [isClient, setIsClient] = useState(false);
  const [logo, setLogo] = useState(() => getAppLogo());

  useEffect(() => {
    setIsClient(true);
    setLogo(getAppLogo());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + (100 / 90))); // 100% in 9s
    }, 100);

    const messageTimer = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 4000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [isClient, messages]);
  
  useEffect(() => {
    setMessage(messages[0]);
  }, [messages])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="mb-8">
        <Image src={logo} alt="بحوث Streaming Logo" width={250} height={100} priority referrerPolicy="no-referrer" data-ai-hint="app logo" />
      </div>
      <div className="w-64 flex flex-col items-center">
        <Progress value={progress} className="h-2 bg-primary/20 [&>div]:bg-primary" />
        <p className="text-foreground mt-4 text-center">{message}</p>
      </div>
    </div>
  );
}