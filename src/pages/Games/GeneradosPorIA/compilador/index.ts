/**
 * Módulo del compilador de pseudocódigo PSeInt (compartido).
 *
 * Lo consumen el editor de pseudocódigo (EditingBoard) y el ejecutor de
 * diagramas de flujo (DesignBoard, vía diagramaACodigo.ts), de modo que
 * ambos tableros comparten el MISMO motor: tokenización, validación
 * estricta de sintaxis, transpilación a JavaScript, runtime con funciones
 * incorporadas y capturas del modo película.
 *
 * Fases internas:
 * - tokenizador.ts → limpia y tokeniza las líneas (normVar, preprocesar).
 * - expresion.ts   → parser de expresiones PSeInt a JS.
 * - compilador.ts  → transpilador de estructuras de control.
 * - runtime.ts     → ejecuta el JS generado (ejecutarPseudocodigo).
 * - tipos.ts       → contratos de callbacks/estado y tipos internos.
 * - diagramaACodigo.ts → adaptador grafo ReactFlow → texto PSeInt.
 */
export {
    ERROR_CANCELADO,
    ErrorCanceladoPorUsuario,
    esCanceladoPorUsuario,
    MAX_PASOS,
} from './tipos';
export type {
    CallbacksEjecucion,
    ContextoIteracion,
    EstadoEjecucion,
    Linea,
    ResultadoEjecucion,
    Token,
    TokenTipo,
    VariableEstado,
} from './tipos';
export { normVar, preprocesar, tokenizar } from './tokenizador';
export { Expresion, TIPOS_PSEINT } from './expresion';
export { Compilador, ejecutarPseudo } from './compilador';
export { ejecutarPseudocodigo } from './runtime';
export { ejecutarCasosPrueba } from './casosPrueba';
export { generarCodigoDeDiagrama, ErrorDiagrama } from './diagramaACodigo';
export type { CodigoDeDiagrama } from './diagramaACodigo';
