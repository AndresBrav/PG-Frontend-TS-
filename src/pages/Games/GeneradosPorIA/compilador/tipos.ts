/**
 * Tipos compartidos del compilador de pseudocódigo PSeInt.
 *
 * Módulo NÚCLEO compartido por el editor de pseudocódigo (EditingBoard) y
 * el ejecutor de diagramas de flujo (DesignBoard): aquí viven el contrato
 * de callbacks de ejecución, el estado que alimenta el modo película
 * (PanelVariablesEjecucion), y los tipos internos de tokens y líneas que
 * usan el tokenizador, el parser de expresiones y el transpilador.
 */
export interface CallbacksEjecucion {
    imprimir: (texto: string) => void;
    pedirEntrada: (
        nombre: string,
        tipo: string,
        mensajePrevio?: string
    ) => Promise<string>;
    /** Copia de las variables tras cada instrucción (modo debug). */
    onEstado?: (estado: EstadoEjecucion) => void;
}

export interface VariableEstado {
    nombre: string;
    valor: string;
}

export interface ContextoIteracion {
    tipo: 'Para' | 'Mientras' | 'Repetir';
    iteracion: number;
    variable?: string | null;
    valor?: string | null;
}

export interface EstadoEjecucion {
    /** Número de instrucción ejecutada (1-based). */
    paso: number;
    /** Línea del pseudocódigo que se estaba ejecutando (1-based, opcional). */
    linea?: number;
    /** Instrucción de origen asociada a esta captura. */
    instruccion?: string;
    /** Ciclos activos al momento de registrar la captura. */
    iteraciones?: ContextoIteracion[];
    variables: VariableEstado[];
}

export interface ResultadoEjecucion {
    salida: string[];
    error?: string;
}

/** Marcador de ejecución cancelada por el usuario (botón Cancelar de un "Leer"). */
export const ERROR_CANCELADO = 'EJECUCION_CANCELADA';

/** Clase de error para abortar la ejecución completa al cancelar una entrada. */
export class ErrorCanceladoPorUsuario extends Error {
    constructor() {
        super(ERROR_CANCELADO);
        this.name = 'ErrorCanceladoPorUsuario';
    }
}

/**
 * Indica si un error corresponde a una cancelación del usuario
 * (no debe mostrarse como error, solo como ejecución detenida).
 * Acepta el Error lanzado o el `result.error` (string) del compilador.
 */
export const esCanceladoPorUsuario = (
    error: unknown,
): boolean =>
    error instanceof ErrorCanceladoPorUsuario ||
    (error instanceof Error && error.message === ERROR_CANCELADO) ||
    (typeof error === 'string' && error === ERROR_CANCELADO);

export const MAX_PASOS = 1000000;

export type TokenTipo = 'word' | 'num' | 'str' | 'punt';

export interface Token {
    tipo: TokenTipo;
    val: string;
}

export interface Linea {
    numero: number;
    texto?: string;
    toks: Token[];
}