/**
 * Badge.tsx
 * 
 * Componente de etiqueta visual para comunicar estado o severidad.
 * Se usa en toda la app para mostrar: severidad de casos (CRITICAL/HIGH/MEDIUM/LOW),
 * estado de casos (Abierto/Resuelto/Escalado) y estado de agentes.
 * 
 * Uso:
 *   <Badge variant="critical">CRITICAL</Badge>
 *   <Badge variant="resolved">Resuelto</Badge>
 */

import React from "react"

// Definimos exactamente qué variantes existen
// TypeScript va a marcar error si alguien intenta usar una variante que no está acá
type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "open"
  | "resolved"
  | "escalated"
  | "inProgress"
  | "neutral"

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string  // permite agregar clases extra si se necesita
}

// Mapa de variante → clases de Tailwind
// Separamos esta lógica del JSX para que sea fácil de leer y modificar
const variantStyles: Record<BadgeVariant, string> = {
  // Severidades — de más a menos urgente
  critical:   "bg-red-500/15 text-red-400 border border-red-500/30",
  high:       "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  medium:     "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  low:        "bg-green-500/15 text-green-400 border border-green-500/30",

  // Estados de casos
  open:       "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  resolved:   "bg-green-500/15 text-green-400 border border-green-500/30",
  escalated:  "bg-red-500/15 text-red-400 border border-red-500/30",
  inProgress: "bg-orange-500/15 text-orange-400 border border-orange-500/30",

  // Neutral — para información sin urgencia
  neutral:    "bg-slate-500/15 text-slate-400 border border-slate-500/30",
}

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-0.5
        rounded-full
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}