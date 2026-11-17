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

export interface EstadoEjecucion {
    /** Número de instrucción ejecutada (1-based). */
    paso: number;
    /** Línea del pseudocódigo que se estaba ejecutando (1-based, opcional). */
    linea?: number;
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

const MAX_PASOS = 1000000;

type TokenTipo = 'word' | 'num' | 'str' | 'punt';

interface Token {
    tipo: TokenTipo;
    val: string;
}

interface Linea {
    numero: number;
    toks: Token[];
}

const MAPA_ACENTOS: Record<string, string> = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    Á: 'A',
    É: 'E',
    Í: 'I',
    Ó: 'O',
    Ú: 'U',
    ñ: 'n',
    Ñ: 'N',
};

function quitarAcentos(texto: string): string {
    return texto.replace(/[áéíóúÁÉÍÓÚñÑ]/g, (c) => MAPA_ACENTOS[c] ?? c);
}

export function normVar(nombre: string): string {
    return quitarAcentos(nombre).toLowerCase();
}

function tokenizar(linea: string, numeroLinea: number): Token[] {
    const toks: Token[] = [];
    let i = 0;
    const dosOp = ['<-', '<>', '<=', '>=', '=='];
    while (i < linea.length) {
        const c = linea[i];
        if (/\s/.test(c)) {
            i++;
            continue;
        }
        if (c === '"' || c === "'") {
            const comilla = c;
            i++;
            let str = '';
            let cerrada = false;
            while (i < linea.length && linea[i] !== comilla) {
                str += linea[i];
                i++;
            }
            if (i < linea.length) {
                cerrada = true;
                i++;
            }
            if (!cerrada) {
                throw new Error(
                    `Error de sintaxis en la línea ${numeroLinea}: ` +
                        'falta cerrar las comillas de la cadena.'
                );
            }
            toks.push({ tipo: 'str', val: str });
            continue;
        }
        const pareja = linea.slice(i, i + 2);
        if (dosOp.includes(pareja)) {
            toks.push({ tipo: 'punt', val: pareja });
            i += 2;
            continue;
        }
        if ('+-*/^<>=(),:[];'.includes(c)) {
            toks.push({ tipo: 'punt', val: c });
            i++;
            continue;
        }
        if (/\d/.test(c)) {
            let n = '';
            while (i < linea.length && /[\d.]/.test(linea[i])) {
                n += linea[i];
                i++;
            }
            if ((n.match(/\./g) ?? []).length > 1) {
                throw new Error(
                    `Error de sintaxis en la línea ${numeroLinea}: ` +
                        `número inválido '${n}' (revisa los puntos decimales).`
                );
            }
            toks.push({ tipo: 'num', val: n });
            continue;
        }
        let w = '';
        while (
            i < linea.length &&
            /[A-Za-zÁÉÍÓÚáéíóúÑñ_0-9]/.test(linea[i])
        ) {
            w += linea[i];
            i++;
        }
        // Blindaje: si el carácter no encaja en ninguna rama no se avanza la
        // posición (bucle infinito). Abortar con un mensaje claro.
        if (w === '') {
            let pista = '';
            if (c === '!') {
                pista = ' (¿quisiste escribir <>?)';
            } else if (c === '%') {
                pista = " (¿quisiste escribir 'MOD'?)";
            }
            throw new Error(
                `Error de sintaxis en la línea ${numeroLinea}: ` +
                    `carácter no reconocido '${c}'${pista}.`
            );
        }
        toks.push({ tipo: 'word', val: w });
    }
    return toks;
}

function normalizarLinea(linea: string): string {
    let fuera: string | null = null;
    let resultado = '';
    for (let i = 0; i < linea.length; i++) {
        const c = linea[i];
        if (fuera) {
            resultado += c;
            if (c === fuera) {
                fuera = null;
            }
            continue;
        }
        if (c === '"' || c === "'") {
            fuera = c;
            resultado += c;
            continue;
        }
        if (c === '/' && linea[i + 1] === '/') {
            break;
        }
        resultado += c;
    }
    return resultado.trim();
}

function preprocesar(codigo: string): Linea[] {
    const lineas: Linea[] = [];
    codigo.split('\n').forEach((bruta, idx) => {
        const limpia = normalizarLinea(bruta);
        if (!limpia) {
            return;
        }
        lineas.push({ numero: idx + 1, toks: tokenizar(limpia, idx + 1) });
    });
    return lineas;
}

class Expresion {
    private toks: Token[];
    private pos = 0;
    // Línea de origen para mensajes de error precisos (opcional).
    private linea?: Linea;

    constructor(toks: Token[], linea?: Linea) {
        this.toks = toks;
        this.linea = linea;
    }

    /** Error de sintaxis con número de línea (si se conoce la línea). */
    private error(mensaje: string): never {
        if (this.linea) {
            throw new Error(
                `Error de sintaxis en la línea ${this.linea.numero}: ${mensaje}`
            );
        }
        throw new Error(`Error de sintaxis: ${mensaje}`);
    }

    parse(): string {
        return this.or();
    }

    argumentos(): string[] {
        const args: string[] = [];
        if (this.actual() && this.actual()?.val !== ',') {
            args.push(this.parse());
            while (this.actual()?.val === ',') {
                this.pos++;
                args.push(this.parse());
            }
        }
        return args;
    }

    private or(): string {
        let izq = this.and();
        while (this.esLogico()) {
            const esO = normVar(this.actual()?.val ?? '') === 'o';
            this.pos++;
            const der = this.and();
            izq = `(${izq} ${esO ? '||' : '&&'} ${der})`;
        }
        return izq;
    }

    private and(): string {
        let izq = this.comparacion();
        while (this.esLogico()) {
            const esY = normVar(this.actual()?.val ?? '') === 'y';
            this.pos++;
            const der = this.comparacion();
            izq = `(${izq} ${esY ? '&&' : '||'} ${der})`;
        }
        return izq;
    }

    private esLogico(): boolean {
        const t = this.actual();
        if (!t || t.tipo !== 'word') {
            return false;
        }
        const v = normVar(t.val);
        return v === 'y' || v === 'o';
    }

    private comparacion(): string {
        let izq = this.suma();
        while (
            this.actual() &&
            this.actual()?.tipo === 'punt' &&
            ['<', '>', '<=', '>=', '<>', '=', '=='].includes(
                this.actual()?.val ?? ''
            )
        ) {
            const op = this.actual()?.val ?? '';
            this.pos++;
            const der = this.suma();
            let jsOp: string;
            if (op === '<>') {
                jsOp = '!==';
            } else if (op === '==' || op === '=') {
                jsOp = '===';
            } else if (op === '<' || op === '>') {
                jsOp = op;
            } else {
                jsOp = op;
            }
            izq = `(${izq} ${jsOp} ${der})`;
        }
        return izq;
    }

