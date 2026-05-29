/**
 * historial/page.tsx
 *
 * Pantalla de historial de casos del portal SRE OM Operations.
 * Muestra todos los casos registrados con filtros y búsqueda.
 *
 * CAMBIO v2 (Categoría 3 — feedback tribu QA):
 * - Filtros de tiempo: Últimas 24hs / Última semana / Último mes / Todo
 * - Filtro por estado: Abierto / En progreso / Resuelto / Escalado
 * - IDs de casos como hipervínculos clickeables
 * - Barra de filtros reorganizada en filas limpias
 *
 * NOTA: Con mock data, el filtro de tiempo no filtra realmente porque
 * creadoHace es texto, no fecha. Queda preparado para Fase 4 con Supabase.
 */

"use client"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { mockCasos, SEVERIDADES } from "@/constants"
import type { CasoSRE, BadgeVariant } from "@/types/case"

// ─── Tipos locales ────────────────────────────────────────────────────────────

// Opciones de filtro de tiempo — en Fase 4 se usan para queries a Supabase
type FiltroTiempo = "24hs" | "semana" | "mes" | "todo"

// Opciones de filtro de estado
type FiltroEstado = "todos" | "open" | "inProgress" | "resolved" | "escalated"

// ─── Configuración de los chips de tiempo ─────────────────────────────────────
const opcionesTiempo: { label: string; valor: FiltroTiempo }[] = [
  { label: "Últimas 24hs",  valor: "24hs"   },
  { label: "Última semana", valor: "semana" },
  { label: "Último mes",    valor: "mes"    },
  { label: "Todo",          valor: "todo"   },
]

