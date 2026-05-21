/**
 * api/agent/route.ts
 *
 * Endpoint principal del portal SRE OM Operations.
 * Recibe los datos del formulario, llama al agente Gemini
 * y devuelve la respuesta estructurada al frontend.
 *
 * POST /api/agent
 */

import { NextRequest, NextResponse } from "next/server"
import { consultarAgente } from "@/lib/gemini"
import type { ConsultaAgente } from "@/types/agent"

export async function POST(request: NextRequest) {
  try {
    // Parseamos el body de la request
    const body = await request.json() as ConsultaAgente

    // Validación de campos obligatorios
    if (!body.squad || !body.tipoError || !body.severidad || !body.descripcion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: squad, tipoError, severidad, descripcion" },
        { status: 400 }
      )
    }

    // Llamamos al agente Gemini con los datos del formulario
    const respuesta = await consultarAgente(body)

    return NextResponse.json(respuesta, { status: 200 })

  } catch (error) {
    // Capturamos cualquier error y lo devolvemos de forma legible
    const mensaje = error instanceof Error ? error.message : "Error desconocido"
    console.error("[API/agent] Error:", mensaje)

    return NextResponse.json(
      { error: mensaje },
      { status: 500 }
    )
  }
}