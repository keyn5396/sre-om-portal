/**
 * types/case.ts
 *
 * Definiciones de tipos TypeScript para los casos SRE del portal.
 * Centraliza todos los tipos relacionados a casos para que
 * TypeScript pueda validarlos en toda la aplicación.
 */

// Variantes visuales disponibles para Badge
// Este tipo se comparte entre Badge.tsx y los datos de casos
export type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "open"
  | "resolved"
  | "escalated"
  | "inProgress"
  | "neutral"

// Tipo que representa un caso SRE completo
// "iniciativa" reemplaza a "squad" — las iniciativas son estables en el tiempo,
// los squads son organizativos y pueden rotar
export interface CasoSRE {
  id:          string
  iniciativa:  string   // ej: "CADOM", "Flow Box", "Portabilidad"
  tipo:        string
  severidad:   BadgeVariant
  estado:      BadgeVariant
  orden:       string
  descripcion: string
  agente:      string
  creadoHace:  string
}

// Tipo para los KPIs del dashboard
export interface KpisDashboard {
  mttr:            string
  casosAbiertos:   number
  resueltosHoy:    number
  consultasAgente: number
}

// Tipo para bugs relacionados a casos SRE
export interface BugRelacionado {
  id:          string   // ej: "BUG-441"
  casoId:      string   // ID del caso SRE vinculado
  titulo:      string
  severidad:   BadgeVariant
  estado:      "open" | "closed" | "inProgress"
  jiraLink?:   string   // opcional — se conecta en Fase 5b
  reportadoPor: string
}

// Tipo para el panel de estado del ambiente UAT
export interface StatusAmbienteUAT {
  nombre:      string   // ej: "Orquestador OM"
  estado:      "ok" | "degradado" | "down"
  detalle?:    string   // mensaje opcional de contexto
  ultimaRevision: string
}