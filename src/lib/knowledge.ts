/**
 * knowledge.ts
 * 
 * Base de conocimiento del squad OM — usada para RAG por prompt injection.
 * 
 * Responsabilidad: Proveer contexto técnico específico del equipo al agente
 * antes de cada consulta, según el tipo de error reportado.
 * 
 * Fuentes: Resumen_Conocimientos_OM, Categorías_Errores_OM, Informacion_Tecnica_OM
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CategoriaError =
  | 'DESCOMPOSICION'
  | 'MAPPING_ATRIBUTOS'
  | 'CONDICIONES_ORQUESTACION'
  | 'DEPENDENCIAS_TAREAS'
  | 'INTEGRACION'
  | 'REQUEST_PAYLOAD'
  | 'ESTADO_ORDEN'
  | 'ASSETIZACION'
  | 'INFLIGHT'
  | 'ROLLBACK'
  | 'COMERCIAL_TECNICO'
  | 'CONFIGURACION_AMBIENTE'
  | 'GENERAL';

interface FragmentoConocimiento {
  categoria: CategoriaError;
  titulo: string;
  contenido: string;
}

// ─── Base de conocimiento ─────────────────────────────────────────────────────

const BASE_CONOCIMIENTO: FragmentoConocimiento[] = [
  {
    categoria: 'GENERAL',
    titulo: 'Qué es OM y conceptos clave',
    contenido: `
OM (Order Management) es el squad dentro del cluster Provision encargado de gestionar
la orquestación de pedidos sobre sistemas de backend: SOM, CBS, Huawei, SRI, Nokia, entre otros.

CONCEPTOS CLAVE:
- Planes de Orquestación: estructuras que definen el flujo completo de una orden
- Orch Items: ítems individuales dentro del plan
- Tasks: tareas específicas (S563, S564, S565, S591, S298, S203, S372, etc.)
- Swimlane: carril dentro del plan que agrupa ítems de un producto técnico
- Escenarios: combinación de producto + action + sub-action + condition que define qué ejecutar

ESTADOS DE TAREAS: Completed | Running | Failed | Fatally Failed | Skipped

ATRIBUTOS XOM CLAVE:
- XOM_IS_ERROR_SOM: indica si hubo error en SOM, activa lógica de skip
- XOM_SUBGESTION: tipo de subgestión (Cambio en Curso, etc.)
- XOM_PEVC.NOKIA_CONNECT: flag de conexión Nokia
- XOM_PEVC.NOKIA_AMEND: flag de amend Nokia
- XOM_PLAN.SKIP_S591: flag para omitir rollback S591
- XOM_PLAN.SKIP_S563_AMEND: flag para omitir S563 en amend
- XOM_WRONG_STATUS_SOM: estado incorrecto en SOM
- XOM_PEVC.NOKIA_SERVICE_TYPE: tipo de servicio Nokia (útil para desbloquear tareas)

TIPOS DE NODOS: superseded (nodo anterior), target (nodo nuevo), base (nodo base)

ESTADOS DE ORDEN EN CRM vs OM:
- Draft/Ready To Submit → orden creada, no enviada
- In Progress → orden en ejecución en OM
- Rejected → orden no pudo descomponerse, puede reenviar modificando la orden CRM
- Activated → orden completada y assetizada
- Cancelled/Superseded → orden cancelada
    `,
  },
  {
    categoria: 'DESCOMPOSICION',
    titulo: 'Errores de descomposición',
    contenido: `
ERRORES DE DESCOMPOSICIÓN: la orden no genera correctamente los productos técnicos,
atributos o estructuras necesarias.

Ejemplos típicos:
- No se crea Nokia Data Access
- No se genera IPTV Account
- Falta atributo técnico en la descomposición
- Se envía mal XOM_OWNER_NETWORK
- Producto comercial no mapea al producto técnico esperado

Qué validar:
- Producto comercial vendido vs producto técnico generado
- Decomposition Relationship activa
- Mapeos activos en el ambiente
- Atributos enviados al producto técnico

Causa probable: configuración incorrecta de decomposition, mapping faltante,
o cambio funcional no replicado en todos los escenarios.

Ordenes Rejected: son órdenes que llegaron a OM pero no pudieron descomponerse.
Quedan en estado Rejected. Se puede modificar la orden CRM y reenviar.
Reenviar sin modificación produce el mismo resultado.
    `,
  },
  {
    categoria: 'MAPPING_ATRIBUTOS',
    titulo: 'Errores de atributos y mapping',
    contenido: `
ERRORES DE MAPPING/ATRIBUTOS: la orden existe pero algún atributo técnico llega
vacío, incorrecto o con valor no esperado.

Ejemplos típicos:
- XOM_PROVINCIA llega vacío
- XOM_HW_MUNICIPALITY_ADDRESS no se envía
- NETFLIX_ACTION_REASON llega como VOLUNTARY en lugar de CHANGE_OF_PLAN
- XOM_SUBGESTION no permite activar una condición

Qué validar:
- Valor esperado vs valor recibido
- Fuente del dato (SF, Java, mapping)
- Nodo donde debería viajar el atributo
- Si aplica para: Venta, CAPLAN, CADOM, CATIT, Baja, Inflight

Causa probable: mapping Java incorrecto, atributo no poblado desde SF,
condición incompleta o dato no disponible en la orden.
    `,
  },
  {
    categoria: 'CONDICIONES_ORQUESTACION',
    titulo: 'Errores de condiciones de orquestación',
    contenido: `
ERRORES DE CONDICIONES: una tarea se ejecuta cuando no debe, o se skipea cuando sí debería.

Ejemplos típicos:
- S591_CancelProvision se ejecuta cuando debía omitirse
- S563 se skipea incorrectamente
- S564 queda esperando aunque S563 no corrió
- Se activa rama TV en modificación solo de Internet
- XOM_IS_ERROR_SOM no se evalúa correctamente

Qué validar:
- Condición exacta de la tarea
- Flags del plan activos
- Estado de tareas anteriores (Completed/Skipped/Failed)
- XOM_SUBGESTION
- XOM_PEVC.NOKIA_CONNECT y XOM_PEVC.NOKIA_AMEND
- XOM_PLAN.SKIP_S591
- XOM_PLAN.SKIP_S563_AMEND

Causa probable: condición mal configurada, dependencia incompleta,
flag no seteado, o escenario no contemplado.

Para ver qué activa/desactiva tareas: entrar al Orchestration Plan en Salesforce
y revisar los Orchestration Scenarios (Product + Action + Sub-action + Condition Data).
    `,
  },
  {
    categoria: 'DEPENDENCIAS_TAREAS',
    titulo: 'Errores de dependencias entre tareas',
    contenido: `
ERRORES DE DEPENDENCIAS: una tarea arranca antes de tiempo, queda esperando
una tarea que no corresponde, o no respeta el orden lógico del plan.

Ejemplos típicos:
- TOIP se aprovisiona antes del cierre de OT
- S564 queda en Running esperando evento que nunca llega
- Rollback se activa sin que termine la tarea previa
- Tarea depende de Completed pero la anterior quedó Skipped

Qué validar:
- Dependencias configuradas en el plan
- Estados esperados: Completed | Skipped | Failed | Running
- Si la tarea depende de otra que puede ser skipeada
- Si falta una dependencia adicional para cubrir el escenario

Causa probable: dependencia mal definida o escenario de excepción no considerado.

Escenario conocido (B2CPROV-5881/6357): tareas en Running no cancelables.
Solución: lógica en Steerer o dependencias adicionales.
Escenario conocido (B2CPROV-3656): portabilidad anticipada con deco.
Requiere dependencia con S564 de IPTV antes de aprovisionar.
    `,
  },
  {
    categoria: 'INTEGRACION',
    titulo: 'Errores de integración con sistemas externos',
    contenido: `
ERRORES DE INTEGRACIÓN: provienen de servicios externos (Huawei, Nokia, CBS, SOM, VMI, SAP).

Ejemplos típicos:
- Error en S203 (Huawei)
- Error en S372
- Error en S298 (Huawei — codificación de objDeduccion, codAccesoCuenta, codCargo)
- Error CBS: "Product management verification failed"
- Error SOM con status 8
- Timeout Datapower: error de tiempo de espera, revisar conectividad con SOM

Qué validar:
- Tarea que falló
- Request enviado vs response recibido
- Código de error específico
- Proveedor afectado
- Si el error es funcional, técnico o de datos

Errores conocidos:
- SOM_E12 | Request execution failed: tarea falló y se ejecutó rollback
- ERR008: producto bloqueado en INACTIVE, no puede reprovisionarse
- Número Inválido en S575: número TOIP mal parametrizado

Causa probable: dato inválido enviado desde OM, proveedor caído,
contrato de integración incorrecto, o error funcional del sistema externo.
    `,
  },
  {
    categoria: 'REQUEST_PAYLOAD',
    titulo: 'Errores de request y payload',
    contenido: `
ERRORES DE REQUEST/PAYLOAD: la integración se ejecuta pero el cuerpo del request
está incompleto o mal armado.

Ejemplos típicos:
- Falta nodo objDeduccion
- Falta codCuenta
- Se envía mal C_Sub_Address
- Falta NETFLIX_ACTION_REASON
- Nodo técnico incorrecto para Huawei/Nokia

Qué validar:
- JSON/XML enviado
- Nodo esperado vs nodo recibido
- Atributos obligatorios del contrato
- Comparación con historia funcional de referencia
- Diferencias entre escenarios: Venta, Preactivación, CAPLAN, CADOM, CATIT

Tareas clave y su payload:
- S563: callout de provisión a Nokia/SOM. Line 1 = Data Access (modem).
  Line 2 = Internet. PARENT_INSTANCE_ID = instanceId del Data Access.
  LINE_2_BANDWIDTH = velocidad comercial.
- S564: espera por cierre de provisión. Variantes: NK Data Access, NK IPTV, Amend Nokia.
- S298: envío a Huawei. Parámetros codificación según Delivery o Cita.
- S203: integración Huawei.

Causa probable: lógica Java incompleta, mapping incorrecto,
o condición que no agrega el nodo esperado.
    `,
  },
  {
    categoria: 'ESTADO_ORDEN',
    titulo: 'Errores de estado de orden',
    contenido: `
ERRORES DE ESTADO: la orden, item o asset queda en estado inconsistente.

Ejemplos típicos:
- Orden queda en Running
- Tarea queda en Failed
- Orden aprovisionada en red pero no assetizada
- Orden cancelada con tareas activas
- Fallout-Steerer falla al cancelar Conciliate

Qué validar:
- Estado de la orden (vlocity_cmt__OrderStatus__c)
- Estado de los Order Items (vlocity_cmt__FulfilmentStatus__c)
- Estado de las tareas individuales
- Estado del asset
- Si hubo cancelación, rollback o proceso Conciliate

Causa probable: error en transición de estado, integración interrumpida,
falta de rollback, o inconsistencia entre OM y sistemas externos.
    `,
  },
  {
    categoria: 'ASSETIZACION',
    titulo: 'Errores de assetización',
    contenido: `
ERRORES DE ASSETIZACIÓN: servicio se aprovisiona/modifica pero no queda
correctamente reflejado como asset en la cuenta del cliente.

Ejemplos típicos:
- Servicio activo en red pero no assetizado
- Asset no se actualiza luego de CAPLAN
- Baja no actualiza correctamente motivo/submotivo
- Cambio de titularidad no impacta el asset esperado

Qué validar:
- Asset anterior vs asset posterior al cambio
- Acción aplicada (Venta, CAPLAN, CADOM, Baja)
- Orden que generó el cambio
- Si el proceso de assetización corrió

Causa probable: falla post-provisión, proceso de assetización incompleto,
o datos inconsistentes entre orden y asset.

Nota: Conciliate (Reconcile) son tareas que sincronizan el estado de los productos
con los sistemas finales. Controla el Steerer.
    `,
  },
  {
    categoria: 'INFLIGHT',
    titulo: 'Errores de Inflight / Cambio en curso',
    contenido: `
ERRORES INFLIGHT: problemas cuando una orden se modifica o cancela
mientras otra está en curso.

Ejemplos típicos:
- Se agrega deco en orden en curso y se genera mal el amend
- Se cancela orden inflight y no se ejecuta rollback correcto
- Se ejecuta rama incorrecta TV/Internet
- S563 se skipea pero S564 queda esperando
- Cancelaciones Inflight (B2CPROV-4721): rollback condicional según respuesta S564

Qué validar:
- Orden original en curso
- Orden de cambio (amend)
- Orden de cancelación si aplica
- XOM_SUBGESTION = "Cambio en Curso"
- Flags de Amend activos
- Tareas generadas en rama TV vs Internet
- XOM_PEVC.NOKIA_AMEND

Causa probable: manejo incompleto de escenarios inflight,
flags mal seteados, o condiciones antiguas no adaptadas al escenario.
    `,
  },
  {
    categoria: 'ROLLBACK',
    titulo: 'Errores de rollback y cancelación',
    contenido: `
ERRORES DE ROLLBACK: la cancelación no revierte correctamente lo provisionado,
o intenta revertir algo que no corresponde.

Ejemplos típicos:
- S591_CancelProvision corre indebidamente
- Rollback no se activa aunque debería
- Se intenta cancelar algo que SOM ya marcó con error
- Se cancela orden Conciliate en estado incorrecto

Qué validar:
- Tarea original provisionada (¿llegó a Completed, Failed o Skipped?)
- Flags de error: XOM_IS_ERROR_SOM, XOM_WRONG_STATUS_SOM
- Condiciones de rollback configuradas
- Estado real de la provisión en SOM
- XOM_PLAN.SKIP_S591

Causa probable: condición de rollback incompleta,
error no contemplado, o falta de validación del estado real de la provisión.
    `,
  },
  {
    categoria: 'COMERCIAL_TECNICO',
    titulo: 'Errores de datos comerciales vs técnicos',
    contenido: `
ERRORES COMERCIAL VS TÉCNICO: la lógica comercial de Salesforce no coincide
con lo que la red/proveedor espera.

Ejemplos típicos:
- Producto comercial dice Flow Full pero técnicamente se envía como otro tipo
- Bundle con deco vs sin deco mal interpretado
- Internet + IPTV genera rama incorrecta
- Cambio de monoproducto a bundle detectado erróneamente

Productos técnicos clave:
- Flow App: IPTV_ACCOUNT
- Packs: IPTV_VAS
- Nokia Data Access: DATA_ACCESS
- Nokia TOIP Account: TOIP
- Internet Service: INTERNET_SERVICE
- HFC variants: HFC_DATA_ACCESS, HFC_INTERNET_SERVICE, HFC_TOIP_ACCOUNT

Qué validar:
- Productos comerciales vs productos técnicos generados
- Bundle vs monoproducto
- Acción comercial vs acción técnica
- Tipo de red: HFC, FTTH, FWA, INFRACO

Causa probable: regla de transformación incorrecta
o interpretación errónea del cambio comercial.
    `,
  },
  {
    categoria: 'CONFIGURACION_AMBIENTE',
    titulo: 'Errores de configuración por ambiente',
    contenido: `
ERRORES POR AMBIENTE: problemas que aparecen en SIT/UAT/Prod
por diferencias de configuración entre ambientes.

Ejemplos típicos:
- En SIT funciona, en UAT no
- Falta un mapping en UAT
- Diferente versión de Java desplegada
- Configuración de producto distinta entre ambientes
- Plan de orquestación no actualizado en el ambiente

Qué validar:
- Ambiente donde ocurre el problema
- Fecha del último deploy en ese ambiente
- Versión de configuración activa
- Si el cambio está en metadata, Java o configuración de producto
- Comparación SIT vs UAT vs Prod

Causa probable: desalineación entre ambientes o deploy parcial.
El cambio puede estar deployado en SIT pero no en UAT todavía.
    `,
  },
];

// ─── Función principal de selección de contexto ───────────────────────────────

/**
 * Selecciona los fragmentos de conocimiento más relevantes para una consulta.
 * Siempre incluye el contexto GENERAL + el contexto específico de la categoría.
 * Si la descripción menciona palabras clave, también agrega contextos relacionados.
 */
