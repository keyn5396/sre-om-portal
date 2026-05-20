/**
 * constants/index.ts
 *
 * Valores constantes del dominio de negocio del portal SRE OM Operations.
 * Centraliza squads, tipos de error, severidades y datos de ejemplo.
 * Cuando conectemos Supabase en Fase 4, los mockCases se reemplazan
 * por datos reales — el resto de constantes se mantiene igual.
 */

import type { BadgeVariant } from "@/types/case"

// Squads del proyecto OM
export const SQUADS = [
  "OM Core",
  "OM Provision",
  "OM Billing",
  "OM Portability",
  "OM IPTV",
] as const

// Tipos de error más frecuentes en Order Management
export const TIPOS_ERROR = [
  "Tarea trabada en Running",
  "Timeout en callback",
  "Fallo de validación de estado",
  "Error en plan de orquestación",
  "Push event no recibido",
  "Rollback no ejecutado",
  "Error de integración SOM",
  "Error de integración Huawei",
] as const

// Severidades con su peso numérico para ordenamiento
export const SEVERIDADES = [
  { label: "CRITICAL", variant: "critical" as BadgeVariant, peso: 4 },
  { label: "HIGH",     variant: "high"     as BadgeVariant, peso: 3 },
  { label: "MEDIUM",   variant: "medium"   as BadgeVariant, peso: 2 },
  { label: "LOW",      variant: "low"      as BadgeVariant, peso: 1 },
] as const

// Casos de ejemplo para el dashboard (se reemplazan con datos reales en Fase 4)
export const mockCasos = [
  {
    id:          "OM-2401",
    squad:       "OM Provision",
    tipo:        "Tarea trabada en Running",
    severidad:   "critical" as BadgeVariant,
    estado:      "open" as BadgeVariant,
    orden:       "SF-00123456",
    descripcion: "Tarea S563 en estado Running sin avanzar hace 40 minutos",
    agente:      "Diagnóstico",
    creadoHace:  "hace 12 min",
  },
  {
    id:          "OM-2400",
    squad:       "OM IPTV",
    tipo:        "Error en plan de orquestación",
    severidad:   "high" as BadgeVariant,
    estado:      "inProgress" as BadgeVariant,
    orden:       "SF-00123445",
    descripcion: "Falla en Actualizar Oferta Primaria TV 210 de Huawei",
    agente:      "Resolución",
    creadoHace:  "hace 28 min",
  },
  {
    id:          "OM-2399",
    squad:       "OM Billing",
    tipo:        "Timeout en callback",
    severidad:   "high" as BadgeVariant,
    estado:      "resolved" as BadgeVariant,
    orden:       "SF-00123401",
    descripcion: "Callback a endpoint SF timeout después de 30s",
    agente:      "Resolución",
    creadoHace:  "hace 1 hora",
  },
  {
    id:          "OM-2398",
    squad:       "OM Core",
    tipo:        "Push event no recibido",
    severidad:   "medium" as BadgeVariant,
    estado:      "resolved" as BadgeVariant,
    orden:       "SF-00123388",
    descripcion: "Push event de SOM no llegó después de completar S564",
    agente:      "Diagnóstico",
    creadoHace:  "hace 2 horas",
  },
  {
    id:          "OM-2397",
    squad:       "OM Portability",
    tipo:        "Fallo de validación de estado",
    severidad:   "low" as BadgeVariant,
    estado:      "resolved" as BadgeVariant,
    orden:       "SF-00123350",
    descripcion: "Validación de estado previo a portabilidad anticipada fallida",
    agente:      "Diagnóstico",
    creadoHace:  "hace 3 horas",
  },
]

// KPIs del dashboard (se calculan desde la DB en Fase 4)
export const mockKpis = {
  mttr:             "24 min",
  casosAbiertos:    3,
  resueltosHoy:    12,
  consultasAgente:  28,
}