    private suma(): string {
        let izq = this.termino();
        while (
            this.actual() &&
            this.actual()?.tipo === 'punt' &&
            ['+', '-'].includes(this.actual()?.val ?? '')
        ) {
            const op = this.actual()?.val ?? '';
            this.pos++;
            const der = this.termino();
            izq = `(${izq} ${op} ${der})`;
        }
        return izq;
    }

    private termino(): string {
        let izq = this.potencia();
        while (this.actual()) {
            const t = this.actual();
            if (!t) {
                break;
            }
            const esMult = t.tipo === 'punt' && ['*', '/', '%'].includes(t.val);
            const esDivMod =
                t.tipo === 'word' &&
                (normVar(t.val) === 'mod' || normVar(t.val) === 'div');
            if (!esMult && !esDivMod) {
                break;
            }
            this.pos++;
            const der = this.potencia();
            if (t.tipo === 'word' && normVar(t.val) === 'div') {
                izq = `Math.floor(${izq} / ${der})`;
            } else if (t.tipo === 'word' && normVar(t.val) === 'mod') {
                izq = `(${izq} % ${der})`;
            } else {
                izq = `(${izq} ${t.val} ${der})`;
            }
        }
        return izq;
    }

    private potencia(): string {
        const izq = this.unario();
        if (this.actual()?.val === '^') {
            this.pos++;
            const der = this.potencia();
            return `(${izq} ** ${der})`;
        }
        return izq;
    }

    private unario(): string {
        const t = this.actual();
        if (!t) {
            return '';
        }
        if (t.tipo === 'word' && normVar(t.val) === 'no') {
            this.pos++;
            return `!(${this.unario()})`;
        }
        if (t.tipo === 'punt' && (t.val === '-' || t.val === '+')) {
            this.pos++;
            return `(${t.val}(${this.unario()}))`;
        }
        return this.primario();
    }

    private primario(): string {
        const t = this.actual();
        if (!t) {
            return '';
        }
        if (t.tipo === 'num') {
            this.pos++;
            return t.val;
        }
        if (t.tipo === 'str') {
            this.pos++;
            return JSON.stringify(t.val);
        }
        if (t.tipo === 'punt' && t.val === '(') {
            this.pos++;
            const exp = this.parse();
            if (this.actual()?.val === ')') {
                this.pos++;
            } else {
                this.error('falta cerrar el paréntesis en la expresión.');
            }
            return `(${exp})`;
        }
        if (t.tipo === 'word') {
            const palabra = normVar(t.val);
            this.pos++;
            if (palabra === 'verdadero') {
                return 'true';
            }
            if (palabra === 'falso') {
                return 'false';
            }
            if (this.actual()?.val === '(') {
                this.pos++;
                const args = this.argumentos();
                if (this.actual()?.val === ')') {
                    this.pos++;
                } else {
                    this.error(
                        "falta cerrar el paréntesis después de los argumentos."
                    );
                }
                return `await ${palabra}(${args.join(', ')})`;
            }
            if (this.actual()?.val === '[') {
                return this.indizado(palabra);
            }
            return palabra;
        }
        return '';
    }

    /** Token actual (público para mensajes de error del Compilador). */
    actual(): Token | undefined {
        return this.toks[this.pos];
    }

    /** Avanza una posición (para palabras clave estructurales). */
    consumir(): void {
        this.pos++;
    }

    /** true si ya se consumieron todos los tokens de la expresión. */
    esFinal(): boolean {
        return this.pos >= this.toks.length;
    }

    private indizado(palabra: string): string {
        this.pos++;
        const indices: string[] = [];
        while (this.actual() && this.actual()?.val !== ']') {
            const idx = this.parse();
            indices.push(idx);
            if (this.actual()?.val === ',') {
                this.pos++;
            }
        }
        if (this.actual()?.val === ']') {
            this.pos++;
        } else {
            this.error('falta cerrar el corchete del arreglo.');
        }
        return indices
            .map((i) => `[(${i}) - 1]`)
            .reduce((acc, seg) => acc + seg, palabra);
    }
}

/** Tipos de datos válidos en PSeInt para 'Definir ... Como ...'. */
const TIPOS_PSEINT = new Set([
    'entero',
    'real',
    'caracter',
    'cadena',
    'logico',
    'numerico',
]);

class Compilador {
    private lineas: Linea[];
    private tipos = new Map<string, string>();
    private declaradas = new Set<string>();
    private i = 0;
    private out: string[] = [];
    private contador = 0;
    private debug: boolean;

    constructor(lineas: Linea[], debug = false) {
        this.lineas = lineas;
        this.debug = debug;
    }

