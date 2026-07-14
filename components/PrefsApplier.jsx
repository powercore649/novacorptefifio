'use client';
import { useEffect } from 'react';
import { prefs } from '@/lib/utils';

// Applique les préférences globales stockées en localStorage (actuellement :
// réduction des animations) dès le chargement de n'importe quelle page, et
// réagit en direct si elles changent depuis la page compte.
export default function PrefsApplier() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle('reduce-motion', !!prefs.get().reduceMotion);
    };
    apply();
    window.addEventListener('bumpify:prefs-updated', apply);
    return () => window.removeEventListener('bumpify:prefs-updated', apply);
  }, []);

  return null;
}