export function seleccionarContextoRelevante(
  categoriaError: string,
  descripcionProblema: string
): string {
  const descripcionLower = descripcionProblema.toLowerCase();

  // Siempre incluimos el contexto general
  const fragmentosSeleccionados = new Set<CategoriaError>(['GENERAL']);

  // Agregamos la categoría principal del formulario
  const categoriaValida = categoriaError as CategoriaError;
  if (categoriaValida) {
    fragmentosSeleccionados.add(categoriaValida);
  }

  // Detección automática por palabras clave en la descripción
  const reglasDeteccion: Array<{ palabrasClave: string[]; categoria: CategoriaError }> = [
    { palabrasClave: ['s563', 's564', 's591', 's298', 's203', 's372', 's565'], categoria: 'REQUEST_PAYLOAD' },
    { palabrasClave: ['xom_is_error_som', 'xom_subgestion', 'xom_pevc', 'xom_plan'], categoria: 'CONDICIONES_ORQUESTACION' },
    { palabrasClave: ['rollback', 'cancelacion', 'cancel provision', 's591'], categoria: 'ROLLBACK' },
    { palabrasClave: ['inflight', 'cambio en curso', 'amend', 'en curso'], categoria: 'INFLIGHT' },
    { palabrasClave: ['asset', 'assetizacion', 'conciliate', 'reconcile'], categoria: 'ASSETIZACION' },
    { palabrasClave: ['timeout', 'datapower', 'som_e12', 'err008', 'huawei', 'nokia', 'cbs'], categoria: 'INTEGRACION' },
    { palabrasClave: ['rejected', 'descomposicion', 'decomposition'], categoria: 'DESCOMPOSICION' },
    { palabrasClave: ['running', 'failed', 'estado', 'bloqueada', 'stuck'], categoria: 'ESTADO_ORDEN' },
    { palabrasClave: ['mapping', 'atributo', 'vacio', 'incorrecto', 'xom_provincia'], categoria: 'MAPPING_ATRIBUTOS' },
    { palabrasClave: ['sit', 'uat', 'prod', 'ambiente', 'deploy', 'version'], categoria: 'CONFIGURACION_AMBIENTE' },
  ];

  for (const regla of reglasDeteccion) {
    const coincide = regla.palabrasClave.some((palabra) =>
      descripcionLower.includes(palabra)
    );
    if (coincide) {
      fragmentosSeleccionados.add(regla.categoria);
    }
  }

  // Construir el texto de contexto final
  const fragmentos = BASE_CONOCIMIENTO.filter((f) =>
    fragmentosSeleccionados.has(f.categoria)
  );

  const contextoFormateado = fragmentos
    .map((f) => `### ${f.titulo}\n${f.contenido.trim()}`)
    .join('\n\n---\n\n');

  return contextoFormateado;
}