    compilar(): string {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (k === 'algoritmo' || k === 'proceso') {
                const nombreTok = this.lineas[this.i].toks[1];
                if (!nombreTok || nombreTok.tipo !== 'word') {
                    this.errorSintaxis(
                        this.lineas[this.i],
                        `se esperaba el nombre después de '${
                            k === 'algoritmo' ? 'Algoritmo' : 'Proceso'
                        }' (Ej: Algoritmo SolucionIA).`
                    );
                }
                this.i++;
                continue;
            }
            if (k === 'finalgoritmo' || k === 'finproceso') {
                this.i++;
                continue;
            }
            this.compilarSentencia();
        }
        return this.out.join('\n');
    }

    private compilarSentencia(): void {
        const k = this.clave();
        // Las declaraciones puras y Finalizar no generan captura de variables
        const esDeclaracion =
            k === 'definir' ||
            k === 'dimension' ||
            k === 'finalizar' ||
            k === 'terminar';
        switch (k) {
            case 'definir':
                this.compilarDefinir();
                break;
            case 'dimension':
                this.compilarDimension();
                break;
            case 'leer':
                this.compilarLeer();
                break;
            case 'escribir':
            case 'escribe':
            case 'esc':
                this.compilarEscribir();
                break;
            case 'si':
                this.compilarSi();
                break;
            case 'mientras':
                this.compilarMientras();
                break;
            case 'para':
                this.compilarPara();
                break;
            case 'repetir':
                this.compilarRepetir();
                break;
            case 'segun':
            case 'segunsea':
                this.compilarSegun();
                break;
            case 'funcion':
            case 'subproceso':
            case 'subalgoritmo':
                this.compilarFuncion();
                break;
            case 'retornar':
            case 'devolver':
            case 'regresar':
                this.compilarRetornar();
                break;
            // Instrucción interna del generador diagrama→código: termina el
            // programa desde una rama (se traduce a return; del proceso).
            case 'finalizar':
            case 'terminar':
                this.compilarFinalizar();
                break;
            default:
                this.compilarAsignacion();
        }
        if (this.debug && !esDeclaracion) {
            this.emitirDebug();
        }
    }

    /**
     * Modo debug: tras cada instrucción emite una llamada __debug(...)
     * con los valores actuales de las variables declaradas hasta aquí.
     */
    private emitirDebug(): void {
        const nombres = [...this.declaradas];
        if (nombres.length === 0) {
            return;
        }
        const pares = nombres
            .map(
                (v) =>
                    `['${v}', typeof ${v} === 'object' && ${v} !== null ? JSON.stringify(${v}) : ${v}]`
            )
            .join(', ');
        this.out.push(
            `try { __debug([${pares}], ${this.lineas[this.i]?.numero ?? 0}); } catch (e) {}`
        );
    }

    private clave(): string {
        const linea = this.lineas[this.i];
        if (!linea || linea.toks.length === 0) {
            return '';
        }
        const prim = linea.toks[0];
        if (prim.tipo === 'word') {
            return normVar(prim.val);
        }
        return prim.val;
    }

    private indicePalabra(
        linea: Linea,
        desde: number,
        palabra: string
    ): number {
        for (let j = desde; j < linea.toks.length; j++) {
            if (
                linea.toks[j].tipo === 'word' &&
                normVar(linea.toks[j].val) === palabra
            ) {
                return j;
            }
        }
        return -1;
    }

    private declararVariable(v: string): void {
        if (this.declaradas.has(v)) {
            return;
        }
        // PSeInt inicializa al declarar: Entero/Real en 0, Logico en FALSO,
        // Caracter/Cadena en vacío.
        const tipo = this.tipos.get(v) ?? '';
        let inicial = '';
        if (tipo === 'entero' || tipo === 'real' || tipo === 'numerico') {
            inicial = ' = 0';
        } else if (tipo === 'logico') {
            inicial = ' = false';
        } else if (tipo === 'caracter' || tipo === 'cadena') {
            inicial = " = ''";
        }
        this.out.push(`let ${v}${inicial};`);
        this.declaradas.add(v);
    }

    private compilarDefinir(): void {
        const linea = this.lineas[this.i];
        const idxComo = this.indicePalabra(linea, 1, 'como');
        if (idxComo === -1) {
            this.errorSintaxis(
                linea,
                "se esperaba 'Como' en el Definir (Ej: Definir x Como Entero)."
            );
        }
        const varsAux: string[] = [];
        for (let j = 1; j < idxComo; j++) {
            if (linea.toks[j].tipo === 'word') {
                varsAux.push(normVar(linea.toks[j].val));
            }
        }
        if (varsAux.length === 0) {
            this.errorSintaxis(
                linea,
                "se esperaba al menos una variable en el Definir (Ej: Definir x Como Entero)."
            );
        }
        const tipoVal = linea.toks[idxComo + 1];
        if (
            !tipoVal ||
            tipoVal.tipo !== 'word' ||
            !TIPOS_PSEINT.has(normVar(tipoVal.val))
        ) {
            const recibido = tipoVal?.val ?? '';
            this.errorSintaxis(
                linea,
                recibido
                    ? `tipo desconocido '${recibido}' en el Definir (tipos válidos: Entero, Real, Caracter, Cadena, Logico, Numerico).`
                    : "se esperaba el tipo en el Definir (Ej: Definir x Como Entero)."
            );
        }
        const sobrante = linea.toks[idxComo + 2];
        if (sobrante) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${sobrante.val}' en el Definir.`
            );
        }
        for (const v of varsAux) {
            this.tipos.set(v, normVar(tipoVal.val));
        }
        for (const v of varsAux) {
            this.declararVariable(v);
        }
        this.i++;
    }

    private compilarDimension(): void {
        const linea = this.lineas[this.i];
        const resto = linea.toks.slice(1);
        let p = 0;
        while (p < resto.length) {
            if (resto[p].tipo !== 'word') {
                p++;
                continue;
            }
            const nombre = normVar(resto[p].val);
            p++;
            if (resto[p]?.val === '[') {
                p++;
                const dims: string[] = [];
                const partes: Token[][] = [];
                let actual: Token[] = [];
                while (p < resto.length && resto[p].val !== ']') {
                    if (resto[p].tipo === 'punt' && resto[p].val === ',') {
                        partes.push(actual);
                        actual = [];
                    } else {
                        actual.push(resto[p]);
                    }
                    p++;
                }
                if (actual.length > 0) {
                    partes.push(actual);
                }
                if (resto[p]?.val === ']') {
                    p++;
                }
                for (const parte of partes) {
                    dims.push(new Expresion(parte, linea).parse());
                }
                this.declararArreglo(nombre, dims);
                continue;
            }
            this.declararVariable(nombre);
        }
        this.i++;
    }

    private declararArreglo(nombre: string, dims: string[]): void {
        const generador = (asignacion: boolean): string => {
            const declarador = asignacion ? nombre : `let ${nombre}`;
            if (dims.length === 0) {
                return `${declarador} = [];`;
            }
            if (dims.length === 1) {
                return `${declarador} = new Array(${dims[0]}).fill(0);`;
            }
            return `${declarador} = Array.from({ length: ${dims[0]} }, () => new Array(${dims[1]}).fill(0));`;
        };
        if (this.declaradas.has(nombre)) {
            this.out.push(generador(true));
            return;
        }
        this.out.push(generador(false));
        this.declaradas.add(nombre);
    }

    private compilarLeer(): void {
        const linea = this.lineas[this.i];
        const resto = linea.toks.slice(1);
        const segmentos: Token[][] = [];
        let actual: Token[] = [];
        let nivel = 0;
        for (const t of resto) {
            if (t.tipo === 'punt' && (t.val === '[' || t.val === '(')) {
                nivel++;
            }
            if (t.tipo === 'punt' && (t.val === ']' || t.val === ')')) {
                nivel--;
            }
            if (t.tipo === 'punt' && t.val === ',' && nivel === 0) {
                segmentos.push(actual);
                actual = [];
            } else {
                actual.push(t);
            }
        }
        if (actual.length > 0) {
            segmentos.push(actual);
        }
        for (const seg of segmentos) {
            if (seg.length === 0) {
                continue;
            }
            const tieneIndice = seg.some(
                (t) => t.tipo === 'punt' && t.val === '['
            );
            if (tieneIndice) {
                const expDest = new Expresion(seg, linea);
                const destino = expDest.parse();
                if (!expDest.esFinal()) {
                    this.errorSintaxis(
                        linea,
                        `no se esperaba '${expDest.actual()?.val}' en el Leer.`
                    );
                }
                const nombre = normVar(
                    seg.find((t) => t.tipo === 'word')?.val ?? ''
                );
                if (!nombre) {
                    continue;
                }
                const tipoSeg = this.tipos.get(nombre) ?? '';
                this.out.push(
                    `${destino} = await __leer(${JSON.stringify(nombre)}, ${JSON.stringify(tipoSeg)});`
                );
            } else {
                if (seg.length !== 1 || seg[0].tipo !== 'word') {
                    this.errorSintaxis(
                        linea,
                        `se esperaba una variable en el Leer (recibí '${seg
                            .map((t) => t.val)
                            .join(' ')}').`
                    );
                }
                const nombre = normVar(seg[0].val);
                const tipoSeg = this.tipos.get(nombre) ?? '';
                this.declararVariable(nombre);
                this.out.push(
                    `${nombre} = await __leer(${JSON.stringify(nombre)}, ${JSON.stringify(tipoSeg)});`
                );
            }
        }
        this.i++;
    }

    private compilarEscribir(): void {
        const linea = this.lineas[this.i];
        let inicio = 1;
        if (
            linea.toks[1]?.tipo === 'word' &&
            normVar(linea.toks[1].val) === 'sin' &&
            linea.toks[2]?.tipo === 'word' &&
            normVar(linea.toks[2].val) === 'saltar'
        ) {
            inicio = 3;
        }
        let resto = linea.toks.slice(inicio);
        if (resto.length === 0) {
            this.i++;
            return;
        }
        // 'Sin Saltar' al final (sintaxis habitual de PSeInt)
        const n = resto.length;
        if (
            n >= 2 &&
            resto[n - 2]?.tipo === 'word' &&
            normVar(resto[n - 2].val) === 'sin' &&
            resto[n - 1]?.tipo === 'word' &&
            normVar(resto[n - 1].val) === 'saltar'
        ) {
            resto = resto.slice(0, n - 2);
            if (resto.length === 0) {
                this.i++;
                return;
            }
        }
        const exp = new Expresion(resto, linea);
        const args = exp.argumentos();
        if (!exp.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${exp.actual()?.val}' en el Escribir.`
            );
        }
        this.out.push(`__escribir(${args.join(', ')});`);
        this.i++;
    }

    private compilarSi(): void {
        const linea = this.lineas[this.i];
        const idxEntonces = this.indicePalabra(linea, 1, 'entonces');
        if (idxEntonces === -1) {
            if (this.indicePalabra(linea, 1, 'hacer') !== -1) {
                this.errorSintaxis(
                    linea,
                    "en el 'Si' se usa 'Entonces', no 'Hacer'."
                );
            }
            this.errorSintaxis(linea, "se esperaba 'Entonces' en el Si.");
        }
        const condToks = linea.toks.slice(1, idxEntonces);
        const expCond = new Expresion(condToks, linea);
        const cond = expCond.parse();
        if (cond === '') {
            this.errorSintaxis(linea, 'se esperaba la condición en el Si.');
        }
        if (!expCond.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${expCond.actual()?.val}' en la condición del Si.`
            );
        }
        const extra = linea.toks[idxEntonces + 1];
        if (extra) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${extra.val}' después de 'Entonces' (las instrucciones del Si van en las líneas siguientes).`
            );
        }
        this.out.push(`if (${cond}) {`);
        this.i++;
        this.recorrerHasta(['finsi', 'sino'], {
            linea,
            nombre: 'Si',
            cierre: 'FinSi',
        });
        if (this.clave() === 'sino') {
            const lineaSino = this.lineas[this.i];
            if (lineaSino.toks.length > 1) {
                this.errorSintaxis(
                    lineaSino,
                    `no se esperaba '${lineaSino.toks[1].val}' después de 'Sino' (las instrucciones del Sino van en las líneas siguientes).`
                );
            }
            this.i++;
            this.out.push('} else {');
            this.recorrerHasta(['finsi'], {
                linea,
                nombre: 'Si',
                cierre: 'FinSi',
            });
        }
        if (this.clave() === 'finsi') {
            this.i++;
        }
        this.out.push('}');
    }

    private compilarMientras(): void {
        const linea = this.lineas[this.i];
        const idxHacer = this.indicePalabra(linea, 1, 'hacer');
        if (idxHacer === -1) {
            if (this.indicePalabra(linea, 1, 'entonces') !== -1) {
                this.errorSintaxis(
                    linea,
                    "en el 'Mientras' se usa 'Hacer', no 'Entonces'."
                );
            }
            this.errorSintaxis(linea, "se esperaba 'Hacer' en el Mientras.");
        }
        const condToks = linea.toks.slice(1, idxHacer);
        const expCond = new Expresion(condToks, linea);
        const cond = expCond.parse();
        if (cond === '') {
            this.errorSintaxis(
                linea,
                'se esperaba la condición en el Mientras.'
            );
        }
        if (!expCond.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${expCond.actual()?.val}' en la condición del Mientras.`
            );
        }
        this.out.push(`while (${cond}) { __paso();`);
        // Snapshot al inicio de cada iteración (ilumina el rombo del bucle)
        this.emitirDebug();
        this.i++;
        this.recorrerHasta(['finmientras'], {
            linea,
            nombre: 'Mientras',
            cierre: 'FinMientras',
        });
        this.i++;
        this.out.push('}');
    }

    private compilarPara(): void {
        const linea = this.lineas[this.i];
        const vNombre = normVar(linea.toks[1]?.val ?? '');
        if (!vNombre) {
            this.errorSintaxis(
                linea,
                "se esperaba la variable en el Para (Ej: Para i <- 1 Hasta 10 Hacer)."
            );
        }
        let opIdx = -1;
        for (let j = 2; j < linea.toks.length; j++) {
            if (
                linea.toks[j].tipo === 'punt' &&
                (linea.toks[j].val === '<-' || linea.toks[j].val === '=')
            ) {
                if (linea.toks[j].val === '=') {
                    this.errorSintaxis(
                        linea,
                        "en el 'Para' la asignación se escribe con '<-', no con '='."
                    );
                }
                opIdx = j;
                break;
            }
        }
        if (opIdx === -1) {
            this.errorSintaxis(
                linea,
                "se esperaba '<-' en el Para (Ej: Para i <- 1 Hasta 10 Hacer)."
            );
        }
        const idxHasta = this.indicePalabra(linea, opIdx + 1, 'hasta');
        if (idxHasta === -1) {
            this.errorSintaxis(
                linea,
                "se esperaba 'Hasta' en el Para (Ej: Para i <- 1 Hasta 10 Hacer)."
            );
        }
        const iniToks = linea.toks.slice(opIdx + 1, idxHasta);
        const resto = linea.toks.slice(idxHasta + 1);
        const expIni = new Expresion(iniToks, linea);
        const ini = expIni.parse();
        if (ini === '') {
            this.errorSintaxis(
                linea,
                "se esperaba el valor inicial en el Para (Ej: Para i <- 1 Hasta 10 Hacer)."
            );
        }
        if (!expIni.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${expIni.actual()?.val}' entre '<-' y 'Hasta' en el Para.`
            );
        }
        const expFin = new Expresion(resto, linea);
        const fin = expFin.parse();
        if (fin === '') {
            this.errorSintaxis(
                linea,
                "se esperaba el límite después de 'Hasta' en el Para (Ej: Para i <- 1 Hasta 10 Hacer)."
            );
        }
        // 'Con Paso <expr>' opcional antes del 'Hacer'
        let pasoVal = '1';
        const tCon = expFin.actual();
        if (tCon?.tipo === 'word' && normVar(tCon.val) === 'con') {
            expFin.consumir();
            const tPaso = expFin.actual();
            if (!tPaso || tPaso.tipo !== 'word' || normVar(tPaso.val) !== 'paso') {
                this.errorSintaxis(
                    linea,
                    "se esperaba 'Paso' después de 'Con' en el Para."
                );
            }
            expFin.consumir();
            pasoVal = expFin.parse();
            if (pasoVal === '') {
                this.errorSintaxis(
                    linea,
                    "se esperaba una expresión después de 'Con Paso' en el Para."
                );
            }
        }
        const tHacer = expFin.actual();
        if (!tHacer || tHacer.tipo !== 'word' || normVar(tHacer.val) !== 'hacer') {
            // Pista para límites escritos como 'H' o palabra suelta no declarada
            let pista = '';
            if (
                expFin.esFinal() &&
                resto.length === 1 &&
                resto[0].tipo === 'word' &&
                !this.declaradas.has(normVar(resto[0].val))
            ) {
                pista = ` ¿Quisiste escribir 'Hacer' en lugar de '${resto[0].val}'?`;
            }
            this.errorSintaxis(
                linea,
                `se esperaba 'Hacer' al final del Para (Ej: Para i <- 1 Hasta 10 Hacer).${pista}`
            );
        }
        expFin.consumir();
        const sobranteHacer = expFin.actual();
        if (sobranteHacer) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${sobranteHacer.val}' después de 'Hacer' en el Para (las instrucciones van en las líneas siguientes).`
            );
        }
        const pasoVar = `__pi${this.contador++}`;
        this.declararVariable(vNombre);
        this.out.push(`{ const ${pasoVar} = ${pasoVal};`);
        this.out.push(
            `for (${vNombre} = ${ini}; ${pasoVar} > 0 ? ${vNombre} <= ${fin} : ${vNombre} >= ${fin}; ${vNombre} = ${vNombre} + ${pasoVar}) { __paso();`
        );
        // Snapshot al inicio de cada iteración (ve el iterador cambiar)
        this.emitirDebug();
        this.i++;
        this.recorrerHasta(['finpara'], {
            linea,
            nombre: 'Para',
            cierre: 'FinPara',
        });
        if (this.clave() === 'finpara') {
            this.i++;
        }
        this.out.push('}');
        this.out.push('}');
    }

    private compilarRepetir(): void {
        const linea = this.lineas[this.i];
        this.out.push('do { __paso();');
        this.i++;
        this.recorrerHasta(['hasta'], {
            linea,
            nombre: 'Repetir',
            cierre: 'Hasta',
        });
        let cond = 'false';
        if (this.clave() === 'hasta') {
            const lineaHasta = this.lineas[this.i];
            let inicioHasta = 1;
            if (
                lineaHasta.toks[1]?.tipo === 'word' &&
                normVar(lineaHasta.toks[1].val) === 'que'
            ) {
                inicioHasta = 2;
            }
            const expCond = new Expresion(
                lineaHasta.toks.slice(inicioHasta),
                lineaHasta
            );
            cond = expCond.parse();
            if (cond === '') {
                this.errorSintaxis(
                    lineaHasta,
                    "se esperaba la condición después de 'Hasta' en el Repetir."
                );
            }
            if (!expCond.esFinal()) {
                this.errorSintaxis(
                    lineaHasta,
                    `no se esperaba '${expCond.actual()?.val}' en la condición del Repetir.`
                );
            }
            this.i++;
        }
        this.out.push(`} while (!(${cond}));`);
    }

    private compilarSegun(): void {
        const linea = this.lineas[this.i];
        const idxHacer = this.indicePalabra(linea, 1, 'hacer');
        if (idxHacer === -1) {
            if (this.indicePalabra(linea, 1, 'entonces') !== -1) {
                this.errorSintaxis(
                    linea,
                    "en el 'Según' se usa 'Hacer', no 'Entonces'."
                );
            }
            this.errorSintaxis(linea, "se esperaba 'Hacer' en el Según.");
        }
        const exprToks = linea.toks.slice(1, idxHacer);
        const expExpr = new Expresion(exprToks, linea);
        const expr = expExpr.parse();
        if (expr === '') {
            this.errorSintaxis(
                linea,
                'se esperaba la expresión en el Según.'
            );
        }
        if (!expExpr.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${expExpr.actual()?.val}' en la expresión del Según.`
            );
        }
        this.out.push(`switch (${expr}) {`);
        this.i++;
        this.compilarCasos(linea);
        if (this.clave() === 'finsegun') {
            this.i++;
        } else {
            this.errorSintaxis(
                linea,
                "el 'Segun' no se cerró (falta 'FinSegun')."
            );
        }
        this.out.push('}');
    }

    private compilarCasos(apertura: Linea): void {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (k === 'finsegun') {
                return;
            }
            if (k === 'finalgoritmo' || k === 'finproceso') {
                return;
            }
            const linea = this.lineas[this.i];
            // 'De Otro Modo:' (con o sin ':') NO es un Caso: es el default.
            // Antes el ':' de 'De Otro Modo:' activaba esLineaCaso y
            // generaba 'case de:' (variable inexistente).
            const esDeOtroModo =
                k === 'de' &&
                linea.toks[1]?.tipo === 'word' &&
                normVar(linea.toks[1].val) === 'otro';
            if (!esDeOtroModo && (k === 'caso' || this.esLineaCaso(linea))) {
                const idxPuntos = linea.toks.findIndex(
                    (t) => t.tipo === 'punt' && t.val === ':'
                );
                if (k === 'caso' && idxPuntos === -1) {
                    this.errorSintaxis(
                        linea,
                        "faltan los ':' en el Caso (Ej: Caso 1:)."
                    );
                }
                // Saltar la palabra 'Caso' para que no quede como etiqueta
                const inicioLabels =
                    linea.toks[0]?.tipo === 'word' &&
                    normVar(linea.toks[0].val) === 'caso'
                        ? 1
                        : 0;
                const labelsToks =
                    idxPuntos <= 0
                        ? linea.toks
                              .slice(inicioLabels)
                              .filter(
                                  (t) =>
                                      !(
                                          t.tipo === 'punt' &&
                                          (t.val === ':' || t.val === '-')
                                      )
                              )
                        : linea.toks.slice(inicioLabels, idxPuntos);
                const labels = new Expresion(labelsToks, linea).argumentos();
                for (const lbl of labels) {
                    this.out.push(`case ${lbl}:`);
                }
                const restoLinea =
                    idxPuntos !== -1 ? linea.toks.slice(idxPuntos + 1) : [];
                this.i++;
                if (restoLinea.length > 0) {
                    this.out.push(
                        ...this.compilarToksInLinea(restoLinea, linea.numero)
                    );
                }
                while (this.i < this.lineas.length) {
                    const k2 = this.clave();
                    if (
                        k2 === 'caso' ||
                        k2 === 'finsegun' ||
                        k2 === 'finalgoritmo' ||
                        k2 === 'finproceso' ||
                        this.esLineaCaso(this.lineas[this.i])
                    ) {
                        break;
                    }
                    if (
                        k2 === 'de' &&
                        this.lineas[this.i].toks[1]?.tipo === 'word' &&
                        normVar(this.lineas[this.i].toks[1].val) === 'otro'
                    ) {
                        break;
                    }
                    this.compilarSentencia();
                }
                this.out.push('break;');
                continue;
            }
            if (
                k === 'de' &&
                this.lineas[this.i].toks[1]?.tipo === 'word' &&
                normVar(this.lineas[this.i].toks[1].val) === 'otro'
            ) {
                this.out.push('default:');
                this.i++;
                while (this.i < this.lineas.length) {
                    if (
                        this.clave() === 'finsegun' ||
                        this.clave() === 'caso' ||
                        this.clave() === 'finalgoritmo' ||
                        this.clave() === 'finproceso'
                    ) {
                        break;
                    }
                    this.compilarSentencia();
                }
                this.out.push('break;');
                continue;
            }
            this.compilarSentencia();
        }
    }

    private esLineaCaso(linea: Linea): boolean {
        if (
            linea.toks[0]?.tipo === 'punt' &&
            (linea.toks[0].val === ':' || linea.toks[0].val === '-')
        ) {
            return true;
        }
        return linea.toks.some(
            (t) => t.tipo === 'punt' && t.val === ':'
        );
    }

    private compilarToksInLinea(
        toks: Token[],
        numeroLinea?: number
    ): string[] {
        const salida: string[] = [];
        const k = normVar(toks[0]?.val ?? '');
        if (k === 'escribir') {
            const exp = new Expresion(
                toks.slice(1),
                numeroLinea
                    ? { numero: numeroLinea, toks }
                    : undefined
            );
            const args = exp.argumentos();
            if (args.length === 0) {
                salida.push('__escribir();');
            } else {
                salida.push(`__escribir(${args.join(', ')});`);
            }
        } else if (k === 'leer') {
            const aux = new Compilador(
                [],
                { cadenas: [], lineas: [{ toks }] } as unknown as Algoritmo
            );
            aux.lineas = [{ numero: numeroLinea ?? 0, toks }];
            aux.compilarLeer();
            salida.push(...aux.out);
        } else if (
            toks.some(
                (t) =>
                    t.tipo === 'punt' && (t.val === '<-' || t.val === '=')
            )
        ) {
            // Asignación inline (Ej: Caso 1: suma <- 10): reutilizar el
            // compilador de asignaciones para que respete destino/arreglos.
            const aux = new Compilador(
                [],
                { cadenas: [], lineas: [{ toks }] } as unknown as Algoritmo
            );
            aux.lineas = [{ numero: numeroLinea ?? 0, toks }];
            aux.declaradas = this.declaradas;
            aux.tipos = this.tipos;
            aux.compilarAsignacion();
            salida.push(...aux.out);
        } else {
            const exp = new Expresion(
                toks,
                numeroLinea ? { numero: numeroLinea, toks } : undefined
            );
            salida.push(`${exp.parse()};`);
        }
        return salida;
    }

    private compilarFuncion(): void {
        const linea = this.lineas[this.i];
        const k = this.clave();
        const arrowIdx = linea.toks.findIndex(
            (t) => t.tipo === 'punt' && t.val === '<-'
        );
        let nombre = '';
        let retorno = '';
        if (arrowIdx !== -1) {
            for (let j = arrowIdx - 1; j >= 1; j--) {
                if (linea.toks[j].tipo === 'word') {
                    retorno = normVar(linea.toks[j].val);
                    break;
                }
            }
            for (let j = arrowIdx + 1; j < linea.toks.length; j++) {
                if (linea.toks[j].tipo === 'word') {
                    nombre = normVar(linea.toks[j].val);
                    break;
                }
            }
        } else {
            for (let j = 1; j < linea.toks.length; j++) {
                if (linea.toks[j].tipo === 'word') {
                    nombre = normVar(linea.toks[j].val);
                    break;
                }
            }
        }
        if (!nombre) {
            this.errorSintaxis(
                linea,
                `se esperaba el nombre del ${k === 'funcion' ? 'Funcion' : 'SubProceso'}.`
            );
        }
        if (NOMBRES_INCORPORADOS.has(nombre)) {
            throw new Error(
                `No se puede definir la función "${nombre}": ya existe una función incorporada con ese nombre.`
            );
        }
        const paren = linea.toks.findIndex(
            (t) => t.tipo === 'punt' && t.val === '('
        );
        const params: string[] = [];
        if (paren !== -1) {
            for (let j = paren + 1; j < linea.toks.length; j++) {
                const t = linea.toks[j];
                if (t.tipo === 'punt' && t.val === ')') {
                    break;
                }
                if (t.tipo === 'word') {
                    params.push(normVar(t.val));
                }
            }
        }
        const tiposAnteriores = this.tipos;
        const declaradasAnteriores = this.declaradas;
        this.tipos = new Map();
        this.declaradas = new Set();
        for (const p of params) {
            this.declaradas.add(p);
        }
        this.out.push(`async function ${nombre}(${params.join(', ')}) {`);
        if (retorno) {
            this.out.push(`${retorno} = undefined;`);
            this.declaradas.add(retorno);
        }
        this.i++;
        const finNombre = k === 'funcion' ? 'finfuncion' : 'finsubproceso';
        this.recorrerHasta([finNombre], {
            linea,
            nombre: k === 'funcion' ? 'Funcion' : 'SubProceso',
            cierre: k === 'funcion' ? 'FinFuncion' : 'FinSubProceso',
        });
        if (this.clave() === finNombre) {
            this.i++;
        }
        if (retorno) {
            this.out.push(`return ${retorno};`);
        }
        this.out.push('}');
        this.tipos = tiposAnteriores;
        this.declaradas = declaradasAnteriores;
    }

    /** Instrucción interna del generador diagrama→código: sale del proceso. */
    private compilarFinalizar(): void {
        this.out.push('return;');
        this.i++;
    }

    private compilarRetornar(): void {
        const linea = this.lineas[this.i];
        const resto = linea.toks.slice(1);
        if (resto.length === 0) {
            this.out.push('return;');
        } else {
            const expRet = new Expresion(resto, linea);
            const expr = expRet.parse();
            if (expr === '') {
                this.errorSintaxis(
                    linea,
                    'se esperaba una expresión después de Retornar.'
                );
            }
            if (!expRet.esFinal()) {
                this.errorSintaxis(
                    linea,
                    `no se esperaba '${expRet.actual()?.val}' después de Retornar.`
                );
            }
            this.out.push(`return ${expr};`);
        }
        this.i++;
    }

    private compilarAsignacion(): void {
        const linea = this.lineas[this.i];
        const prim = linea.toks[0];
        if (!prim || prim.tipo !== 'word') {
            this.erro(linea);
        }
        const nombre = normVar(prim.val);
        let opIdx = -1;
        for (let j = 1; j < linea.toks.length; j++) {
            if (
                linea.toks[j].tipo === 'punt' &&
                (linea.toks[j].val === '<-' || linea.toks[j].val === '=')
            ) {
                // PSeInt no asigna con '=': dar una pista en vez de aceptarlo
                const previo = linea.toks[j - 1];
                if (linea.toks[j].val === '=') {
                    const pistaOperador =
                        previo?.tipo === 'punt' &&
                        ['+', '-', '*', '/'].includes(previo.val)
                            ? `no existe el operador '${previo.val}=' en PSeInt; usa '${prim.val} <- <expresión>' (Ej: ${prim.val} <- ${prim.val} + 1).`
                            : "la asignación se escribe con '<-', no con '='.";
                    this.errorSintaxis(linea, pistaOperador);
                }
                opIdx = j;
                break;
            }
        }
        if (opIdx === -1) {
            // Pistas para operadores de C/JS que PSeInt no tiene
            const igualIgual = linea.toks.find(
                (t) => t.tipo === 'punt' && t.val === '=='
            );
            if (igualIgual) {
                this.errorSintaxis(
                    linea,
                    "la asignación se escribe con '<-', no con '=='."
                );
            }
            const dobleOperador = linea.toks.some(
                (t, idx) =>
                    idx > 0 &&
                    t.tipo === 'punt' &&
                    ['+', '-'].includes(t.val) &&
                    linea.toks[idx - 1].tipo === 'punt' &&
                    linea.toks[idx - 1].val === t.val
            );
            if (dobleOperador) {
                this.errorSintaxis(
                    linea,
                    `no existen '++' ni '--' en PSeInt; usa '${prim.val} <- ${prim.val} + 1'.`
                );
            }
            const tieneParentesis = linea.toks.some(
                (t, idx) => idx > 0 && t.tipo === 'punt' && t.val === '('
            );
            if (tieneParentesis) {
                const call = new Expresion(linea.toks, linea).parse();
                this.out.push(`${call};`);
                this.i++;
                return;
            }
            // Cierres de bloque sueltos: dar un mensaje claro en vez del
            // genérico "No pude reconocer la instrucción".
            const CIERRES_HUERFANOS: Record<string, string> = {
                finsi: 'Si',
                sino: 'Si',
                entonces: 'Si',
                finpara: 'Para',
                finmientras: 'Mientras',
                finsegun: 'Segun',
                finfuncion: 'Funcion',
                finsubproceso: 'SubProceso',
                finsubalgoritmo: 'SubProceso',
                hasta: 'Repetir',
                caso: 'Segun',
            };
            const bloque = CIERRES_HUERFANOS[normVar(prim.val)];
            if (bloque) {
                this.errorSintaxis(
                    linea,
                    `'${prim.val}' no cierra ningún ${bloque} abierto.`
                );
            }
            this.erro(linea);
        }
        const exprToks = linea.toks.slice(opIdx + 1);
        const expAsg = new Expresion(exprToks, linea);
        const expr = expAsg.parse();
        if (expr === '') {
            this.errorSintaxis(
                linea,
                "se esperaba una expresión después de '<-'."
            );
        }
        if (!expAsg.esFinal()) {
            this.errorSintaxis(
                linea,
                `no se esperaba '${expAsg.actual()?.val}' en la asignación.`
            );
        }
        const { esArreglo, destino } = this.analizarDestino(
            linea.toks.slice(0, opIdx),
            linea
        );
        if (!esArreglo) {
            this.declararVariable(nombre);
        }
        this.out.push(`${destino} = ${expr};`);
        this.i++;
    }

    private analizarDestino(
        toks: Token[],
        linea?: Linea
    ): {
        esArreglo: boolean;
        destino: string;
    } {
        const tieneCorchete = toks.some(
            (t, idx) => idx > 0 && t.tipo === 'punt' && t.val === '['
        );
        if (tieneCorchete) {
            return {
                esArreglo: true,
                destino: new Expresion(toks, linea).parse(),
            };
        }
        if (toks.length > 0 && toks[0].tipo === 'word') {
            return { esArreglo: false, destino: normVar(toks[0].val) };
        }
        return { esArreglo: false, destino: '' };
    }

    private recorrerHasta(
        finales: string[],
        bloque?: { linea: Linea; nombre: string; cierre: string }
    ): void {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (finales.includes(k)) {
                return;
            }
            if (k === 'finalgoritmo' || k === 'finproceso') {
                if (bloque) {
                    this.errorSintaxis(
                        bloque.linea,
                        `el '${bloque.nombre}' no se cerró (falta '${bloque.cierre}').`
                    );
                }
                return;
            }
            this.compilarSentencia();
        }
        if (bloque) {
            this.errorSintaxis(
                bloque.linea,
                `el '${bloque.nombre}' no se cerró (falta '${bloque.cierre}').`
            );
        }
    }

    private errorSintaxis(linea: Linea, mensaje: string): never {
        throw new Error(
            `Error de sintaxis en la línea ${linea.numero}: ${mensaje}`
        );
    }

    private erro(linea: Linea): never {
        throw new Error(
            `Error de sintaxis en la línea ${linea.numero}. No pude reconocer la instrucción.`
        );
    }
}

