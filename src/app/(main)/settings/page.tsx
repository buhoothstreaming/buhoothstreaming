"use client";
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, ListMusic, Languages, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, type Language } from '@/contexts/language-context';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const { language, setLanguage, t, direction } = useLanguage();

    const languagesData: { code: Language; name: string; flag: string }[] = [
        { code: 'ar', name: 'العربية', flag: '🇦🇪' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
    ];

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang as Language);
    }
    
    const getInitials = (name?: string) => {
        if (!name) return "";
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const Chevron = direction === 'rtl' ? ChevronLeft : ChevronRight;

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            
            <div className="bg-card rounded-lg overflow-hidden border">
                <ul className="divide-y divide-border">
                    <li>
                        <Link href="/settings/profile" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{t('profile')}</span>
                            </div>
                            <Chevron className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </li>
                    <li className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Languages className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{t('language')}</span>
                        </div>
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languagesData.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </li>
                    <li>
                       <Link href="/settings/playlist" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <ListMusic className="w-5 h-5 text-muted-foreground" />
                                <span className="font-medium">{t('playlist')}</span>
                            </div>
                            <Chevron className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </li>
                </ul>
            </div>
            
            <div className="bg-card rounded-lg overflow-hidden border">
                <ul className="divide-y divide-border">
                    <li className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{t('appInfo')}</span>
                        </div>
                        <span className="text-muted-foreground">{t('version')}</span>
                    </li>
                    <li>
                        <Link href="/settings/about" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-muted-foreground" />
                                <span className="font-medium">{t('aboutUs')}</span>
                            </div>
                            <Chevron className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </li>
                </ul>
            </div>

            <Button variant="outline" className="w-full" onClick={signOut}>
                {t('signOut')}
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-4">
                <p>{t('appVersion')}</p>
                <p>{t('ownedBy')}</p>
            </div>
        </div>
    );
}
