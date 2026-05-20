/**
 * page.tsx — Dashboard principal
 *
 * Primera pantalla del portal SRE OM Operations.
 * Muestra el estado general del sistema de un vistazo:
 * KPIs, casos recientes y estado de los agentes.
 *
 * Todos los datos son mock por ahora — se conectan a Supabase en Fase 4.
 */

import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { mockCasos, mockKpis } from "@/constants"
import type { CasoSRE } from "@/types/case"

// Datos de los 4 KPI cards — estructura, ícono, valor y descripción
const kpiCards = [
  {
    titulo:      "MTTR Promedio",
    valor:       mockKpis.mttr,
    descripcion: "Mean Time To Resolution",
    icono:       "⏱",
    color:       "text-primary-400",
  },
  {
    titulo:      "Casos abiertos",
    valor:       mockKpis.casosAbiertos,
    descripcion: "Requieren atención",
    icono:       "🔴",
    color:       "text-red-400",
  },
  {
    titulo:      "Resueltos hoy",
    valor:       mockKpis.resueltosHoy,
    descripcion: "Casos cerrados en las últimas 24hs",
    icono:       "✅",
    color:       "text-green-400",
  },
  {
    titulo:      "Consultas al agente",
    valor:       mockKpis.consultasAgente,
    descripcion: "Esta semana",
    icono:       "🤖",
    color:       "text-blue-400",
  },
]

// Estado de cada sub-agente del sistema Gemini
const estadoAgentes = [
  { nombre: "Coordinador",  estado: "Activo",     color: "bg-green-500" },
  { nombre: "Diagnóstico",  estado: "Activo",     color: "bg-green-500" },
  { nombre: "Resolución",   estado: "Activo",     color: "bg-green-500" },
  { nombre: "Escalation",   estado: "En espera",  color: "bg-yellow-500" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* ── Sección 1: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.titulo}>
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
                    {kpi.descripcion}
                  </p>
                </div>
                <span className="text-2xl">{kpi.icono}</span>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* ── Sección 2: Tabla de casos + Estado de agentes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tabla de casos recientes — ocupa 2/3 del ancho */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Casos recientes</Card.Title>
              <span className="text-xs text-surface-500">
                Últimas 24 horas
              </span>
            </Card.Header>
            <Card.Content className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      ID
                    </th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      Squad
                    </th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      Tipo
                    </th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      Severidad
                    </th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      Estado
                    </th>
                    <th className="text-left text-xs text-surface-500 font-medium px-6 py-3">
                      Agente
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockCasos.map((caso: CasoSRE) => (
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
                        <span className="text-xs text-surface-400 max-w-32 truncate block">
                          {caso.tipo}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Content>
          </Card>
        </div>

        {/* Panel de estado de agentes — ocupa 1/3 del ancho */}
        <div className="space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>Estado de agentes</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {estadoAgentes.map((agente) => (
                  <div
                    key={agente.nombre}
                    className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${agente.color}`} />
                      <span className="text-sm text-surface-300">
                        {agente.nombre}
                      </span>
                    </div>
                    <span className="text-xs text-surface-500">
                      {agente.estado}
                    </span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Card de actividad reciente */}
          <Card>
            <Card.Header>
              <Card.Title>Actividad reciente</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {mockCasos.slice(0, 3).map((caso) => (
                  <div key={caso.id} className="flex gap-3">
                    <div className="w-1 rounded-full bg-surface-700 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-surface-300">
                        {caso.id} · {caso.squad}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {caso.creadoHace}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

      </div>
    </div>
  )
}