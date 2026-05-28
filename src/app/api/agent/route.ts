/**
 * api/agent/route.ts
 *
 * Endpoint principal del portal SRE OM Operations.
 * Recibe los datos del formulario, llama al agente Gemini,
 * guarda el caso en Supabase y devuelve la respuesta al frontend.
 */

import { NextRequest, NextResponse } from "next/server"
import { consultarAgente } from "@/lib/gemini"
import { supabase } from "@/lib/supabase"
import type { ConsultaAgente } from "@/types/agent"

// Genera un número de caso único con formato OM-XXXX
function generarNumeroCaso(): string {
  const timestamp = Date.now().toString().slice(-4)
  const random    = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `OM-${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ConsultaAgente

    // Validación de campos obligatorios
    if (!body.iniciativa || !body.tipoError || !body.severidad || !body.descripcion) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    // Llamamos al agente Gemini
    const respuesta = await consultarAgente(body)

    // Guardamos el caso en Supabase
    const { error: dbError } = await supabase
      .from("cases")
      .insert({
        case_number:    generarNumeroCaso(),
        squad:          body.iniciativa,
        tipo:           body.tipoError,
        severidad:      body.severidad.toLowerCase(),
        estado:         "open",
        orden:          body.numeroOrden || null,
        descripcion:    body.descripcion,
        agente_usado:   respuesta.agenteDerivado,
        diagnostico:    respuesta.diagnostico,
        causa_raiz:     respuesta.causaRaiz,
        pasos:          respuesta.pasosResolucion,
        comandos:       respuesta.comandosSugeridos,
        tiempo_estimado: respuesta.tiempoEstimado,
        escalacion:     respuesta.escalacion,
      })

    if (dbError) {
      // Logueamos el error pero no frenamos la respuesta al usuario
      console.error("[API/agent] Error guardando en Supabase:", dbError.message)
    } else {
      console.log("[API/agent] Caso guardado en Supabase correctamente")
    }

    return NextResponse.json(respuesta, { status: 200 })

  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido"
    console.error("[API/agent] Error:", mensaje)
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}