export function ejecutarPseudo(codigo: string, debug = false): string {
    const lineas = preprocesar(codigo);
    const c = new Compilador(lineas, debug);
    return c.compilar();
}

const NOMBRES_INCORPORADOS = new Set([
    'longitud',
    'mayusculas',
    'minusculas',
    'concatenar',
    'subcadena',
    'convertiranumero',
    'convertiratexto',
    'recortar',
    'remplazar',
    'reemplazar',
    'buscar',
    'azar',
    'redondear',
    'truncar',
    'raiz',
    'abs',
    'potencia',
    'sen',
    'cos',
    'tan',
    'log',
    'exp',
    'esnumero',
    'limpiarpantalla',
]);

const FUNCIONES_INCORPORADAS = `
    const longitud = (s) => String(s).length;
    const mayusculas = (s) => String(s).toUpperCase();
    const minusculas = (s) => String(s).toLowerCase();
    const concatenar = (...args) => args.map(String).join('');
    const subcadena = (s, ini, fin) => {
        const cad = String(s);
        const i = Number(ini) - 1;
        const f = fin === undefined ? cad.length : Number(fin);
        if (i < 0 || i >= cad.length) return '';
        return cad.slice(i, f);
    };
    const convertiranumero = (s) => {
        const n = parseFloat(String(s).trim().replace(',', '.'));
        return Number.isNaN(n) ? 0 : n;
    };
    const convertiratexto = (n) => String(n);
    const recortar = (s) => String(s).trim();
    const remplazar = (s, patron, reemplazo) =>
        String(s).split(String(patron)).join(String(reemplazo));
    const buscar = (s, buscado) => {
        const p = String(s).indexOf(String(buscado));
        return p === -1 ? 0 : p + 1;
    };
    const azar = (n) => Math.floor(Math.random() * Number(n));
    const redondear = (n) => Math.round(Number(n));
    const truncar = (n) => Math.trunc(Number(n));
    const raiz = (n) => Math.sqrt(Number(n));
    const abs = (n) => Math.abs(Number(n));
    const potencia = (b, e) => Math.pow(Number(b), Number(e));
    const sen = (n) => Math.sin(Number(n));
    const cos = (n) => Math.cos(Number(n));
    const tan = (n) => Math.tan(Number(n));
    const log = (n) => Math.log(Number(n));
    const exp = (n) => Math.exp(Number(n));
    const esnumero = (s) => {
        const n = parseFloat(String(s).trim().replace(',', '.'));
        return !Number.isNaN(n);
    };
    const limpiarpantalla = () => {
        callbacks.imprimir('[Pantalla limpiada]');
    };
`;

