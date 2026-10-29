"use client";
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';

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
  const [logo, setLogo] = useState("https://k.top4top.io/p_36885vv362.png");

  useEffect(() => {
    setIsClient(true);
    
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

    // Halloween Day 2026
    const startDate5 = new Date('2026-10-29T00:00:00');
    const endDate5 = new Date('2026-11-01T05:00:00');

    if (now >= startDate1 && now < endDate1) {
      setLogo("https://g.top4top.io/p_38330txup1.png");
    } else if (now >= startDate2 && now < endDate2) {
      setLogo("https://a.top4top.io/p_3856ltiqu1.png");
    } else if (now >= startDate3 && now < endDate3) {
      setLogo("https://c.top4top.io/p_3917mkdmh1.png");
    } else if (now >= startDate4 && now < endDate4) {
      setLogo("https://d.top4top.io/p_3928xkymg1.png");
    } else if (now >= startDate5 && now < endDate5) {
      setLogo("https://d.top4top.io/p_39540emg41.png");
    } else {
      setLogo("https://k.top4top.io/p_36885vv362.png");
    }
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
        <Image src={logo} alt="بحوث Streaming Logo" width={250} height={100} priority data-ai-hint="app logo" />
      </div>
      <div className="w-64 flex flex-col items-center">
        <Progress value={progress} className="h-2 bg-primary/20 [&>div]:bg-primary" />
        <p className="text-foreground mt-4 text-center">{message}</p>
      </div>
    </div>
  );
}