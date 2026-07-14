'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { profileCustom, prefs } from '@/lib/utils';

// Petite barre de profil persistante, visible en bas à gauche sur tout le
// site dès qu'on est connecté — inspirée du bandeau utilisateur en bas de
// la sidebar Discord (avatar + pseudo + statut, clic → page compte).
export default function ProfileBar() {
  const { data: session, status } = useSession();
  const [custom, setCustom] = useState({});
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => { setCustom(profileCustom.get()); setVisible(prefs.get().showProfileBar); };
    sync();
    window.addEventListener('bumpify:profile-updated', sync);
    window.addEventListener('bumpify:prefs-updated', sync);
    return () => {
      window.removeEventListener('bumpify:profile-updated', sync);
      window.removeEventListener('bumpify:prefs-updated', sync);
    };
  }, []);

  if (status !== 'authenticated' || !session?.user || !visible) return null;

  const name = custom.displayName || session.user.name;
  const status_ = custom.status || 'Voir mon profil';

  return (
    <Link href="/account" className="profile-bar" title="Voir mon profil">
      {session.user.image && (
        <img src={session.user.image} alt="" className="profile-bar-avatar" />
      )}
      <div className="profile-bar-text">
        <div className="profile-bar-name">{name}</div>
        <div className="profile-bar-status">{status_}</div>
      </div>
      <span className="profile-bar-chevron">⚙️</span>
    </Link>
  );
}
