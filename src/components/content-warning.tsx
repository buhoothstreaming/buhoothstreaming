'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface ContentWarningProps {
  onWarningComplete: () => void;
  subCategories: string[];
}

export default function ContentWarning({ onWarningComplete, subCategories }: ContentWarningProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onWarningComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onWarningComplete]);
  
  const validSubcategories = subCategories
    .filter(sc => {
      const translationKey = `${sc.toLowerCase().replace('-', '')}_letter`;
      const translation = t(translationKey);
      // Ensure that a translation exists and it's not just returning the key
      return translation !== translationKey;
    });

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="text-center text-white/80 mb-8 max-w-lg px-4">
        <p>{t('adultContentWarning')}</p>
      </div>
      <div className="flex gap-4">
        {validSubcategories.map((subCategory, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-neutral-700/50 rounded-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {t(`${subCategory.toLowerCase().replace('-', '')}_letter`)}
            </div>
            <p className="text-sm text-white/70">{t(subCategory.toLowerCase().replace('-', ''))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
