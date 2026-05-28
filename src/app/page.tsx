/**
 * page.tsx — Dashboard principal (v2)
 *
 * Responsabilidad: Vista de estado general del sistema SRE OM Operations.
 * 
 * Cambios v2 (feedback reuniones de tribu):
 * - "Squad" renombrado a "Iniciativa" en tabla de casos
 * - KPI de MTTR movido a posición secundaria (colapsable)
 * - Bugs relacionados reemplazan el espacio del MTTR
 * - "Actividad reciente" reemplazado por "Status OM en UAT"
 * - Status cards son botones que filtran la tabla en tiempo real
 * - Cada caso de la tabla es un hipervínculo a su detalle
 * - Columna "Iniciativa" agregada a casos recientes
 *
 * Es un Client Component porque maneja estado local de filtros.
 * En Fase 4 se conecta a Supabase para datos reales.
 */

"use client"

import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { mockCasos, mockKpis, mockBugsRelacionados, mockStatusUAT } from "@/constants"
import type { CasoSRE, BadgeVariant } from "@/types/case"

// ─── Tipos locales ───────────────────────────────────────────────────────────

// Filtro de estado activo en la tabla — null = mostrar todos
type FiltroEstado = BadgeVariant | null

// ─── Datos de los KPI cards superiores ───────────────────────────────────────
// MTTR ya no está acá — pasó a la sección secundaria colapsable
const kpiCards = [
  {
    titulo:      "Casos abiertos",
    valor:       mockKpis.casosAbiertos,
    descripcion: "Requieren atención",
    icono:       "🔴",
    color:       "text-red-400",
    filtro:      "open" as FiltroEstado,
  },
  {
    titulo:      "En progreso",
    valor:       mockCasos.filter(c => c.estado === "inProgress").length,
    descripcion: "Siendo trabajados ahora",
    icono:       "🟡",
    color:       "text-orange-400",
    filtro:      "inProgress" as FiltroEstado,
  },
  {
    titulo:      "Resueltos hoy",
    valor:       mockKpis.resueltosHoy,
    descripcion: "Cerrados en las últimas 24hs",
    icono:       "✅",
    color:       "text-green-400",
    filtro:      "resolved" as FiltroEstado,
  },
  {
    titulo:      "Consultas al agente",
    valor:       mockKpis.consultasAgente,
    descripcion: "Esta semana",
    icono:       "🤖",
    color:       "text-blue-400",
    filtro:      null,   // no filtra — solo informativo
  },
]

