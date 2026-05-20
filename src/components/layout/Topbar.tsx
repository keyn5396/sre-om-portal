/**
 * Topbar.tsx
 *
 * Barra superior fija del portal SRE OM Operations.
 * Muestra el título de la página actual, el squad del usuario
 * y acceso rápido a crear un nuevo caso.
 *
 * Es un Client Component porque lee la ruta actual con usePathname()
 * para mostrar el título correspondiente a cada sección.
 */

"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/Button"

// Mapa de ruta → título de página
// Cuando el usuario navega, el Topbar muestra el título correcto automáticamente
const pageTitles: Record<string, string> = {
  "/":           "Dashboard",
  "/consultar":  "Consultar agente",
  "/historial":  "Historial de casos",
  "/metricas":   "Métricas SRE",
}

export function Topbar() {
  const pathname = usePathname()

  // Buscamos el título de la página actual, con fallback por si no existe
  const pageTitle = pageTitles[pathname] ?? "SRE Portal"

  return (
    <header className="
      fixed top-0 right-0
      h-16
      left-64
      bg-surface-950/80
      backdrop-blur-sm
      border-b border-surface-800
      flex items-center justify-between
      px-6
      z-30
    ">
      {/* Título de la página actual */}
      <div>
        <h1 className="text-base font-semibold text-surface-100">
          {pageTitle}
        </h1>
        <p className="text-xs text-surface-500">
          Orquestación de Órdenes · Salesforce
        </p>
      </div>

      {/* Acciones del lado derecho */}
      <div className="flex items-center gap-3">

        {/* Indicador de squad — hardcodeado por ahora, vendrá de auth en el futuro */}
        <div className="
          flex items-center gap-2
          px-3 py-1.5
          rounded-lg
          bg-surface-800
          border border-surface-700
        ">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="text-xs text-surface-300 font-medium">
            Squad OM
          </span>
        </div>

        {/* Botón para ir directo al formulario de consulta */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => window.location.href = "/consultar"}
        >
          + Nueva consulta
        </Button>

      </div>
    </header>
  )
}