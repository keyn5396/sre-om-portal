/**
 * historial/page.tsx
 *
 * Pantalla de historial de casos del portal SRE OM Operations.
 * Muestra todos los casos registrados con filtros y búsqueda.
 * Es un Client Component porque maneja estado de filtros con useState.
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { mockCasos, SEVERIDADES } from "@/constants"
import type { CasoSRE, BadgeVariant } from "@/types/case"

export default function HistorialPage() {
  const [busqueda, setBusqueda]         = useState("")
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>("todas")

  // Filtra los casos según búsqueda y severidad seleccionada
  const casosFiltrados = mockCasos.filter((caso: CasoSRE) => {
    const coincideBusqueda =
      busqueda === "" ||
      caso.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.squad.toLowerCase().includes(busqueda.toLowerCase())

    const coincideSeveridad =
      filtroSeveridad === "todas" ||
      caso.severidad === filtroSeveridad

    return coincideBusqueda && coincideSeveridad
  })

  return (
    <div className="space-y-4">

      {/* ── Barra de filtros ── */}
      <Card>
        <Card.Content>
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Buscador */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por ID, squad o descripción..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-surface-800 border border-surface-700
                  rounded-lg text-sm text-surface-100
                  placeholder:text-surface-600
                  focus:outline-none focus:border-primary-500
                  transition-colors
                "
              />
            </div>

            {/* Filtro por severidad */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltroSeveridad("todas")}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium border transition-colors
                  ${filtroSeveridad === "todas"
                    ? "bg-primary-500/15 text-primary-400 border-primary-500/30"
                    : "bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500"
                  }
                `}
              >
                Todas
              </button>
              {SEVERIDADES.map(({ label, variant }) => (
                <button
                  key={label}
                  onClick={() => setFiltroSeveridad(variant)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium border transition-colors
                    ${filtroSeveridad === variant
                      ? "bg-primary-500/15 text-primary-400 border-primary-500/30"
                      : "bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500"
                    }
                  `}
                >
                  <Badge variant={variant as BadgeVariant}>{label}</Badge>
                </button>
              ))}
            </div>

          </div>
        </Card.Content>
      </Card>

      {/* ── Tabla de casos ── */}
      <Card>
        <Card.Header>
          <Card.Title>Casos registrados</Card.Title>
          <span className="text-xs text-surface-500">
            {casosFiltrados.length} resultado{casosFiltrados.length !== 1 ? "s" : ""}
          </span>
        </Card.Header>
        <Card.Content className="p-0">
          {casosFiltrados.length === 0 ? (
            // Estado vacío cuando no hay resultados
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-surface-400 mb-1">
                No se encontraron casos
              </p>
              <p className="text-xs text-surface-600">
                Probá con otros filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  {["ID", "Squad", "Tipo", "Orden", "Severidad", "Estado", "Agente", "Hace"].map(col => (
                    <th
                      key={col}
                      className="text-left text-xs text-surface-500 font-medium px-6 py-3"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {casosFiltrados.map((caso: CasoSRE) => (
                  <tr
                    key={caso.id}
                    className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-primary-400">
                        {caso.id}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-300">
                        {caso.squad}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-400 max-w-40 truncate block">
                        {caso.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-surface-500">
                        {caso.orden}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={caso.severidad}>
                        {caso.severidad.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={caso.estado}>
                        {caso.estado === "open"       ? "Abierto"     :
                         caso.estado === "resolved"   ? "Resuelto"    :
                         caso.estado === "inProgress" ? "En progreso" :
                         caso.estado === "escalated"  ? "Escalado"    :
                         caso.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-400">
                        {caso.agente}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-500">
                        {caso.creadoHace}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card.Content>
      </Card>

      {/* ── Botón nueva consulta ── */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => window.location.href = "/consultar"}
        >
          + Nueva consulta
        </Button>
      </div>

    </div>
  )
}