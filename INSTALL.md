# Installation locale

1. Installer Node.js compatible avec Next.js 16 et le client PostgreSQL si les sauvegardes sont nécessaires.
2. Exécuter `npm install`.
3. Copier `.env.example` vers `.env.local` puis renseigner les services utilisés.
4. Appliquer les migrations `supabase/migrations` dans l’ordre.
5. Lancer `npm run dev`.

Contrôles : `npm run lint`, `npx tsc --noEmit`, puis `npm run build`.
