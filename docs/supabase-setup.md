# Configuration Supabase

1. Créer un projet Supabase et recopier l’URL, la clé publique et la clé `service_role` dans `.env.local` à partir de `.env.local.example`.
2. Appliquer `supabase/migrations/202607310001_booking_system.sql` avec la CLI Supabase (`supabase db push`) ou l’éditeur SQL.
3. Dans Authentication, créer le compte administrateur (email/mot de passe), puis exécuter avec son UUID :
   `insert into public.admin_profiles (user_id, role) values ('UUID_AUTH', 'owner');`
4. Ne jamais préfixer la clé service-role avec `NEXT_PUBLIC_`. Elle contourne la RLS et ne doit exister que côté serveur.

La migration active la RLS sans policy publique. Les créations publiques passent par la route serveur et la fonction atomique révoquée aux rôles publics.
