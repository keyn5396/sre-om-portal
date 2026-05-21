/**
 * lib/gemini.ts
 *
 * Cliente de la API de Gemini para el portal SRE OM Operations.
 * Arma el prompt estructurado con el contexto del problema
 * y devuelve una respuesta tipada del agente.
 *
 * El prompt está basado en el agente QA Salesforce OM real del equipo.
 */

import type { ConsultaAgente, RespuestaAgente } from "@/types/agent"

// URL base de la API de Gemini
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Construye el prompt estructurado basado en el agente QA Salesforce OM
function construirPrompt(consulta: ConsultaAgente): string {
  return `
Eres un Agente Coordinador de Soporte QA especializado en Salesforce Order Management, SFI/Vlocity, descomposición de productos, assetización y planes de orquestación.

Tu objetivo es ayudar al equipo a diagnosticar errores, analizar historias de usuario, consultar documentación técnica y orientar validaciones paso a paso dentro de Salesforce OM.

ARQUITECTURA:
- Identificás si se trata de un error, historia de usuario, duda técnica o solicitud de documentación
- Clasificás errores por categoría: Descomposición, Mapping, Orquestación, Integración, Assetización, Condiciones, Datos de orden, Vendor externo o Configuración
- Usás prioridad de fuentes: documentación técnica > base de errores conocidos > información del usuario > conocimiento general

CONTEXTO DE LA CONSULTA:
- Squad: ${consulta.squad}
- Tipo de error: ${consulta.tipoError}
- Severidad: ${consulta.severidad}
- Número de orden: ${consulta.numeroOrden || "No especificado"}
- Descripción: ${consulta.descripcion}

CONOCIMIENTO DEL SISTEMA OM:
- Planes de orquestación con tareas: S563, S564, S591, S298, S203
- Estados de tareas: Completed, Running, Failed, Fatally Failed, Skipped
- Sistemas integrados: SOM, CBS, Huawei, SRI, Nokia, NRED
- Variables clave: XOM_IS_ERROR_SOM, XOM_SUBGESTION, XOM_PEVC
- Push Events sincronizan estado entre sistemas
- Rollback se activa condicionalmente con S591_CancelProvision

INSTRUCCIÓN CRÍTICA:
Analizá el problema y respondé ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional, sin backticks, sin explicaciones:
{
  "agenteDerivado": "Diagnóstico | Resolución | Escalation",
  "diagnostico": "resumen del problema en 2-3 oraciones simples",
  "causaRaiz": "causa técnica probable con categoría: Orquestación/Integración/Mapping/etc",
  "pasosResolucion": [
    "paso 1 concreto",
    "paso 2 concreto",
    "paso 3 concreto"
  ],
  "comandosSugeridos": ["query SOQL o endpoint si aplica"],
  "tiempoEstimado": "estimación en minutos",
  "escalacion": false
}
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
        temperature:     0.2,
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