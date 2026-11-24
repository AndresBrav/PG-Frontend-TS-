import type { ContextoIteracion, EstadoEjecucion } from '../compilador';

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
    distanciaSlots?: number; // B - A
    esAscendente?: boolean; // si indiceA es el que salta hacia adelante
}

/**
 * Detecta si dos casillas de un arreglo intercambiaron sus valores.
 * Tolera tanto intercambios atómicos directos (2 cambiados que cruzaron)
 * como swaps en 3 pasos procedurales (aux <- arr[j], arr[j] <- arr[j+1], arr[j+1] <- aux)
 * inspeccionando los pasos recientes de la traza histórica.
 */
export const detectarSwapArreglo = (
    antes: unknown[] | null,
    actual: unknown[],
    nombreArreglo?: string,
    historialReciente?: EstadoEjecucion[],
    instruccionActual?: string
): SwapInfo => {
    if (!actual || actual.length < 2) {
        return { haySwap: false, indiceA: -1, indiceB: -1, posA: -1, posB: -1 };
    }

    // 1. Detección atómica clásica (si ambos cambiaron entre antes y actual)
    if (antes && antes.length === actual.length) {
        const cambiados: number[] = [];
        for (let i = 0; i < actual.length; i++) {
            if (JSON.stringify(antes[i]) !== JSON.stringify(actual[i])) {
                cambiados.push(i);
            }
        }

        if (cambiados.length === 2) {
            const [a, b] = cambiados;
            if (
                JSON.stringify(antes[a]) === JSON.stringify(actual[b]) &&
                JSON.stringify(antes[b]) === JSON.stringify(actual[a])
            ) {
                return {
                    haySwap: true,
                    indiceA: Math.min(a, b),
                    indiceB: Math.max(a, b),
                    posA: Math.min(a, b) + 1,
                    posB: Math.max(a, b) + 1,
                    distanciaSlots: Math.abs(b - a),
                    esAscendente: true,
                };
            }
        }
    }

    // 2. Detección procedural multi-paso (PSeInt con aux):
    // Inspeccionamos los últimos 4 pasos para verificar si hubo un intercambio en curso
    if (nombreArreglo && historialReciente && historialReciente.length >= 2) {
        const ventana = historialReciente.slice(-4);
        const extraerArreglo = (e: EstadoEjecucion): unknown[] | null => {
            const v = e.variables.find((x) => x.nombre.toLowerCase() === nombreArreglo.toLowerCase());
            if (!v || !v.valor.startsWith('[')) return null;
            try {
                const parsed = JSON.parse(v.valor);
                return Array.isArray(parsed) ? parsed : null;
            } catch {
                return null;
            }
        };

        // Buscamos si en la ventana reciente hubo un estado previo donde 2 celdas permutaron
        for (let k = 0; k < ventana.length - 1; k++) {
            const arrPrevio = extraerArreglo(ventana[k]);
            if (arrPrevio && arrPrevio.length === actual.length) {
                const cambiados: number[] = [];
                for (let i = 0; i < actual.length; i++) {
                    if (JSON.stringify(arrPrevio[i]) !== JSON.stringify(actual[i])) {
                        cambiados.push(i);
                    }
                }
                if (cambiados.length === 2) {
                    const [a, b] = cambiados;
                    if (
                        JSON.stringify(arrPrevio[a]) === JSON.stringify(actual[b]) &&
                        JSON.stringify(arrPrevio[b]) === JSON.stringify(actual[a])
                    ) {
                        return {
                            haySwap: true,
                            indiceA: Math.min(a, b),
                            indiceB: Math.max(a, b),
                            posA: Math.min(a, b) + 1,
                            posB: Math.max(a, b) + 1,
                            distanciaSlots: Math.abs(b - a),
                            esAscendente: true,
                        };
                    }
                }
            }
        }
    }

    // 3. Detección en la instrucción activa si involucra asignación arr[x] <- aux o arr[x] <- arr[y]
    if (instruccionActual && nombreArreglo) {
        const matchCopia = new RegExp(
            `^\\s*${nombreArreglo}\\s*\\[\\s*(\\w+|\\d+)\\s*\\]\\s*(?:<-|:=|=)\\s*${nombreArreglo}\\s*\\[\\s*(\\w+|\\d+)\\s*\\]`,
            'i'
        ).exec(instruccionActual);

        if (matchCopia && historialReciente && historialReciente.length > 0) {
            const ultimaCaptura = historialReciente[historialReciente.length - 1];
            const varsMap = new Map(ultimaCaptura.variables.map((v) => [v.nombre.toLowerCase(), parseInt(v.valor, 10)]));
            const p1 = parseInt(matchCopia[1], 10) || varsMap.get(matchCopia[1].toLowerCase());
            const p2 = parseInt(matchCopia[2], 10) || varsMap.get(matchCopia[2].toLowerCase());
            if (p1 && p2 && p1 >= 1 && p1 <= actual.length && p2 >= 1 && p2 <= actual.length && p1 !== p2) {
                const a = Math.min(p1 - 1, p2 - 1);
                const b = Math.max(p1 - 1, p2 - 1);
                return {
                    haySwap: true,
                    indiceA: a,
                    indiceB: b,
                    posA: a + 1,
                    posB: b + 1,
                    distanciaSlots: Math.abs(b - a),
                    esAscendente: true,
                };
            }
        }

        const matchCierreAux = new RegExp(
            `^\\s*${nombreArreglo}\\s*\\[\\s*(\\w+|\\d+)\\s*\\]\\s*(?:<-|:=|=)\\s*(?:aux|temp|temporal|buffer)`,
            'i'
        ).exec(instruccionActual);

        if (matchCierreAux && historialReciente && historialReciente.length > 1) {
            const penultima = historialReciente[historialReciente.length - 2];
            const matchPrevio = new RegExp(
                `^\\s*${nombreArreglo}\\s*\\[\\s*(\\w+|\\d+)\\s*\\]\\s*(?:<-|:=|=)\\s*${nombreArreglo}\\s*\\[\\s*(\\w+|\\d+)\\s*\\]`,
                'i'
            ).exec(penultima.instruccion ?? '');

            if (matchPrevio) {
                const varsMap = new Map(penultima.variables.map((v) => [v.nombre.toLowerCase(), parseInt(v.valor, 10)]));
                const p1 = parseInt(matchPrevio[1], 10) || varsMap.get(matchPrevio[1].toLowerCase());
                const p2 = parseInt(matchPrevio[2], 10) || varsMap.get(matchPrevio[2].toLowerCase());
                if (p1 && p2 && p1 >= 1 && p1 <= actual.length && p2 >= 1 && p2 <= actual.length && p1 !== p2) {
                    const a = Math.min(p1 - 1, p2 - 1);
                    const b = Math.max(p1 - 1, p2 - 1);
                    return {
                        haySwap: true,
                        indiceA: a,
                        indiceB: b,
                        posA: a + 1,
                        posB: b + 1,
                        distanciaSlots: Math.abs(b - a),
                        esAscendente: true,
                    };
                }
            }
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

const NO_SON_PUNTEROS =
    /^(contador|cont|suma|sum|total|tot|acum|acumulador|aux|temp|temporal|buffer|res|resultado|promedio|prom|bandera|flag|estado|sw|max|min|valor)$/i;

const ES_NOMBRE_INDICE =
    /^(i|j|k|p|pos|idx|indice|ptr|posicion|ind|k1|k2)$/i;

/**
 * Detecta variables enteras activas que actúan legítimamente como punteros o índices
 * sobre las posiciones de un arreglo (rango 1...longitud).
 * Excluye acumuladores, contadores y variables independientes.
 */
export const detectarPunterosArreglo = (
    variables: { nombre: string; valor: string }[],
    longitudArreglo: number,
    nombreArreglo?: string,
    iteraciones?: ContextoIteracion[],
    instruccion?: string
): PunteroArreglo[] => {
    const punteros: PunteroArreglo[] = [];

    // Variables activas de ciclos Para o bucles
    const varsCiclo = new Set(
        iteraciones
            ?.map((it) => it.variable?.toLowerCase())
            .filter((v): v is string => Boolean(v)) ?? []
    );

    // ¿El nombre de la variable indexa este arreglo en la instrucción actual? Ej: numeros[i]
    const indexaEnInstruccion = (nombreVar: string): boolean => {
        if (!nombreArreglo || !instruccion) return false;
        const re = new RegExp(
            `\\b${nombreArreglo}\\s*\\[[^\\]]*\\b${nombreVar}\\b`,
            'i'
        );
        return re.test(instruccion);
    };

    variables.forEach((v, idx) => {
        const nombreLower = v.nombre.toLowerCase();

        // 1. Descartar si coincide con nombres de acumuladores o contadores
        if (NO_SON_PUNTEROS.test(nombreLower)) {
            return;
        }

        const num = parseInt(v.valor, 10);
        if (
            !Number.isNaN(num) &&
            String(num) === v.valor &&
            num >= 1 &&
            num <= longitudArreglo
        ) {
            // 2. Verificar rol de índice legítimo:
            // - Es un iterador activo de ciclo (ej: i en 'Para i <- ...')
            // - Indexa el arreglo en la instrucción actual (ej: numeros[i])
            // - O tiene un nombre típico de índice (i, j, k, pos, idx)
            const esIterador = varsCiclo.has(nombreLower);
            const indexa = indexaEnInstruccion(v.nombre);
            const nombreTipico = ES_NOMBRE_INDICE.test(nombreLower);

            if (esIterador || indexa || nombreTipico) {
                punteros.push({
                    variable: v.nombre,
                    posicion1Based: num,
                    indice0Based: num - 1,
                    color: colorDeVariable(idx),
                });
            }
        }
    });

    return punteros;
};

export interface ComparacionActiva {
    activa: boolean;
    texto: string;
    textoDesglosado?: string;
    variablesOindices: string[];
}

/**
 * Evalúa una expresión de índice aritmético (ej: "j", "j + 1", "i", "n - 1")
 * usando los valores enteros actuales de las variables disponibles.
 */
export const evaluarIndiceArreglo = (
    exprIndice: string,
    varsMap: Map<string, string>
): number | null => {
    if (!exprIndice) return null;
    let limpia = exprIndice.trim();

    // Reemplaza nombres de variables por sus valores numéricos enteros
    limpia = limpia.replace(/\b([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\b/g, (match) => {
        const val = varsMap.get(match.toLowerCase());
        if (val !== undefined && /^-?\d+$/.test(val)) {
            return val;
        }
        return match;
    });

    // Evalúa operaciones aritméticas seguras solo si contiene dígitos y operadores
    if (/^[0-9+\-*/\s()]+$/.test(limpia)) {
        try {
            const res = Function(`"use strict"; return (${limpia});`)();
            if (typeof res === 'number' && Number.isFinite(res)) {
                return Math.round(res);
            }
        } catch {
            return null;
        }
    }
    const soloNum = parseInt(limpia, 10);
    return Number.isNaN(soloNum) ? null : soloNum;
};

export interface AccesoArregloEvaluado {
    nombreArr: string;
    indiceExpr: string;
    indiceEval: number | null;
    celdaConcreta: string; // ej: "numeros[2]"
    valorCelda: string | null; // ej: "9"
}

/**
 * Evalúa un acceso a celda de arreglo (ej: "numeros[j + 1]") devolviendo
 * el índice numérico evaluado y el valor escalar contenido en esa celda.
 */
export const evaluarAccesoArreglo = (
    accesoStr: string,
    variables: { nombre: string; valor: string }[],
    mapaValoresAlternativo?: Map<string, string>
): AccesoArregloEvaluado | null => {
    if (!accesoStr) return null;
    const match = accesoStr.trim().match(/^([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\s*\[\s*(.+?)\s*\]$/);
    if (!match) return null;

    const nombreArr = match[1];
    const indiceExpr = match[2].trim();

    const varsMap = new Map<string, string>();
    for (const v of variables) {
        varsMap.set(v.nombre.toLowerCase(), v.valor);
    }
    if (mapaValoresAlternativo) {
        for (const [k, val] of mapaValoresAlternativo.entries()) {
            if (!varsMap.has(k)) {
                varsMap.set(k.toLowerCase(), val);
            }
        }
    }

    const indiceEval = evaluarIndiceArreglo(indiceExpr, varsMap);
    const celdaConcreta = indiceEval !== null ? `${nombreArr}[${indiceEval}]` : accesoStr;

    let valorCelda: string | null = null;
    const valArr = varsMap.get(nombreArr.toLowerCase());
    if (valArr && valArr.startsWith('[') && indiceEval !== null && indiceEval >= 1) {
        try {
            const parsed = JSON.parse(valArr);
            if (Array.isArray(parsed) && parsed.length >= indiceEval) {
                const elem = parsed[indiceEval - 1];
                valorCelda = elem !== undefined && elem !== null ? String(elem) : null;
            }
        } catch {
            /* no parseable */
        }
    }

    return {
        nombreArr,
        indiceExpr,
        indiceEval,
        celdaConcreta,
        valorCelda,
    };
};

/**
 * Detecta si la instrucción en ejecución es una comparación o condicional Si,
 * y desglosa matemáticamente los índices y valores de los arreglos.
 */
export const detectarComparacion = (
    instruccion?: string,
    variablesActuales?: { nombre: string; valor: string }[]
): ComparacionActiva => {
    if (!instruccion) {
        return { activa: false, texto: '', variablesOindices: [] };
    }
    const limpia = instruccion.trim();
    const esSi = /^si\s+(.+?)\s+entonces/i.exec(limpia);
    if (!esSi) {
        return { activa: false, texto: '', variablesOindices: [] };
    }

    const cond = esSi[1].trim();
    if (!variablesActuales || variablesActuales.length === 0) {
        return { activa: true, texto: cond, variablesOindices: [cond] };
    }

    const varsMap = new Map(variablesActuales.map((v) => [v.nombre.toLowerCase(), v.valor]));

    let condIndices = cond;
    let condValores = cond;

    // Detectar patrones arr[expr] en la condición
    const accesos = cond.match(/[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*\s*\[\s*[^\]]+?\s*\]/g) || [];
    for (const acc of accesos) {
        const evalAcc = evaluarAccesoArreglo(acc, variablesActuales);
        if (evalAcc && evalAcc.indiceEval !== null) {
            condIndices = condIndices.replace(acc, evalAcc.celdaConcreta);
            if (evalAcc.valorCelda !== null) {
                condValores = condValores.replace(acc, evalAcc.valorCelda);
            }
        }
    }

    // Reemplaza variables simples restantes por sus valores escalares
    condValores = condValores.replace(/\b([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\b/g, (match) => {
        const val = varsMap.get(match.toLowerCase());
        if (val !== undefined && /^-?\d+(\.\d+)?$/.test(val)) {
            return val;
        }
        return match;
    });

    let textoDesglosado: string | undefined;
    if (condIndices !== cond || condValores !== cond) {
        textoDesglosado = `${condIndices}  ⟶  ${condValores}`;
    }

    return {
        activa: true,
        texto: cond,
        textoDesglosado,
        variablesOindices: [cond],
    };
};

export type TipoTransferencia = 'literal' | 'directa' | 'calculo';

export interface TransferenciaVariable {
    hayTransferencia: boolean;
    tipo: TipoTransferencia;
    variableDestino: string;
    valorNuevo: string;
    valorPrevioDestino?: string;
    variableOrigen?: string;
    valorOrigen?: string;
    formula?: string;
    operacionVisual?: string;
    desgloseMatematico?: string;
    esCeldaArreglo?: boolean;
}

const PALABRAS_CLAVE_EXPR = new Set([
    'rc',
    'raiz',
    'sen',
    'cos',
    'tan',
    'abs',
    'azar',
    'aleatorio',
    'pi',
    'verdadero',
    'falso',
    'longitud',
    'subcadena',
    'mayusculas',
    'minusculas',
]);

/**
 * Detecta si la instrucción actual es una asignación a variable o celda,
 * y clasifica la transferencia de valores para animarla en la simulación.
 * Resuelve con rigor matemático los accesos a celdas puntuales (ej: numeros[j] <- numeros[j+1]).
 */
export const detectarTransferenciaVariable = (
    instruccion?: string,
    variablesActuales?: { nombre: string; valor: string }[],
    valoresAnteriores?: Map<string, string>
): TransferenciaVariable => {
    if (!instruccion) {
        return {
            hayTransferencia: false,
            tipo: 'literal',
            variableDestino: '',
            valorNuevo: '',
        };
    }

    const limpia = instruccion.trim();
    // Excluir estructuras de bucle o condicional
    if (/^(si|mientras|para|repetir|hasta|segun|funcion|proceso|algoritmo)\b/i.test(limpia)) {
        return {
            hayTransferencia: false,
            tipo: 'literal',
            variableDestino: '',
            valorNuevo: '',
        };
    }

    const match = limpia.match(
        /^([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*(\[[^\]]*\])?)\s*(?:<-|:=|=)\s*(.+)$/i
    );
    if (!match) {
        return {
            hayTransferencia: false,
            tipo: 'literal',
            variableDestino: '',
            valorNuevo: '',
        };
    }

    const variableDestinoRaw = match[1].trim();
    const expresion = match[3].trim();

    const mapaActual = new Map<string, string>();
    if (variablesActuales) {
        for (const v of variablesActuales) {
            mapaActual.set(v.nombre.toLowerCase(), v.valor);
        }
    }

    // A. ¿El destino es una celda de arreglo? ej: numeros[j]
    const esDestinoCelda = variableDestinoRaw.includes('[');
    let variableDestino = variableDestinoRaw;
    let valorNuevo = '';
    let valorPrevioDestino: string | undefined = undefined;
    let evalDestino: AccesoArregloEvaluado | null = null;

    if (esDestinoCelda && variablesActuales) {
        evalDestino = evaluarAccesoArreglo(variableDestinoRaw, variablesActuales, valoresAnteriores);
        if (evalDestino && evalDestino.indiceEval !== null) {
            variableDestino = evalDestino.celdaConcreta; // ej: "numeros[2]"
            valorNuevo = evalDestino.valorCelda ?? '';

            // Obtener valor previo de esa celda desde valoresAnteriores
            const arrAntesStr = valoresAnteriores?.get(evalDestino.nombreArr.toLowerCase());
            if (arrAntesStr && arrAntesStr.startsWith('[')) {
                try {
                    const parsedAntes = JSON.parse(arrAntesStr);
                    if (Array.isArray(parsedAntes) && parsedAntes.length >= evalDestino.indiceEval) {
                        const elemPrev = parsedAntes[evalDestino.indiceEval - 1];
                        if (elemPrev !== undefined && elemPrev !== null) {
                            valorPrevioDestino = String(elemPrev);
                        }
                    }
                } catch {
                    /* ignore */
                }
            }
        }
    } else {
        const nombreBaseDestino = variableDestinoRaw.toLowerCase();
        valorNuevo = mapaActual.get(nombreBaseDestino) ?? '';
        valorPrevioDestino = valoresAnteriores?.get(nombreBaseDestino);
    }

    // B. ¿La expresión de origen es una celda de arreglo? ej: numeros[j + 1]
    const esOrigenCelda = /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*\s*\[\s*[^\]]+?\s*\]$/.test(expresion);
    let evalOrigen: AccesoArregloEvaluado | null = null;
    if (esOrigenCelda && variablesActuales) {
        // Para el origen de una transferencia, sus índices y valores provienen del paso que acaba de evaluarse
        evalOrigen = evaluarAccesoArreglo(expresion, variablesActuales, valoresAnteriores);
    }

    // Caso 1: Destino Celda <- Origen Celda (ej: numeros[j] <- numeros[j + 1])
    if (evalDestino && evalOrigen) {
        const valOrig = evalOrigen.valorCelda ?? valorNuevo;
        const desgloseMatematico = `${variableDestino} ← ${evalOrigen.celdaConcreta} (${valOrig} pasa a celda ${evalDestino.indiceEval})`;

        return {
            hayTransferencia: true,
            tipo: 'directa',
            variableDestino,
            valorNuevo: valOrig,
            valorPrevioDestino,
            variableOrigen: evalOrigen.celdaConcreta,
            valorOrigen: valOrig,
            formula: `${variableDestino} ← ${evalOrigen.celdaConcreta}`,
            desgloseMatematico,
            esCeldaArreglo: true,
        };
    }

    // Caso 2: Destino Variable Escalar <- Origen Celda (ej: aux <- numeros[j])
    if (!esDestinoCelda && evalOrigen) {
        const valOrig = evalOrigen.valorCelda ?? valorNuevo;
        const desgloseMatematico = `${variableDestino} ← ${evalOrigen.celdaConcreta} (guarda ${valOrig} en ${variableDestino})`;

        return {
            hayTransferencia: true,
            tipo: 'directa',
            variableDestino,
            valorNuevo: valOrig,
            valorPrevioDestino,
            variableOrigen: evalOrigen.celdaConcreta,
            valorOrigen: valOrig,
            formula: `${variableDestino} ← ${evalOrigen.celdaConcreta}`,
            desgloseMatematico,
            esCeldaArreglo: true,
        };
    }

    // Caso 3: Destino Celda <- Origen Variable Escalar (ej: numeros[j + 1] <- aux)
    if (evalDestino && !esOrigenCelda) {
        const origenNombre = expresion.trim();
        const valOrig =
            valoresAnteriores?.get(origenNombre.toLowerCase()) ??
            mapaActual.get(origenNombre.toLowerCase()) ??
            valorNuevo;
        const desgloseMatematico = `${variableDestino} ← ${origenNombre} (coloca ${valOrig} en celda ${evalDestino.indiceEval})`;

        return {
            hayTransferencia: true,
            tipo: 'directa',
            variableDestino,
            valorNuevo: valOrig,
            valorPrevioDestino,
            variableOrigen: origenNombre,
            valorOrigen: valOrig,
            formula: `${variableDestino} ← ${origenNombre}`,
            desgloseMatematico,
            esCeldaArreglo: true,
        };
    }

    // Buscar identificadores usados en la expresión para transferencias escalares estándar
    const tokens = expresion.match(/[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*/g) || [];
    const variablesOrigenEncontradas: string[] = [];

    for (const t of tokens) {
        const tLower = t.toLowerCase();
        if (
            !PALABRAS_CLAVE_EXPR.has(tLower) &&
            ((valoresAnteriores && valoresAnteriores.has(tLower)) ||
                mapaActual.has(tLower))
        ) {
            if (!variablesOrigenEncontradas.includes(t)) {
                variablesOrigenEncontradas.push(t);
            }
        }
    }

    // 1. Literal puro (sin variables origen, ej: a <- 5)
    if (variablesOrigenEncontradas.length === 0) {
        return {
            hayTransferencia: true,
            tipo: 'literal',
            variableDestino,
            valorNuevo: valorNuevo || expresion,
            valorPrevioDestino,
            formula: `${variableDestino} ← ${expresion}`,
        };
    }

    // 2. Transferencia directa de una variable a otra (ej: aux <- a, a <- b)
    if (
        variablesOrigenEncontradas.length === 1 &&
        expresion.trim().toLowerCase() === variablesOrigenEncontradas[0].toLowerCase()
    ) {
        const origen = variablesOrigenEncontradas[0];
        const valOrig =
            valoresAnteriores?.get(origen.toLowerCase()) ??
            mapaActual.get(origen.toLowerCase()) ??
            '';

        return {
            hayTransferencia: true,
            tipo: 'directa',
            variableDestino,
            valorNuevo: valorNuevo || valOrig,
            valorPrevioDestino,
            variableOrigen: origen,
            valorOrigen: valOrig,
            formula: `${variableDestino} ← ${origen}`,
        };
    }

    // 3. Cálculo con expresión (ej: b <- a + 3, c <- a * b)
    const primerOrigen = variablesOrigenEncontradas[0];
    const valOrig =
        valoresAnteriores?.get(primerOrigen.toLowerCase()) ??
        mapaActual.get(primerOrigen.toLowerCase()) ??
        '';

    let operacionVisual = expresion;
    if (variablesOrigenEncontradas.length === 1) {
        const reOrig = new RegExp(`\\b${primerOrigen}\\b`, 'i');
        operacionVisual = expresion.replace(reOrig, '').trim();
    }

    return {
        hayTransferencia: true,
        tipo: 'calculo',
        variableDestino,
        valorNuevo,
        valorPrevioDestino,
        variableOrigen: primerOrigen,
        valorOrigen: valOrig,
        formula: `${variableDestino} ← ${expresion}`,
        operacionVisual: operacionVisual || expresion,
    };
};