export async function ejecutarPseudocodigo(
    codigo: string,
    callbacks: CallbacksEjecucion
): Promise<ResultadoEjecucion> {
    let fuente: string;
    try {
        fuente = ejecutarPseudo(codigo, Boolean(callbacks.onEstado));
    } catch (err) {
        return {
            salida: [],
            error: err instanceof Error ? err.message : String(err),
        };
    }

    const cuerpo = `
    let __pasos = 0;
    const __MAX_PASOS = ${MAX_PASOS};
    const __paso = () => {
        __pasos++;
        if (__pasos > __MAX_PASOS) {
            throw new Error('Se superó el límite de ${MAX_PASOS} pasos. ¿Tienes un bucle infinito?');
        }
    };
    let __debugPaso = 0;
    let __debugUltimo = '';
    const __debug = (pares, numLinea) => {
        if (!callbacks.onEstado) return;
        __debugPaso++;
        // Para programas con cientos de miles de pasos solo se
        // reenvían al panel los primeros 300 pasos y luego 1 de cada 1000.
        if (__debugPaso > 300 && __debugPaso % 1000 !== 0) return;
        const variables = [];
        for (const par of pares) {
            if (par[1] === undefined) continue;
            variables.push({ nombre: par[0], valor: typeof par[1] === 'boolean' ? (par[1] ? 'VERDADERO' : 'FALSO') : String(par[1]) });
        }
        // Sin cambios desde la última captura: no se reenvía al panel
        // (la línea cuenta como cambio para resaltar la línea en ejecución)
        const huella = (numLinea ?? 0) + '|' + JSON.stringify(variables);
        if (huella === __debugUltimo) return;
        __debugUltimo = huella;
        callbacks.onEstado({ paso: __debugPaso, linea: numLinea, variables });
    };
    const __ultimoMensaje = { valor: '' };
    const __leer = async (nombre, tipo) => {
        const valor = await callbacks.pedirEntrada(
            nombre,
            tipo,
            __ultimoMensaje.valor
        );
        return convertir(valor, tipo);
    };
    const __escribir = (...args) => {
        const texto = args
            .map(a => typeof a === 'boolean' ? (a ? 'VERDADERO' : 'FALSO') : String(a))
            .join(' ');
        __ultimoMensaje.valor = texto;
        callbacks.imprimir(texto);
        salida.push(texto);
    };
${FUNCIONES_INCORPORADAS}
${fuente}
`;

    let fn: Function;
    try {
        // eslint-disable-next-line no-new-func
        fn = new Function(
            'callbacks',
            'salida',
            'convertir',
            `return (async () => { ${cuerpo} })();`
        );
    } catch (err) {
        return {
            salida: [],
            error: err instanceof Error ? err.message : String(err),
        };
    }

    const salida: string[] = [];
    try {
        await fn(callbacks, salida, convertir);
        return { salida };
    } catch (err) {
        return {
            salida,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

function convertir(valor: unknown, tipo: string): unknown {
    const v = String(valor ?? '');
    if (tipo === 'entero') {
        const n = parseInt(v.replace(',', '.'), 10);
        return Number.isNaN(n) ? v : n;
    }
    if (tipo === 'real') {
        const n = parseFloat(v.replace(',', '.'));
        return Number.isNaN(n) ? v : n;
    }
    if (tipo === 'logico' || tipo === 'bool' || tipo === 'boolean') {
        return /^(s|si|verdadero|true|v|1)$/i.test(v.trim());
    }
    if (tipo === 'cadena' || tipo === 'texto' || tipo === 'caracter') {
        return v;
    }
    const flexible = parseFloat(v.replace(',', '.'));
    return Number.isNaN(flexible) ? v : flexible;
}

export default ejecutarPseudocodigo;
