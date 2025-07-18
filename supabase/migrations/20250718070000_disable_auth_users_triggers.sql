-- Désactivation temporaire des triggers sur auth.users pour debug création utilisateur
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users' AND trigger_schema = 'auth' LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users;', r.trigger_name);
    END LOOP;
END $$;

-- Pour réactiver, il faudra restaurer les triggers nécessaires après debug.
