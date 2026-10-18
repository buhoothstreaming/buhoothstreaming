'use client';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { t, direction } = useLanguage();
  const { user, updateAvatar, updateName, updateCountry } = useAuth();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const countries = [
    { key: 'turkey', flag: '🇹🇷' }, { key: 'luxembourg', flag: '🇱🇺' }, { key: 'germany', flag: '🇩🇪' },
    { key: 'austria', flag: '🇦🇹' }, { key: 'switzerland', flag: '🇨🇭' }, { key: 'iraq', flag: '🇮🇶' },
    { key: 'saudiArabia', flag: '🇸🇦' }, { key: 'uae', flag: '🇦🇪' }, { key: 'egypt', flag: '🇪🇬' },
    { key: 'oman', flag: '🇴🇲' }, { key: 'lebanon', flag: '🇱🇧' }, { key: 'syria', flag: '🇸🇾' },
    { key: 'tunisia', flag: '🇹🇳' }, { key: 'algeria', flag: '🇩🇿' }, { key: 'morocco', flag: '🇲🇦' },
    { key: 'libya', flag: '🇱🇾' }, { key: 'jordan', flag: '🇯🇴' }, { key: 'uk', flag: '🇬🇧' },
    { key: 'usa', flag: '🇺🇸' }, { key: 'australia', flag: '🇦🇺' }, { key: 'canada', flag: '🇨🇦' },
    { key: 'azerbaijan', flag: '🇦🇿' }, { key: 'russia', flag: '🇷🇺' }, { key: 'ukraine', flag: '🇺🇦' },
    { key: 'kazakhstan', flag: '🇰🇿' }, { key: 'bahrain', flag: '🇧🇭' }, { key: 'kuwait', flag: '🇰🇼' },
    { key: 'qatar', flag: '🇶🇦' }, { key: 'hungary', flag: '🇭🇺' }, { key: 'belgium', flag: '🇧🇪' },
    { key: 'estonia', flag: '🇪🇪' }, { key: 'latvia', flag: '🇱🇻' }, { key: 'lithuania', flag: '🇱🇹' },
    { key: 'romania', flag: '🇷🇴' }, { key: 'italy', flag: '🇮🇹' }, { key: 'france', flag: '🇫🇷' },
    { key: 'netherlands', flag: '🇳🇱' }, { key: 'iran', flag: '🇮🇷' }
  ];

  const [selectedCountryKey, setSelectedCountryKey] = useState(user?.country || 'saudiArabia');
  const [name, setName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.country) {
        setSelectedCountryKey(user.country);
      }
    }
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateAvatar(reader.result);
          toast({ title: t('avatarUpdated') });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      updateName(name.trim());
      updateCountry(selectedCountryKey);
      toast({ title: t('profileUpdated') });
    } else {
        toast({ variant: 'destructive', title: t('nameCannotBeEmpty') });
    }
  };

  return (
    <>
      <header className="flex items-center h-16 px-4 border-b shrink-0">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-black/50">
          <Link href="/settings">
            <BackIcon className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-xl font-bold ltr:ml-2 rtl:mr-2">{t('profile')}</h1>
      </header>
      <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-3xl">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-card hover:bg-muted"
                  onClick={handleAvatarClick}
              >
                  <Camera className="h-5 w-5" />
              </Button>
              <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
              />
            </div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <div className="flex gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('namePlaceholder')} />
                    <Button onClick={handleSave}>{t('save')}</Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Select value={selectedCountryKey} onValueChange={setSelectedCountryKey}>
                    <SelectTrigger id="country">
                        <SelectValue>
                           <div className="flex items-center gap-2">
                                <span>{countries.find(c => c.key === selectedCountryKey)?.flag}</span>
                                <span>{t(selectedCountryKey)}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map(country => (
                            <SelectItem key={country.key} value={country.key}>
                                <div className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{t(country.key)}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </main>
    </>
  );
}
