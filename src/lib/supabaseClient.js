import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
      "Revisá tu archivo .env.local (en desarrollo) o los secrets de GitHub Actions (en producción)."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
