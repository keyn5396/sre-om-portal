/**
 * Button.tsx
 *
 * Componente de botón reutilizable del portal SRE OM Operations.
 * Maneja tres variantes visuales y dos tamaños.
 * Incluye estado de carga (isLoading) para cuando se espera respuesta del agente.
 *
 * Uso:
 *   <Button variant="primary" onClick={consultarAgente}>Consultar agente</Button>
 *   <Button variant="danger" size="sm">Escalar caso</Button>
 *   <Button isLoading>Procesando...</Button>
 */

import React from "react"

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost"
type ButtonSize    = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
  children:   React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  // Acción principal — consultar agente, confirmar
  primary:   "bg-primary-500 hover:bg-primary-600 text-white border border-primary-600",
  // Acción secundaria — cancelar, volver
  secondary: "bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-600",
  // Acción destructiva — escalar, marcar como crítico
  danger:    "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30",
  // Sin fondo — para acciones de menor jerarquía
  ghost:     "bg-transparent hover:bg-surface-800 text-surface-400 border border-transparent",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({
  variant   = "primary",
  size      = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props  // pasamos el resto de props nativas del botón (onClick, type, etc.)
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Spinner de carga — aparece cuando isLoading es true */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 14 6.477 14 12h-4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}