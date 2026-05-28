/**
 * types/agent.ts
 * ÚNICO lugar de verdad para los tipos del agente.
 */

export interface ConsultaAgente {
  iniciativa:    string
  tipoError:     string    // nombre usado en route.ts y consultar/page.tsx
  severidad:     "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  numeroOrden?:  string
  descripcion:   string
  nombreUsuario?: string   // opcional — se agrega en Fase 4 con autenticación
}

export interface RespuestaAgente {
  agenteDerivado:    string
  diagnostico:       string
  causaRaiz:         string
  pasosResolucion:   string[]
  comandosSugeridos: string[]
  tiempoEstimado:    string
  escalacion:        boolean
}