// ─── Mapa de colores para el estado del ambiente UAT ─────────────────────────
const colorEstadoUAT: Record<string, { dot: string; label: string; text: string }> = {
  ok:       { dot: "bg-green-500",  label: "bg-green-500/10 text-green-400 border border-green-500/20",  text: "OK"       },
  degradado:{ dot: "bg-yellow-400", label: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", text: "DEGRADADO" },
  down:     { dot: "bg-red-500",    label: "bg-red-500/10 text-red-400 border border-red-500/20",        text: "DOWN"     },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardPage() {

  // Estado local: qué filtro de estado está activo en la tabla
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(null)

  // Estado local: si el panel MTTR está expandido
  const [mttrExpandido, setMttrExpandido] = useState(false)

  // Casos filtrados según el botón KPI que se haya clickeado
  const casosFiltrados: CasoSRE[] = filtroEstado
    ? mockCasos.filter(c => c.estado === filtroEstado)
    : mockCasos

  // Función que alterna el filtro — si se clickea el mismo dos veces, limpia
  function toggleFiltro(filtro: FiltroEstado) {
    if (filtro === null) return           // KPI sin filtro (ej: consultas al agente)
    setFiltroEstado(prev => prev === filtro ? null : filtro)
  }

  return (
    <div className="space-y-6">

      {/* ── Sección 1: KPI Cards — clickeables para filtrar la tabla ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const estaActivo = filtroEstado === kpi.filtro && kpi.filtro !== null
          return (
            <button
              key={kpi.titulo}
              onClick={() => toggleFiltro(kpi.filtro)}
              className={`text-left transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50
                ${kpi.filtro !== null ? "cursor-pointer" : "cursor-default"}
                ${estaActivo ? "ring-2 ring-primary-500/60 scale-[1.02]" : ""}
              `}
              title={kpi.filtro ? `Filtrar por: ${kpi.titulo}` : undefined}
            >
              <Card className={`h-full transition-colors ${estaActivo ? "border-primary-500/40" : ""}`}>
                <Card.Content>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
                        {kpi.titulo}
                      </p>
                      <p className={`text-3xl font-bold ${kpi.color}`}>
                        {kpi.valor}
                      </p>
                      <p className="text-xs text-surface-500 mt-1">
                        {kpi.filtro !== null
                          ? estaActivo ? "▼ Filtrando ahora" : "Click para filtrar"
                          : kpi.descripcion}
                      </p>
                    </div>
                    <span className="text-2xl">{kpi.icono}</span>
                  </div>
                </Card.Content>
              </Card>
            </button>
          )
        })}
      </div>

      {/* ── Sección 2: MTTR secundario (colapsable) + Bugs relacionados ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* MTTR — colapsado por defecto, menos protagonismo */}
        <button
          onClick={() => setMttrExpandido(p => !p)}
          className="lg:col-span-1 text-left"
        >
          <Card className="h-full hover:border-surface-500 transition-colors cursor-pointer">
            <Card.Content>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
                    MTTR Promedio
                  </p>
                  <p className="text-2xl font-bold text-primary-400">
                    {mockKpis.mttr}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Mean Time To Resolution
                  </p>
                </div>
                <span className="text-xl text-surface-500">
                  {mttrExpandido ? "▲" : "▼"}
                </span>
              </div>
              {mttrExpandido && (
                <div className="mt-3 pt-3 border-t border-surface-700 space-y-1">
                  <p className="text-xs text-surface-400">Críticos: <span className="text-red-400 font-medium">38 min</span></p>
                  <p className="text-xs text-surface-400">High: <span className="text-orange-400 font-medium">24 min</span></p>
                  <p className="text-xs text-surface-400">Medium: <span className="text-yellow-400 font-medium">15 min</span></p>
                </div>
              )}
            </Card.Content>
          </Card>
        </button>

        {/* Bugs relacionados — ocupa las 3/4 del ancho */}
        <div className="lg:col-span-3">
          <Card>
            <Card.Header>
              <Card.Title>🐛 Bugs relacionados</Card.Title>
              <span className="text-xs text-surface-500">
                Vinculados a casos SRE activos
              </span>
            </Card.Header>
            <Card.Content className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Bug</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Título</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Caso SRE</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Severidad</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Estado</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-5 py-3">Reportado</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBugsRelacionados.map((bug) => (
                    <tr
                      key={bug.id}
                      className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-orange-400">{bug.id}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-surface-300 max-w-48 truncate block">
                          {bug.titulo}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {/* Caso SRE vinculado — hipervínculo */}
                        <Link
                          href={`/casos/${bug.casoId}`}
                          className="text-xs font-mono text-primary-400 hover:text-primary-300 underline underline-offset-2"
                        >
                          {bug.casoId}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={bug.severidad}>{bug.severidad.toUpperCase()}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={
                          bug.estado === "open"       ? "open"       :
                          bug.estado === "inProgress" ? "inProgress" :
                          "resolved"
                        }>
                          {bug.estado === "open"       ? "Abierto"     :
                           bug.estado === "inProgress" ? "En progreso" :
                           "Cerrado"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-surface-500">{bug.reportadoPor}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* ── Sección 3: Tabla de casos + Status OM en UAT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tabla de casos recientes — ocupa 2/3 del ancho */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center gap-3">
                <Card.Title>Casos recientes</Card.Title>
                {filtroEstado && (
                  // Indicador del filtro activo — click para limpiar
                  <button
                    onClick={() => setFiltroEstado(null)}
                    className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Badge variant={filtroEstado}>
                      {filtroEstado === "open"       ? "Abierto"     :
                       filtroEstado === "inProgress" ? "En progreso" :
                       filtroEstado === "resolved"   ? "Resuelto"    :
                       filtroEstado}
                    </Badge>
                    <span className="ml-1">✕ Limpiar filtro</span>
                  </button>
                )}
              </div>
              <span className="text-xs text-surface-500">
                {casosFiltrados.length} caso{casosFiltrados.length !== 1 ? "s" : ""}
                {filtroEstado ? " filtrados" : " — últimas 24 horas"}
              </span>
            </Card.Header>
            <Card.Content className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">ID</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">Iniciativa</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">Tipo</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">Severidad</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">Estado</th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">Agente</th>
                  </tr>
                </thead>
                <tbody>
                  {casosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-xs text-surface-500">
                        No hay casos con ese estado
                      </td>
                    </tr>
                  ) : (
                    casosFiltrados.map((caso: CasoSRE) => (
                      <tr
                        key={caso.id}
                        className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors"
                      >
                        {/* ID del caso como hipervínculo a su detalle */}
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
                          <span className="text-xs text-surface-400 max-w-32 truncate block">{caso.tipo}</span>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card.Content>
          </Card>
        </div>

        {/* Panel derecho: Status OM en UAT — reemplaza "Actividad reciente" */}
        <div>
          <Card className="h-full">
            <Card.Header>
              <Card.Title>🟢 Status OM en UAT</Card.Title>
              <span className="text-xs text-surface-500">En vivo</span>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {mockStatusUAT.map((servicio) => {
                  const estilo = colorEstadoUAT[servicio.estado]
                  return (
                    <div
                      key={servicio.nombre}
                      className="flex items-start justify-between py-2 border-b border-surface-800 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        {/* Dot de estado */}
                        <div className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${estilo.dot}`} />
                        <div>
                          <span className="text-sm text-surface-300 block">
                            {servicio.nombre}
                          </span>
                          {servicio.detalle && (
                            <span className="text-xs text-surface-500 block mt-0.5">
                              {servicio.detalle}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Badge de estado */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${estilo.label}`}>
                        {estilo.text}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Última actualización */}
              <p className="text-xs text-surface-600 mt-4 pt-3 border-t border-surface-800">
                Actualizado {mockStatusUAT[0].ultimaRevision} · Fuente: Salesforce API
              </p>
            </Card.Content>
          </Card>
        </div>

      </div>
    </div>
  )
}
