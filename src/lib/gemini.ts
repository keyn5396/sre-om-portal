/**
 * gemini.ts
 *
 * Responsabilidad: Cliente del agente IA.
 * Integra el contexto RAG del equipo antes de cada llamada a la API de Gemini.
 * Construye prompts estructurados y devuelve respuestas tipadas.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { seleccionarContextoRelevante } from './knowledge';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConsultaAgente {
  iniciativa: string;
  tipoProblema: string;
  severidad: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  numeroOrden?: string;
  descripcion: string;
  nombreUsuario: string;
}

export interface RespuestaAgente {
  agenteDerivado: string;
  diagnostico: string;
  causaProbable: string;
  pasosResolucion: string[];
  comandosSugeridos?: string[];
  requiereEscalacion: boolean;
  nivelConfianza: 'ALTO' | 'MEDIO' | 'BAJO';
  categoriaDiagnostico: string;
}

// ─── Cliente Gemini ───────────────────────────────────────────────────────────

function obtenerClienteGemini(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
  }
  return new GoogleGenerativeAI(apiKey);
}

// ─── Constructor de prompt con RAG ───────────────────────────────────────────

function construirPrompt(consulta: ConsultaAgente, contextoRAG: string): string {
  return `
Sos el agente QA Salesforce OM del iniciativa OM del cluster Provision.
Tu rol es diagnosticar y resolver problemas de Order Management en Salesforce.
Respondés siempre en español, con diagnósticos precisos y pasos accionables.

════════════════════════════════════════
CONOCIMIENTO TÉCNICO DEL EQUIPO (BASE RAG)
════════════════════════════════════════

${contextoRAG}

════════════════════════════════════════
CONSULTA DEL QA
════════════════════════════════════════

- iniciativa: ${consulta.iniciativa}
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
  "agenteDerivado": "string — cuál sub-agente maneja esto: Diagnóstico / Resolución / Escalation",
  "diagnostico": "string — diagnóstico claro del problema en 2-4 oraciones",
  "causaProbable": "string — causa raíz más probable basada en el conocimiento del equipo",
  "pasosResolucion": ["paso 1", "paso 2", "paso 3"],
  "comandosSugeridos": ["comando o query SOQL si aplica"],
  "requiereEscalacion": boolean,
  "nivelConfianza": "ALTO | MEDIO | BAJO",
  "categoriaDiagnostico": "categoría del error según la taxonomía del equipo"
}

No agregues texto antes ni después del JSON. Solo el JSON.
  `.trim();
}

// ─── Función principal de consulta ───────────────────────────────────────────

export async function consultarAgente(
  consulta: ConsultaAgente
): Promise<RespuestaAgente> {
  // 1. Seleccionar contexto RAG relevante para esta consulta
  const contextoRAG = seleccionarContextoRelevante(
    consulta.tipoProblema,
    consulta.descripcion
  );

  // 2. Construir el prompt completo con el contexto inyectado
  const prompt = construirPrompt(consulta, contextoRAG);

  // 3. Llamar a la API de Gemini
  const genAI = obtenerClienteGemini();
  const modelo = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const resultado = await modelo.generateContent(prompt);
  const textoRespuesta = resultado.response.text();

  // 4. Parsear y devolver respuesta tipada
  const respuestaLimpia = textoRespuesta
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const respuestaParsed = JSON.parse(respuestaLimpia) as RespuestaAgente;
  return respuestaParsed;
}