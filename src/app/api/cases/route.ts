/**
 * api/cases/route.ts
 *
 * Endpoint para consultar casos desde Supabase.
 * GET /api/cases — devuelve todos los casos ordenados por fecha
 */

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}