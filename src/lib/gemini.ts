/**
 * gemini.ts
 *
 * Cliente del agente IA. Importa tipos desde @/types/agent.
 * CAMBIO v2: eliminados tipos duplicados — un solo lugar de verdad.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { seleccionarContextoRelevante } from './knowledge'
import type { ConsultaAgente, RespuestaAgente } from '@/types/agent'

function obtenerClienteGemini(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')
  return new GoogleGenerativeAI(apiKey)
}

function construirPrompt(consulta: ConsultaAgente, contextoRAG: string): string {
  return `
Sos el agente QA Salesforce OM de la iniciativa OM del cluster Provision.
Tu rol es diagnosticar y resolver problemas de Order Management en Salesforce.
Respondés siempre en español, con diagnósticos precisos y pasos accionables.

════════════════════════════════════════
CONOCIMIENTO TÉCNICO DEL EQUIPO (BASE RAG)
════════════════════════════════════════

${contextoRAG}

════════════════════════════════════════
CONSULTA DEL QA
════════════════════════════════════════

- Iniciativa: ${consulta.iniciativa}
- Tipo de problema: ${consulta.tipoProblema}
- Severidad: ${consulta.severidad}
- Número de orden: ${consulta.numeroOrden ?? 'No proporcionado'}
- Descripción: ${consulta.descripcion}
- Reportado por: ${consulta.nombreUsuario}

════════════════════════════════════════
INSTRUCCIONES DE RESPUESTA
════════════════════════════════════════

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "agenteDerivado": "Diagnóstico / Resolución / Escalation",
  "diagnostico": "diagnóstico en 2-4 oraciones",
  "causaRaiz": "causa raíz más probable",
  "pasosResolucion": ["paso 1", "paso 2"],
  "comandosSugeridos": ["SOQL o comando si aplica"],
  "tiempoEstimado": "ej: 15 minutos",
  "escalacion": false
}

No agregues texto antes ni después del JSON. Solo el JSON.
  `.trim()
}

export async function consultarAgente(
  consulta: ConsultaAgente
): Promise<RespuestaAgente> {
  const contextoRAG = seleccionarContextoRelevante(
    consulta.tipoProblema,
    consulta.descripcion
  )
  const prompt  = construirPrompt(consulta, contextoRAG)
  const genAI   = obtenerClienteGemini()
  const modelo  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const resultado      = await modelo.generateContent(prompt)
  const textoRespuesta = resultado.response.text()

  const respuestaLimpia = textoRespuesta
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  return JSON.parse(respuestaLimpia) as RespuestaAgente
}