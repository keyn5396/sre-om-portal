/**
 * types/agent.ts
 *
 * Tipos TypeScript para las consultas al agente Gemini.
 * ÚNICO lugar de verdad — gemini.ts y route.ts importan desde acá.
 */

export interface ConsultaAgente {
  iniciativa:    string
  tipoProblema:  string                              // nombre unificado
  severidad:     "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  numeroOrden?:  string
  descripcion:   string
  nombreUsuario: string
}

export interface RespuestaAgente {
  agenteDerivado:    string
  diagnostico:       string
  causaRaiz:         string    // nombre unificado (antes causaProbable en gemini.ts)
  pasosResolucion:   string[]
  comandosSugeridos: string[]
  tiempoEstimado:    string
  escalacion:        boolean
}