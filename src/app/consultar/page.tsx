/**
 * consultar/page.tsx
 *
 * Pantalla de consulta al agente Gemini.
 * El QA completa el formulario con los datos del problema
 * y recibe un diagnóstico estructurado del agente.
 *
 * Usando mock response mientras se resuelve el billing de Gemini API.
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { SQUADS, TIPOS_ERROR, SEVERIDADES } from "@/constants"
import type { ConsultaAgente, RespuestaAgente } from "@/types/agent"
import type { BadgeVariant } from "@/types/case"

// Respuesta simulada del agente — se reemplaza con Gemini real cuando se resuelva el billing
const mockRespuestaAgente: RespuestaAgente = {
  agenteDerivado:  "Agente de Diagnóstico",
  diagnostico:     "Se detectó una tarea S563 en estado Running sin avanzar. El plan de orquestación está bloqueado esperando respuesta de SOM que no llegó. El Push Event asociado no fue recibido en el tiempo esperado.",
  causaRaiz:       "Timeout en la integración con SOM. El endpoint no respondió dentro del SLA de 30 segundos, dejando la tarea en estado intermedio sin posibilidad de avanzar automáticamente.",
  pasosResolucion: [
    "Verificar el estado actual de la tarea en Salesforce Order Management",
    "Confirmar si el Push Event de SOM fue enviado revisando los logs de integración",
    "Si el Push Event no llegó, ejecutar el reenvío manual desde el panel de administración",
    "Si la tarea sigue en Running después de 5 minutos, proceder con la resolución manual",
    "Actualizar el estado del caso en el portal una vez resuelto",
  ],
  comandosSugeridos: [
    "GET /api/orders/{orderId}/orchestration-plan",
    "POST /api/orders/{orderId}/push-event/retry",
  ],
  tiempoEstimado: "15-20 minutos",
  escalacion:     false,
}

const estadoInicialFormulario: ConsultaAgente = {
  squad:       "",
  tipoError:   "",
  severidad:   "",
  numeroOrden: "",
  descripcion: "",
}

export default function ConsultarPage() {
  const [formulario, setFormulario] = useState<ConsultaAgente>(estadoInicialFormulario)
  const [cargando, setCargando]     = useState(false)
  const [respuesta, setRespuesta]   = useState<RespuestaAgente | null>(null)

  function actualizarCampo(campo: keyof ConsultaAgente, valor: string) {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  function formularioValido(): boolean {
    return (
      formulario.squad       !== "" &&
      formulario.tipoError   !== "" &&
      formulario.severidad   !== "" &&
      formulario.descripcion !== ""
    )
  }

  // Usa mock mientras Gemini API no está disponible
  // Para conectar Gemini real: reemplazar por llamada a /api/agent
  async function consultarAgente() {
    if (!formularioValido()) return
    setCargando(true)
    setRespuesta(null)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRespuesta(mockRespuestaAgente)
    setCargando(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Columna izquierda: Formulario ── */}
      <div className="space-y-4">
        <Card>
          <Card.Header>
            <Card.Title>Nueva consulta</Card.Title>
            <Badge variant="neutral">Agente Gemini</Badge>
          </Card.Header>
          <Card.Content className="space-y-4">

            {/* Squad */}
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">
                Squad <span className="text-red-400">*</span>
              </label>
              <select
                value={formulario.squad}
                onChange={e => actualizarCampo("squad", e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-surface-800 border border-surface-700
                  rounded-lg text-sm text-surface-100
                  focus:outline-none focus:border-primary-500
                  transition-colors
                "
              >
                <option value="">Seleccioná un squad</option>
                {SQUADS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Tipo de error */}
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">
                Tipo de error <span className="text-red-400">*</span>
              </label>
              <select
                value={formulario.tipoError}
                onChange={e => actualizarCampo("tipoError", e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-surface-800 border border-surface-700
                  rounded-lg text-sm text-surface-100
                  focus:outline-none focus:border-primary-500
                  transition-colors
                "
              >
                <option value="">Seleccioná el tipo de error</option>
                {TIPOS_ERROR.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Severidad — pills interactivos */}
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">
                Severidad <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {SEVERIDADES.map(({ label, variant }) => (
                  <button
                    key={label}
                    onClick={() => actualizarCampo("severidad", label)}
                    className={`
                      flex-1 py-2 rounded-lg text-xs font-medium
                      border transition-all duration-150
                      ${formulario.severidad === label
                        ? "border-primary-500 bg-primary-500/15 text-primary-400"
                        : "border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-500"
                      }
                    `}
                  >
                    <Badge variant={variant as BadgeVariant}>{label}</Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Número de orden */}
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">
                Número de orden Salesforce
              </label>
              <input
                type="text"
                placeholder="SF-00123456"
                value={formulario.numeroOrden}
                onChange={e => actualizarCampo("numeroOrden", e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-surface-800 border border-surface-700
                  rounded-lg text-sm text-surface-100
                  placeholder:text-surface-600
                  focus:outline-none focus:border-primary-500
                  transition-colors font-mono
                "
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">
                Descripción del problema <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describí el problema con el mayor detalle posible..."
                value={formulario.descripcion}
                onChange={e => actualizarCampo("descripcion", e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-surface-800 border border-surface-700
                  rounded-lg text-sm text-surface-100
                  placeholder:text-surface-600
                  focus:outline-none focus:border-primary-500
                  transition-colors resize-none
                "
              />
            </div>

            {/* Botón de consulta */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={cargando}
              disabled={!formularioValido()}
              onClick={consultarAgente}
            >
              {cargando ? "Consultando agente..." : "Consultar agente"}
            </Button>

          </Card.Content>
        </Card>
      </div>

      {/* ── Columna derecha: Respuesta del agente ── */}
      <div className="space-y-4">
        {!respuesta && !cargando && (
          <Card>
            <Card.Content>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="
                  w-16 h-16 rounded-2xl
                  bg-surface-800 border border-surface-700
                  flex items-center justify-center
                  text-3xl mb-4
                ">
                  🤖
                </div>
                <p className="text-sm font-medium text-surface-300 mb-1">
                  Agente listo para consultar
                </p>
                <p className="text-xs text-surface-500">
                  Completá el formulario y hacé click en "Consultar agente"
                </p>
              </div>
            </Card.Content>
          </Card>
        )}

        {cargando && (
          <Card>
            <Card.Content>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-surface-300">
                  El agente está analizando el problema...
                </p>
              </div>
            </Card.Content>
          </Card>
        )}

        {respuesta && (
          <div className="space-y-4">
            <Card>
              <Card.Content>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-surface-100">
                      {respuesta.agenteDerivado}
                    </span>
                  </div>
                  <Badge variant={respuesta.escalacion ? "escalated" : "resolved"}>
                    {respuesta.escalacion ? "Requiere escalación" : "Sin escalación"}
                  </Badge>
                </div>
                <p className="text-xs text-surface-400 leading-relaxed">
                  {respuesta.diagnostico}
                </p>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Causa raíz</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-surface-300 leading-relaxed">
                  {respuesta.causaRaiz}
                </p>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Pasos de resolución</Card.Title>
                <span className="text-xs text-surface-500">
                  ~{respuesta.tiempoEstimado}
                </span>
              </Card.Header>
              <Card.Content>
                <ol className="space-y-2">
                  {respuesta.pasosResolucion.map((paso, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="
                        w-5 h-5 rounded-full
                        bg-primary-500/15 text-primary-400
                        flex items-center justify-center
                        text-xs font-medium flex-shrink-0 mt-0.5
                      ">
                        {index + 1}
                      </span>
                      <span className="text-surface-300 leading-relaxed">
                        {paso}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card.Content>
            </Card>

            {respuesta.comandosSugeridos.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Comandos sugeridos</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-2">
                    {respuesta.comandosSugeridos.map((cmd, index) => (
                      <div
                        key={index}
                        className="
                          px-3 py-2 rounded-lg
                          bg-surface-950 border border-surface-700
                          font-mono text-xs text-primary-400
                        "
                      >
                        {cmd}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}