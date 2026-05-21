/**
 * lib/gemini.ts
 *
 * Cliente de la API de Gemini para el portal SRE OM Operations.
 * Arma el prompt estructurado con el contexto del problema
 * y devuelve una respuesta tipada del agente.
 *
 * En Fase 5 este contexto se enriquece con datos reales de Salesforce.
 */

import type { ConsultaAgente, RespuestaAgente } from "@/types/agent"

// URL base de la API de Gemini
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Construye el prompt estructurado que le mandamos al agente
// El formato importa mucho — le decimos exactamente cómo responder
function construirPrompt(consulta: ConsultaAgente): string {
  return `
Sos el agente coordinador del sistema SRE de Order Management en Salesforce.
Tu rol es analizar problemas de orquestación de órdenes y dar diagnósticos precisos.

CONTEXTO DEL PROBLEMA:
- Squad: ${consulta.squad}
- Tipo de error: ${consulta.tipoError}
- Severidad: ${consulta.severidad}
- Número de orden: ${consulta.numeroOrden || "No especificado"}
- Descripción: ${consulta.descripcion}

CONOCIMIENTO DEL SISTEMA:
- Los planes de orquestación tienen tareas (S563, S564, S591, S298, S203)
- Las tareas pueden estar en: Completed, Running, Failed, Fatally Failed, Skipped
- Los sistemas integrados son: SOM, CBS, Huawei, SRI
- Los Push Events sincronizan el estado entre sistemas
- Variables clave: XOM_IS_ERROR_SOM, XOM_SUBGESTION, XOM_PEVC

INSTRUCCIONES:
Analizá el problema y respondé ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "agenteDerivado": "nombre del sub-agente que toma el caso (Diagnóstico, Resolución o Escalation)",
  "diagnostico": "análisis claro del problema en 2-3 oraciones",
  "causaRaiz": "causa técnica específica del problema",
  "pasosResolucion": ["paso 1", "paso 2", "paso 3"],
  "comandosSugeridos": ["comando o endpoint relevante"],
  "tiempoEstimado": "estimación en minutos",
  "escalacion": false
}

Respondé SOLO con el JSON, sin texto adicional, sin backticks, sin explicaciones.
`
}

// Función principal — recibe la consulta y devuelve la respuesta del agente
export async function consultarAgente(consulta: ConsultaAgente): Promise<RespuestaAgente> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno")
  }

  const prompt = construirPrompt(consulta)

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature:     0.2,  // baja temperatura = respuestas más consistentes y precisas
        maxOutputTokens: 1000,
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Error en la API de Gemini: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Extraemos el texto de la respuesta de Gemini
  const textoRespuesta = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textoRespuesta) {
    throw new Error("La API de Gemini no devolvió contenido")
  }

  // Parseamos el JSON que devolvió el agente
  try {
    const respuestaParseada = JSON.parse(textoRespuesta.trim()) as RespuestaAgente
    return respuestaParseada
  } catch {
    throw new Error("El agente no devolvió un JSON válido")
  }
}