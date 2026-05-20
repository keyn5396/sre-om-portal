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
export interface CasoSRE {
  id:          string
  squad:       string
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