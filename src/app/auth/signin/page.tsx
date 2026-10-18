"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.545 6.545a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06z"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg>
);


export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn(email, password);
        router.push('/playlist');
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">{t('signIn')}</CardTitle>
                <CardDescription>{t('signInDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline"><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
                    <Button variant="outline">Microsoft</Button>
                    <Button variant="outline">Apple</Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
                    </div>
                </div>
                <form onSubmit={handleSignIn} className="grid gap-2">
                    <div className="grid gap-1">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input id="email" type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="password">{t('password')}</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                        {loading ? t('signingInButton') : t('signInButton')}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                <p>{t('noAccount')} <Link href="/auth/signup" className="font-semibold text-primary hover:underline">{t('signUpLink')}</Link></p>
            </CardFooter>
        </Card>
    );
}
