import { fetchServers } from '@/lib/bridge';

// Régénéré au maximum toutes les 5 minutes — un badge n'a pas besoin d'être
// seconde par seconde, et ça évite de solliciter le bridge à chaque affichage.
export const revalidate = 300;

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

function approxTextWidth(text, fontSize = 11) {
  return Math.max(Math.round(text.length * fontSize * 0.62), 10);
}

function renderBadgeSvg(label, value, valueColor) {
  const labelWidth = approxTextWidth(label) + 20;
  const valueWidth = approxTextWidth(value) + 20;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#1e2028"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${escapeXml(value)}</text>
  </g>
</svg>`;
}

export async function GET(request, { params }) {
  const { guildId } = params;
  const { searchParams } = new URL(request.url);
  // ?stat=bumps (défaut) ou ?stat=members
  const stat = searchParams.get('stat') === 'members' ? 'members' : 'bumps';

  let server = null;
  try {
    const servers = await fetchServers();
    server = servers.find((s) => s.guildId === guildId) || null;
  } catch {
    // en cas d'échec du bridge, on renvoie quand même un badge (avec un message d'erreur) plutôt qu'une image cassée
  }

  const label = 'bumpify';
  let value;
  if (!server) {
    value = 'introuvable';
  } else if (stat === 'members') {
    value = `${server.memberCount ?? '—'} membres`;
  } else {
    value = `${server.bumpCount ?? 0} bumps`;
  }

  const svg = renderBadgeSvg(label, value, server ? '#7c6cf0' : '#9a9a9a');

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
