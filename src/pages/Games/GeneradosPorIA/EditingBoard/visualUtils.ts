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
