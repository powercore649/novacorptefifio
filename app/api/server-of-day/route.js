import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/bridge';
import { pickServerOfDay } from '@/lib/utils';

// Recalculé au maximum toutes les heures ; le résultat reste stable pour la
// journée entière car la sélection est déterministe (seed = date du jour).
export const revalidate = 3600;

export async function GET() {
  try {
    const servers = await fetchServers();
    const picked = pickServerOfDay(servers);
    // Normalisation : selon l'endroit du bridge, les champs peuvent être
    // `name`/`icon` ou `guildName`/`guildIcon` — on expose toujours les deux
    // noms pour que n'importe quel composant client puisse les lire sans risque.
    const server = picked
      ? {
          ...picked,
          name: picked.name || picked.guildName,
          icon: picked.icon || picked.guildIcon,
        }
      : null;
    return NextResponse.json({ server });
  } catch {
    return NextResponse.json({ server: null }, { status: 500 });
  }
}
