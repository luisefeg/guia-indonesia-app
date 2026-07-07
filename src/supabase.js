import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // No detiene la app, pero avisa claramente en consola si faltan las variables de entorno.
  console.warn(
    "[guia-indonesia] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
    "Defínelas en un archivo .env (local) o en Vercel → Settings → Environment Variables."
  );
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
