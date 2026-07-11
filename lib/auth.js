import DiscordProvider from 'next-auth/providers/discord';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email guilds' } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        token.discordId = profile.id;
        token.banner = profile.banner || null;
        token.accentColor = typeof profile.accent_color === 'number' ? profile.accent_color : null;
      }
      // Gardé uniquement dans le JWT côté serveur — jamais renvoyé au
      // navigateur via `session` (voir callback session ci-dessous). Sert à
      // appeler /users/@me/guilds pour lister les serveurs Discord de
      // l'utilisateur.
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId;
        session.user.bannerUrl = token.banner
          ? `https://cdn.discordapp.com/banners/${token.discordId}/${token.banner}.${token.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
          : null;
        session.user.accentColor = token.accentColor !== null
          ? `#${token.accentColor.toString(16).padStart(6, '0')}`
          : null;
      }
      return session;
    },
  },
};
