import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem as variáveis de ambiente configuradas, o app cai para localStorage (ver lib/storage.ts).
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
