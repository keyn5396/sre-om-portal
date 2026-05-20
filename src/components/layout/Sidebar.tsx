/**
 * Sidebar.tsx
 *
 * Barra de navegación lateral del portal SRE OM Operations.
 * Muestra los links a todas las secciones del portal y el estado
 * del agente Gemini (activo/inactivo).
 *
 * Es un Client Component porque usa usePathname() para resaltar
 * la página activa — eso requiere acceso al navegador.
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// Definición tipada de cada item de navegación
interface NavItem {
  label:    string   // texto visible
  href:     string   // ruta de la página
  icon:     string   // emoji como ícono simple (lo reemplazamos por íconos reales en Fase 2.3)
  description: string // tooltip informativo
}

// Lista central de navegación — para agregar una sección nueva, solo se agrega acá
const navItems: NavItem[] = [
  {
    label:       "Dashboard",
    href:        "/",
    icon:        "⬛",
    description: "Vista general y métricas SRE",
  },
  {
    label:       "Consultar agente",
    href:        "/consultar",
    icon:        "🤖",
    description: "Diagnosticar problemas con el agente Gemini",
  },
  {
    label:       "Historial",
    href:        "/historial",
    icon:        "📋",
    description: "Todos los casos registrados",
  },
  {
    label:       "Métricas",
    href:        "/metricas",
    icon:        "📊",
    description: "KPIs y métricas SRE del equipo",
  },
]

export function Sidebar() {
  // usePathname nos dice en qué página estamos para resaltar el link activo
  const pathname = usePathname()

  return (
    <aside className="
      fixed left-0 top-0
      h-screen w-64
      bg-surface-950
      border-r border-surface-800
      flex flex-col
      z-40
    ">
      {/* Logo y nombre del portal */}
      <div className="
        px-6 py-5
        border-b border-surface-800
      ">
        <div className="flex items-center gap-3">
          {/* Indicador visual — círculo naranja como logo simple */}
          <div className="
            w-8 h-8 rounded-lg
            bg-primary-500
            flex items-center justify-center
            text-white text-sm font-bold
          ">
            OM
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-100">
              SRE Portal
            </p>
            <p className="text-xs text-surface-500">
              Order Management
            </p>
          </div>
        </div>
      </div>

      {/* Links de navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Un link está activo si la ruta actual coincide exactamente
          // Para el dashboard usamos coincidencia exacta, para el resto startsWith
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.description}
              className={`
                flex items-center gap-3
                px-3 py-2.5
                rounded-lg
                text-sm font-medium
                transition-colors duration-150
                group
                ${isActive
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                  : "text-surface-400 hover:bg-surface-800 hover:text-surface-100 border border-transparent"
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {/* Indicador de activo — línea naranja a la derecha */}
              {isActive && (
                <span className="ml-auto w-1 h-4 rounded-full bg-primary-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Estado del agente Gemini — pie del sidebar */}
      <div className="
        px-4 py-4
        border-t border-surface-800
      ">
        <div className="
          flex items-center gap-3
          px-3 py-2.5
          rounded-lg
          bg-surface-900
          border border-surface-700
        ">
          {/* Punto verde animado — indica que el agente está activo */}
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="
              absolute inset-0
              w-2 h-2 rounded-full bg-green-500
              animate-ping opacity-75
            "/>
          </div>
          <div>
            <p className="text-xs font-medium text-surface-200">
              Agente Gemini
            </p>
            <p className="text-xs text-surface-500">
              Coordinador activo
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}