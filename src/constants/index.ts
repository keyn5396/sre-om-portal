/**
 * constants/index.ts
 *
 * Valores constantes del dominio de negocio del portal SRE OM Operations.
 * Centraliza iniciativas, tipos de error, severidades y datos de ejemplo.
 * Cuando conectemos Supabase en Fase 4, los mock se reemplazan
 * por datos reales — el resto de constantes se mantiene igual.
 *
 * CAMBIO v2: "squad" reemplazado por "iniciativa" — las iniciativas
 * son estables en el tiempo, los squads son organizativos y rotan.
 */

import type { BadgeVariant, BugRelacionado, StatusAmbienteUAT } from "@/types/case"

// Iniciativas del proyecto OM — más estables que los squads
export const INICIATIVAS = [
  "CADOM",
  "Flow Box",
  "Portabilidad",
  "Alta Internet",
  "IPTV",
  "TOIP",
] as const

// Tipos de error más frecuentes en Order Management
// Tipos de error en Order Management — categorías definitivas
// Reflejan el impacto real en la orden, no el síntoma técnico
export const TIPOS_ERROR = [
  "Tarea en Running",
  "Tarea Fatally Failed",
  "Orden Rechazada",
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
    iniciativa:  "CADOM",
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
    iniciativa:  "Flow Box",
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
    iniciativa:  "Alta Internet",
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
    iniciativa:  "CADOM",
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
    iniciativa:  "Portabilidad",
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

// Bugs relacionados a casos SRE — se conecta a Jira en Fase 5b
export const mockBugsRelacionados: BugRelacionado[] = [
  {
    id:           "BUG-441",
    casoId:       "OM-2401",
    titulo:       "S563 no libera lock al reintentar tarea Running",
    severidad:    "critical",
    estado:       "open",
    reportadoPor: "García, M.",
  },
  {
    id:           "BUG-439",
    casoId:       "OM-2400",
    titulo:       "Huawei TV 210 retorna 500 en ambiente UAT",
    severidad:    "high",
    estado:       "inProgress",
    reportadoPor: "López, K.",
  },
  {
    id:           "BUG-435",
    casoId:       "OM-2399",
    titulo:       "Callback SF timeout intermitente en nodo 3",
    severidad:    "high",
    estado:       "closed",
    reportadoPor: "Ramírez, S.",
  },
]

// Estado actual del ambiente UAT — se conecta a Salesforce API en Fase 5
export const mockStatusUAT: StatusAmbienteUAT[] = [
  {
    nombre:         "Orquestador OM",
    estado:         "degradado",
    detalle:        "Latencia elevada en S563",
    ultimaRevision: "hace 5 min",
  },
  {
    nombre:         "Salesforce CRM",
    estado:         "ok",
    ultimaRevision: "hace 5 min",
  },
  {
    nombre:         "Integración Huawei",
    estado:         "down",
    detalle:        "Sin respuesta desde las 14:30",
    ultimaRevision: "hace 5 min",
  },
  {
    nombre:         "Integración SOM",
    estado:         "ok",
    ultimaRevision: "hace 5 min",
  },
  {
    nombre:         "CBS / SAP",
    estado:         "ok",
    ultimaRevision: "hace 5 min",
  },
]
