/**
 * Parser de expresiones PSeInt.
 *
 * Segunda fase del compilador: convierte una lista de tokens de expresión
 * en JavaScript ejecutable, validando paréntesis/corchetes y aplicando la
 * semántica de PSeInt (MOD, DIV, ^, Verdadero/Falso, índices 1-based).
 */
import { normVar } from './tokenizador';
import type { Linea, Token } from './tipos';

export /**
 * Parser recursivo descendente de expresiones PSeInt → JavaScript.
 *
 * Respeta la precedencia: O/Y lógicos, comparaciones, +/-, * / MOD / DIV,
 * potencia ^, unarios (NO, signo) y primarios (números, cadenas,
 * paréntesis, Verdadero/Falso, llamadas a funciones y arreglos indexados).
 * Emite `await` en las llamadas a funciones porque el runtime es asíncrono.
 * Los errores de paréntesis/corchetes sin cerrar llevan el número de línea
 * si la expresión se construyó con la línea de origen.
 */
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

    /** Analiza la expresión completa y devuelve su equivalente en JS. */
    parse(): string {
        return this.or();
    }

    /**
     * Analiza una lista de expresiones separadas por comas
     * (usado por Escribir, los argumentos de llamada y las etiquetas Caso).
     */
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
            if (der === '') {
                this.error(
                    `falta una expresión después de '${esO ? 'O' : 'Y'}'.`
                );
            }
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
            if (der === '') {
                this.error(
                    `falta una expresión después de '${esY ? 'Y' : 'O'}'.`
                );
            }
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
            if (der === '') {
                this.error(`falta una expresión después de '${op}'.`);
            }
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
            if (der === '') {
                this.error(`falta una expresión después de '${op}'.`);
            }
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
            if (der === '') {
                this.error(
                    `falta una expresión después de '${t.val}'.`
                );
            }
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
            if (der === '') {
                this.error("falta una expresión después de '^'.");
            }
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
            const r = this.unario();
            if (r === '') {
                this.error("falta una expresión después de 'NO'.");
            }
            return `!(${r})`;
        }
        if (t.tipo === 'punt' && (t.val === '-' || t.val === '+')) {
            this.pos++;
            const r = this.unario();
            if (r === '') {
                this.error(`falta una expresión después de '${t.val}'.`);
            }
            return `(${t.val}(${r}))`;
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
            if (palabra === 'pi') {
                return 'Math.PI';
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

    /**
     * Parsea un destino indexado de arreglo: `arr[i]` o `mat[i, j]`.
     * Usado para asignaciones y lecturas con validación de límites.
     */
    analizarIndizado(): { nombre: string; indices: string[] } {
        const prim = this.actual();
        if (!prim || prim.tipo !== 'word') {
            this.error('se esperaba el nombre del arreglo.');
        }
        const nombre = normVar(prim.val);
        this.pos++;
        if (this.actual()?.val !== '[') {
            this.error("se esperaba '[' en el arreglo.");
        }
        this.pos++;
        const indices: string[] = [];
        while (this.actual() && this.actual()?.val !== ']') {
            indices.push(this.parse());
            if (this.actual()?.val === ',') {
                this.pos++;
            }
        }
        if (this.actual()?.val === ']') {
            this.pos++;
        } else {
            this.error('falta cerrar el corchete del arreglo.');
        }
        return { nombre, indices };
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
        const numLinea = this.linea?.numero ?? 0;
        return `__arrGet(${palabra}, '${palabra}', ${numLinea}, ${indices.join(', ')})`;
    }
}

/** Tipos de datos válidos en PSeInt para 'Definir ... Como ...'. */
export const TIPOS_PSEINT = new Set([
    'entero',
    'real',
    'caracter',
    'cadena',
    'logico',
    'numerico',
]);
