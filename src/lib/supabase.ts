/**
 * lib/supabase.ts
 *
 * Cliente de Supabase para el portal SRE OM Operations.
 * Se instancia una sola vez y se reutiliza en toda la app.
 * Las variables de entorno vienen del .env.local
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan las variables de entorno de Supabase en .env.local")
}

export const supabase = createClient(supabaseUrl, supabaseKey)