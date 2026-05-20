/**
 * Card.tsx
 *
 * Contenedor visual base del portal SRE OM Operations.
 * Agrupa información relacionada con fondo, borde y padding consistentes.
 * Tiene subcomponentes opcionales: Card.Header, Card.Title, Card.Content
 * para estructurar el contenido interno de forma semántica.
 *
 * Uso simple:
 *   <Card>contenido</Card>
 *
 * Uso completo:
 *   <Card>
 *     <Card.Header>
 *       <Card.Title>MTTR Promedio</Card.Title>
 *     </Card.Header>
 *     <Card.Content>24 minutos</Card.Content>
 *   </Card>
 */

import React from "react"

// Props de la Card principal
interface CardProps {
  children:   React.ReactNode
  className?: string
  // hover permite activar efecto visual al pasar el mouse — útil en listas de casos
  hover?:     boolean
}

// Props de los subcomponentes
interface CardSectionProps {
  children:   React.ReactNode
  className?: string
}

// Componente principal
function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-surface-900
        border border-surface-700
        rounded-xl
        ${hover ? "hover:border-surface-500 transition-colors duration-150 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Subcomponente para la cabecera — título + acciones opcionales
function CardHeader({ children, className = "" }: CardSectionProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        px-6 py-4
        border-b border-surface-700
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Subcomponente para el título de la card
function CardTitle({ children, className = "" }: CardSectionProps) {
  return (
    <h3
      className={`
        text-sm font-medium text-surface-300
        uppercase tracking-wider
        ${className}
      `}
    >
      {children}
    </h3>
  )
}

// Subcomponente para el contenido principal
function CardContent({ children, className = "" }: CardSectionProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

// Adjuntamos los subcomponentes a Card para usarlos como Card.Header, Card.Title, etc.
// Esto es un patrón llamado "Compound Component" — mantiene todo agrupado bajo un mismo nombre
Card.Header  = CardHeader
Card.Title   = CardTitle
Card.Content = CardContent

export { Card }