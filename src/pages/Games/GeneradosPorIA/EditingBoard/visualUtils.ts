import type { EstadoEjecucion } from '../compilador';

/** Paleta compartida de colores por variable (orden de aparición). */
export const COLORES_VARIABLE = [
    '#4ADE80',
    '#60A5FA',
    '#F472B6',
    '#FACC15',
    '#A78BFA',
    '#2DD4BF',
    '#FB923C',
    '#F87171',
];

export const colorDeVariable = (indice: number): string =>
    COLORES_VARIABLE[indice % COLORES_VARIABLE.length];

export type TipoValor = 'numero' | 'booleano' | 'arreglo' | 'texto';

const RE_NUMERO = /^-?\d+(\.\d+)?$/;

/** Clasifica un valor serializado del debug (siempre string). */
export const clasificarValor = (valor: string): TipoValor => {
    if (valor === 'VERDADERO' || valor === 'FALSO') return 'booleano';
    if (RE_NUMERO.test(valor)) return 'numero';
    if (valor.startsWith('[') && valor.endsWith(']')) {
        try {
            const parsed = JSON.parse(valor);
            if (Array.isArray(parsed)) return 'arreglo';
        } catch {
            /* no es JSON válido */
        }
    }
    return 'texto';
};

export interface PerfilVariable {
    nombre: string;
    indice: number;
    tipo: TipoValor;
    /** Serie numérica (solo cuando tipo === 'numero'). */
    serie: { paso: number; valor: number }[];
    /** Serie booleana (solo cuando tipo === 'booleano'). */
    serieBool: { paso: number; valor: boolean }[];
    /** Serie de arreglos parseados (solo cuando tipo === 'arreglo'). */
    serieArreglo: { paso: number; valores: unknown[] }[];
}

/**
 * Perfiles de variables a partir de la traza: nombre estable por orden de
 * aparición y series por tipo. Un perfil es "numero"/etc según el valor
 * más reciente (las capturas previas de otros tipos se heredan igual).
 */
export const perfilesDe = (historial: EstadoEjecucion[]): PerfilVariable[] => {
    const perfiles = new Map<string, PerfilVariable>();

    for (const captura of historial) {
        for (const v of captura.variables) {
            let perfil = perfiles.get(v.nombre);
            if (!perfil) {
                perfil = {
                    nombre: v.nombre,
                    indice: perfiles.size,
                    tipo: clasificarValor(v.valor),
                    serie: [],
                    serieBool: [],
                    serieArreglo: [],
                };
                perfiles.set(v.nombre, perfil);
            }
            const tipo = clasificarValor(v.valor);
            switch (tipo) {
                case 'numero':
                    perfil.serie.push({
                        paso: captura.paso,
                        valor: Number(v.valor),
                    });
                    break;
                case 'booleano':
                    perfil.serieBool.push({
                        paso: captura.paso,
                        valor: v.valor === 'VERDADERO',
                    });
                    break;
                case 'arreglo': {
                    try {
                        const valores = JSON.parse(v.valor) as unknown[];
                        perfil.serieArreglo.push({
                            paso: captura.paso,
                            valores: Array.isArray(valores) ? valores : [],
                        });
                    } catch {
                        /* ignora capturas no parseables */
                    }
                    break;
                }
                default:
                    break;
            }
            perfil.tipo = tipo;
        }
    }

    return [...perfiles.values()];
};

/** Utilidades de escala para mini-gráficas SVG. */
export const escalaSerie = (
    serie: { valor: number }[],
    altura: number
): { min: number; max: number; yDe: (v: number) => number } => {
    const valores = serie.map((p) => p.valor);
    let min = Math.min(...valores);
    let max = Math.max(...valores);
    if (min === max) {
        min -= 1;
        max += 1;
    }
    const margen = (max - min) * 0.1;
    min -= margen;
    max += margen;
    const rango = max - min;
    return {
        min,
        max,
        yDe: (v: number) => altura - ((v - min) / rango) * altura,
    };
};

export interface SwapInfo {
    haySwap: boolean;
    indiceA: number; // 0-based
    indiceB: number; // 0-based
    posA: number; // 1-based para PSeInt
    posB: number; // 1-based para PSeInt
}

/**
 * Detecta si dos casillas de un arreglo intercambiaron sus valores
 * entre el paso anterior y el actual (patrón de Swap en Bubble Sort, etc.).
 */
export const detectarSwapArreglo = (
    antes: unknown[] | null,
    actual: unknown[]
): SwapInfo => {
    if (!antes || antes.length !== actual.length || antes.length < 2) {
        return { haySwap: false, indiceA: -1, indiceB: -1, posA: -1, posB: -1 };
    }

    const cambiados: number[] = [];
    for (let i = 0; i < actual.length; i++) {
        if (JSON.stringify(antes[i]) !== JSON.stringify(actual[i])) {
            cambiados.push(i);
        }
    }

    // Un swap ideal tiene exactamente 2 posiciones que cruzaron valores
    if (cambiados.length === 2) {
        const [a, b] = cambiados;
        if (
            JSON.stringify(antes[a]) === JSON.stringify(actual[b]) &&
            JSON.stringify(antes[b]) === JSON.stringify(actual[a])
        ) {
            return {
                haySwap: true,
                indiceA: a,
                indiceB: b,
                posA: a + 1,
                posB: b + 1,
            };
        }
    }

    return { haySwap: false, indiceA: -1, indiceB: -1, posA: -1, posB: -1 };
};

export interface PunteroArreglo {
    variable: string;
    posicion1Based: number;
    indice0Based: number;
    color: string;
}

/**
 * Detecta variables enteras activas que actúan como punteros (i, j, k, pos, etc.)
 * sobre las posiciones de un arreglo (rango 1...longitud).
 */
export const detectarPunterosArreglo = (
    variables: { nombre: string; valor: string }[],
    longitudArreglo: number
): PunteroArreglo[] => {
    const punteros: PunteroArreglo[] = [];
    variables.forEach((v, idx) => {
        const num = parseInt(v.valor, 10);
        if (
            !Number.isNaN(num) &&
            String(num) === v.valor &&
            num >= 1 &&
            num <= longitudArreglo
        ) {
            punteros.push({
                variable: v.nombre,
                posicion1Based: num,
                indice0Based: num - 1,
                color: colorDeVariable(idx),
            });
        }
    });
    return punteros;
};

export interface ComparacionActiva {
    activa: boolean;
    texto: string;
    variablesOindices: string[];
}

/**
 * Detecta si la instrucción en ejecución es una comparación o condicional Si.
 */
export const detectarComparacion = (
    instruccion?: string
): ComparacionActiva => {
    if (!instruccion) {
        return { activa: false, texto: '', variablesOindices: [] };
    }
    const limpia = instruccion.trim();
    const esSi = /^si\s+(.+?)\s+entonces/i.exec(limpia);
    if (esSi) {
        const cond = esSi[1].trim();
        return {
            activa: true,
            texto: cond,
            variablesOindices: [cond],
        };
    }
    return { activa: false, texto: '', variablesOindices: [] };
};