// ─── Configuración de los chips de estado ─────────────────────────────────────
const opcionesEstado: { label: string; valor: FiltroEstado; variant: BadgeVariant | null }[] = [
  { label: "Todos",        valor: "todos",      variant: null          },
  { label: "Abierto",      valor: "open",       variant: "open"        },
  { label: "En progreso",  valor: "inProgress", variant: "inProgress"  },
  { label: "Resuelto",     valor: "resolved",   variant: "resolved"    },
  { label: "Escalado",     valor: "escalated",  variant: "escalated"   },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HistorialPage() {

  // Estado de los tres ejes de filtrado
  const [busqueda,        setBusqueda]        = useState("")
  const [filtroTiempo,    setFiltroTiempo]    = useState<FiltroTiempo>("todo")
  const [filtroEstado,    setFiltroEstado]    = useState<FiltroEstado>("todos")
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>("todas")

  // ─── Lógica de filtrado ───────────────────────────────────────────────────
  // Cuando conectemos Supabase, filtroTiempo se convierte en un rango de fechas
  // para la query. Por ahora filtra por texto, estado y severidad.
  const casosFiltrados = mockCasos.filter((caso: CasoSRE) => {

    const coincideBusqueda =
      busqueda === "" ||
      caso.id.toLowerCase().includes(busqueda.toLowerCase())          ||
      caso.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.iniciativa.toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado =
      filtroEstado === "todos" || caso.estado === filtroEstado

    const coincideSeveridad =
      filtroSeveridad === "todas" || caso.severidad === filtroSeveridad

    return coincideBusqueda && coincideEstado && coincideSeveridad
  })

  // ─── Clase CSS compartida para chips activos/inactivos ────────────────────
  function claseChip(estaActivo: boolean): string {
    return `
      px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer
      ${estaActivo
        ? "bg-primary-500/15 text-primary-400 border-primary-500/30"
        : "bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500"
      }
    `
  }

  return (
    <div className="space-y-4">

      {/* ── Barra de filtros — tres filas ── */}
      <Card>
        <Card.Content className="space-y-4">

          {/* Fila 1: Filtros de tiempo */}
          <div>
            <p className="text-xs text-surface-500 mb-2">Período</p>
            <div className="flex gap-2 flex-wrap">
              {opcionesTiempo.map(({ label, valor }) => (
                <button
                  key={valor}
                  onClick={() => setFiltroTiempo(valor)}
                  className={claseChip(filtroTiempo === valor)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Filtros de estado */}
          <div>
            <p className="text-xs text-surface-500 mb-2">Estado</p>
            <div className="flex gap-2 flex-wrap">
              {opcionesEstado.map(({ label, valor, variant }) => (
                <button
                  key={valor}
                  onClick={() => setFiltroEstado(valor)}
                  className={claseChip(filtroEstado === valor)}
                >
                  {variant
                    ? <Badge variant={variant}>{label}</Badge>
                    : label
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Fila 3: Severidad + Buscador */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Filtro por severidad */}
            <div>
              <p className="text-xs text-surface-500 mb-2">Severidad</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFiltroSeveridad("todas")}
                  className={claseChip(filtroSeveridad === "todas")}
                >
                  Todas
                </button>
                {SEVERIDADES.map(({ label, variant }) => (
                  <button
                    key={label}
                    onClick={() => setFiltroSeveridad(variant)}
                    className={claseChip(filtroSeveridad === variant)}
                  >
                    <Badge variant={variant as BadgeVariant}>{label}</Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Buscador — crece para ocupar el espacio restante */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-xs text-surface-500 mb-2">Búsqueda</p>
              <input
                type="text"
                placeholder="Buscar por ID, iniciativa o descripción..."
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

          </div>

          {/* Indicador de filtros activos — aparece cuando hay algo seleccionado */}
          {(filtroTiempo !== "todo" || filtroEstado !== "todos" || filtroSeveridad !== "todas" || busqueda !== "") && (
            <div className="flex items-center gap-2 pt-1 border-t border-surface-800">
              <span className="text-xs text-surface-500">Filtros activos:</span>
              {filtroTiempo    !== "todo"   && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">{opcionesTiempo.find(o => o.valor === filtroTiempo)?.label}</span>}
              {filtroEstado    !== "todos"  && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">{opcionesEstado.find(o => o.valor === filtroEstado)?.label}</span>}
              {filtroSeveridad !== "todas"  && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">{filtroSeveridad.toUpperCase()}</span>}
              {busqueda        !== ""       && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">"{busqueda}"</span>}
              <button
                onClick={() => { setBusqueda(""); setFiltroTiempo("todo"); setFiltroEstado("todos"); setFiltroSeveridad("todas") }}
                className="text-xs text-surface-500 hover:text-surface-300 ml-1 transition-colors"
              >
                ✕ Limpiar todo
              </button>
            </div>
          )}

        </Card.Content>
      </Card>

      {/* ── Tabla de casos ── */}
      <Card>
        <Card.Header>
          <Card.Title>Casos registrados</Card.Title>
          <span className="text-xs text-surface-500">
            {casosFiltrados.length} resultado{casosFiltrados.length !== 1 ? "s" : ""}
            {filtroTiempo !== "todo" && ` · ${opcionesTiempo.find(o => o.valor === filtroTiempo)?.label}`}
          </span>
        </Card.Header>
        <Card.Content className="p-0">
          {casosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-surface-400 mb-1">No se encontraron casos</p>
              <p className="text-xs text-surface-600">Probá con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  {["ID", "Iniciativa", "Tipo", "Orden", "Severidad", "Estado", "Agente", "Hace"].map(col => (
                    <th key={col} className="text-left text-xs text-surface-500 font-medium px-6 py-3">
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
                    {/* ID como hipervínculo — igual que en el dashboard */}
                    <td className="px-6 py-3">
                      <Link
                        href={`/casos/${caso.id}`}
                        className="text-xs font-mono text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                      >
                        {caso.id}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-300">{caso.iniciativa}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-400 max-w-40 truncate block">{caso.tipo}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-surface-500">{caso.orden}</span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={caso.severidad}>{caso.severidad.toUpperCase()}</Badge>
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
                      <span className="text-xs text-surface-400">{caso.agente}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-500">{caso.creadoHace}</span>
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
        <Button variant="primary" onClick={() => window.location.href = "/consultar"}>
          + Nueva consulta
        </Button>
      </div>

    </div>
  )
}