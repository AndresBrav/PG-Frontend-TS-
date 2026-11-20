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

    const variableDestino = match[1].trim();
    const nombreBaseDestino = variableDestino.split('[')[0].trim().toLowerCase();
    const expresion = match[3].trim();

    const mapaActual = new Map<string, string>();
    if (variablesActuales) {
        for (const v of variablesActuales) {
            mapaActual.set(v.nombre.toLowerCase(), v.valor);
        }
    }

    const valorNuevo = mapaActual.get(nombreBaseDestino) ?? '';
    const valorPrevioDestino = valoresAnteriores?.get(nombreBaseDestino);

    // Buscar identificadores usados en la expresión
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
            formula: expresion,
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
            valorNuevo,
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

    // Extraer operación visual (ej: si a + 3 -> "+ 3")
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
        formula: expresion,
        operacionVisual: operacionVisual || expresion,
    };
};
