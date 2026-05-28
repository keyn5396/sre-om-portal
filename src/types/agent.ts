/**
 * types/agent.ts
 *
 * Tipos TypeScript para las consultas al agente Gemini
 * y sus respuestas estructuradas.
 */

// Lo que el usuario completa en el formulario
export interface ConsultaAgente {
  iniciativa:  string   // reemplaza "squad" — las iniciativas son estables en el tiempo
  tipoError:   string
  severidad:   string
  numeroOrden: string
  descripcion: string
}

// La respuesta estructurada que devuelve el agente
export interface RespuestaAgente {
  agenteDerivado:    string   // qué sub-agente tomó el caso
  diagnostico:       string   // análisis del problema
  causaRaiz:         string   // por qué ocurrió
  pasosResolucion:   string[] // lista de pasos a seguir
  comandosSugeridos: string[] // comandos técnicos si aplican
  tiempoEstimado:    string   // estimación de resolución
  escalacion:        boolean  // si requiere escalar
}