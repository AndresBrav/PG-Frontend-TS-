/**
 * Transpilador de pseudocódigo PSeInt a JavaScript.
 *
 * Tercera fase del compilador y corazón del motor. Convierte las líneas
 * tokenizadas en un programa JS que luego ejecuta runtime.ts con
 * new Function(). También define ejecutarPseudo() (compilar sin ejecutar)
 * y el listado de nombres reservados del runtime.
 */
import { Expresion, TIPOS_PSEINT } from './expresion';
import { normVar, preprocesar } from './tokenizador';
import type { Linea, Token } from './tipos';

export /**
 * Transpilador PSeInt → JavaScript.
 *
 * Recorre las líneas tokenizadas y produce el cuerpo JS del programa:
 * cada estructura de control de PSeInt (Si/Mientras/Para/Repetir/Según/
 * Funcion) se traduce a su equivalente JS con validación estricta de
 * sintaxis y mensajes pedagógicos con número de línea.
 * En modo debug inserta llamadas __debug(...) tras cada instrucción para
 * grabar el "modo película" de variables.
 * Los arreglos y variables se declaran con `let` al primer uso (o con
 * Definir/Dimension) respetando los valores iniciales de PSeInt.
 */
class Compilador {
    private lineas: Linea[];
    private tipos = new Map<string, string>();
    private declaradas = new Set<string>();
    private i = 0;
    private out: string[] = [];
    private contador = 0;
    private debug: boolean;
    private ciclosDebug: Array<{
        tipo: 'Para' | 'Mientras' | 'Repetir';
        contador: string;
        variable?: string;
    }> = [];

    constructor(lineas: Linea[], debug = false) {
        this.lineas = lineas;
        this.debug = debug;
    }

    /**
     * Transpila el programa completo y devuelve el código JS generado
     * (cuerpo a evaluar por el runtime en ejecutarPseudocodigo).
     */
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

    /**
     * Compila la línea actual despachando por su palabra clave
     * (Definir, Leer, Escribir, Si, Para...). Lo que no es una palabra
     * clave se trata como asignación o llamada. Tras cada instrucción
     * (excepto declaraciones) emite la captura de debug si está activo.
     */
    private compilarSentencia(): void {
        const lineaSentencia = this.lineas[this.i];
        const k = this.clave();
        // Las declaraciones puras y Finalizar no generan captura de variables
        const esDeclaracion =
            k === 'definir' ||
            k === 'dimension' ||
            k === 'finalizar' ||
            k === 'terminar' || k === 'romper' || k === 'interrumpir' || k === 'continuar';
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
            case 'limpiar':
            case 'borrar':
                this.compilarLimpiarPantalla();
                break;
            case 'esperar':
                this.compilarEsperar();
                break;
            case 'romper':
            case 'interrumpir':
                this.compilarRomper();
                break;
            case 'continuar':
                this.compilarContinuar();
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
            this.emitirDebug(lineaSentencia);
        }
    }

    /**
     * Modo debug: tras cada instrucción emite una llamada __debug(...)
     * con los valores actuales de las variables declaradas hasta aquí.
     */
    private emitirDebug(linea = this.lineas[this.i]): void {
        if (!this.debug) {
            return;
        }
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
        const iteraciones = `[${this.ciclosDebug
            .map(
                (ciclo) =>
                    `{ tipo: ${JSON.stringify(ciclo.tipo)}, iteracion: ${ciclo.contador}, variable: ${JSON.stringify(ciclo.variable ?? null)}, valor: ${
                        ciclo.variable
                            ? `String(${ciclo.variable})`
                            : 'null'
                    } }`,
            )
            .join(', ')}]`;
        this.out.push(
            `try { __debug([${pares}], ${linea?.numero ?? 0}, ${JSON.stringify(linea?.texto ?? '')}, ${iteraciones}); } catch (e) {}`
        );
    }

    /**
     * Palabra clave de la línea actual: primera palabra normalizada
     * (o el símbolo inicial si la línea empieza con uno, ej. ':').
     */
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

    /**
     * Índice del token palabra buscado dentro de la línea (desde una
     * posición), o -1 si no aparece. Usado para localizar Entonces/
     * Hacer/Hasta en las estructuras.
     */
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

    /**
     * Declara la variable con `let` en el código generado (solo la primera
     * vez) con el valor inicial de PSeInt según su tipo: Entero/Real en 0,
     * Logico en FALSO, Caracter/Cadena en vacío.
     */
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

    /**
     * Transpila `Definir v1, v2 Como Tipo`. Valida que exista 'Como',
     * que haya al menos una variable y que el tipo sea válido
     * (TIPOS_PSEINT); rechaza tokens sobrantes con mensaje claro.
     */
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

    /**
     * Transpila `Dimension v[n]` o `Dimension m[n, k]` (1 o 2 dimensiones,
     * índices 1-based). Cada dimensión se parsea como expresión.
     */
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

    /**
     * Emite la creación del arreglo JS: new Array(n).fill(0) para una
     * dimensión, matriz anidada para dos. Si ya estaba declarada la
     * variable solo asigna (no vuelve a declarar con let).
     */
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

    /**
     * Transpila `Leer` con una o varias variables separadas por comas.
     * Acepta variables simples y posiciones de arreglo (v[i]); cada
     * lectura genera `await __leer(...)` que pide la entrada al usuario.
     */
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
                const { nombre, indices } = expDest.analizarIndizado();
                if (!expDest.esFinal()) {
                    this.errorSintaxis(
                        linea,
                        `no se esperaba '${expDest.actual()?.val}' en el Leer.`
                    );
                }
                const tipoSeg = this.tipos.get(nombre) ?? '';
                this.out.push(
                    `__arrSet(${nombre}, '${nombre}', await __leer(${JSON.stringify(nombre)}, ${JSON.stringify(tipoSeg)}), ${linea.numero}, ${indices.join(', ')});`
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

    /**
     * Transpila `Escribir expr1, expr2...` (acepta 'Sin Saltar' al inicio
     * o al final, sintaxis habitual de PSeInt). Genera __escribir(...).
     */
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

    /**
     * Transpila Si/Entonces ... [Sino ...] FinSi. Exige 'Entonces' (con
     * pista si se escribió 'Hacer'), valida la condición y que no haya
     * instrucciones inline después de 'Entonces'/'Sino'.
     */
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

    /**
     * Transpila Mientras cond Hacer ... FinMientras. Exige 'Hacer' (con
     * pista si se escribió 'Entonces'). Emite snapshot de debug al inicio
     * de cada iteración para iluminar el bucle en el modo película.
     */
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
        const contadorIteracion = this.debug
            ? `__debugIter${this.contador++}`
            : null;
        if (contadorIteracion) {
            this.out.push(`{ let ${contadorIteracion} = 0;`);
        }
        this.out.push(
            `while (${cond}) { ${contadorIteracion ? `${contadorIteracion}++; ` : ''}__paso();`
        );
        if (contadorIteracion) {
            this.ciclosDebug.push({
                tipo: 'Mientras',
                contador: contadorIteracion,
            });
            this.emitirDebug(linea);
        }
        this.i++;
        this.recorrerHasta(['finmientras'], {
            linea,
            nombre: 'Mientras',
            cierre: 'FinMientras',
        });
        this.i++;
        if (contadorIteracion) {
            this.ciclosDebug.pop();
        }
        this.out.push('}');
        if (contadorIteracion) {
            this.out.push('}');
        }
    }

    /**
     * Transpila `Para v <- ini Hasta fin [Con Paso p] Hacer ... FinPara`.
     * La asignación exige '<-' (no '='), valida cada parte con número de
     * línea y da pistas pedagógicas (ej. límite 'H' sin declarar →
     * ¿quisiste escribir 'Hacer'?). El paso se captura en una constante
     * para que no cambie dentro del bucle.
     */
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
        const contadorIteracion = this.debug
            ? `__debugIter${this.contador++}`
            : null;
        this.declararVariable(vNombre);
        this.out.push(
            `{ const ${pasoVar} = ${pasoVal};${contadorIteracion ? ` let ${contadorIteracion} = 0;` : ''}`
        );
        this.out.push(
            `for (${vNombre} = ${ini}; ${pasoVar} > 0 ? ${vNombre} <= ${fin} : ${vNombre} >= ${fin}; ${vNombre} = ${vNombre} + ${pasoVar}) { ${contadorIteracion ? `${contadorIteracion}++; ` : ''}__paso();`
        );
        if (contadorIteracion) {
            this.ciclosDebug.push({
                tipo: 'Para',
                contador: contadorIteracion,
                variable: vNombre,
            });
            this.emitirDebug(linea);
        }
        this.i++;
        this.recorrerHasta(['finpara'], {
            linea,
            nombre: 'Para',
            cierre: 'FinPara',
        });
        if (this.clave() === 'finpara') {
            this.i++;
        }
        if (contadorIteracion) {
            this.ciclosDebug.pop();
        }
        this.out.push('}');
        this.out.push('}');
    }

    /**
     * Transpila `Repetir ... Hasta [Que] cond` (do-while invertido).
     * La condición es obligatoria: si falta el cierre se lanza error.
     */
    private compilarRepetir(): void {
        const linea = this.lineas[this.i];
        const contadorIteracion = this.debug
            ? `__debugIter${this.contador++}`
            : null;
        if (contadorIteracion) {
            this.out.push(`{ let ${contadorIteracion} = 0;`);
        }
        this.out.push(
            `do { ${contadorIteracion ? `${contadorIteracion}++; ` : ''}__paso();`
        );
        if (contadorIteracion) {
            this.ciclosDebug.push({
                tipo: 'Repetir',
                contador: contadorIteracion,
            });
        }
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
        if (contadorIteracion) {
            this.ciclosDebug.pop();
        }
        this.out.push(`} while (!(${cond}));`);
        if (contadorIteracion) {
            this.out.push('}');
        }
    }

    /**
     * Transpila `Según expr Hacer ... FinSegún` (switch de JS). Exige
     * 'Hacer' (con pista si se escribió 'Entonces') y valida que exista
     * FinSegún.
     */
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

    /**
     * Transpila los casos del Según: `Caso N:`, la forma abreviada
     * `N:`/`- N`, instrucciones inline después de ':' y
     * `De Otro Modo:` (con o sin dos puntos) como default.
     * Cada caso termina en break.
     */
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

    /**
     * Detecta la sintaxis abreviada de caso: línea que empieza con ':'
     * o '-', o que contiene un ':' (ej. `1: Escribir "hola"`).
     */
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

    /**
     * Compila instrucciones en línea tras un Caso (ej. `Caso 1: suma <- 10`).
     * Soporta Escribir, Leer y asignaciones (reutilizando el compilador de
     * asignaciones para respetar arreglos y declaraciones).
     */
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

    /**
     * Transpila `Funcion r <- Nombre(a, b)` / `SubProceso Nombre(a, b)`.
     * Las funciones se generan como async (pueden llamar a otras async),
     * con su valor de retorno declarado y devuelto al final. Rechaza
     * nombres que chocan con las funciones incorporadas del runtime.
     */
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

    /**
     * Transpila 'Limpiar Pantalla' o 'Borrar Pantalla'.
     */
    private compilarLimpiarPantalla(): void {
        const linea = this.lineas[this.i];
        if (
            linea.toks[1]?.tipo === 'word' &&
            normVar(linea.toks[1].val) === 'pantalla'
        ) {
            this.out.push('__limpiarPantalla();');
            this.i++;
            return;
        }
        this.compilarAsignacion();
    }

    /**
     * Transpila 'Esperar Tecla' o 'Esperar n Segundos/Milisegundos'.
     */
    private compilarEsperar(): void {
        const linea = this.lineas[this.i];
        const toks = linea.toks.slice(1);
        if (toks.length === 0) {
            this.errorSintaxis(
                linea,
                "se esperaba 'Tecla' o una cantidad de tiempo después de 'Esperar'."
            );
        }
        if (toks[0].tipo === 'word' && normVar(toks[0].val) === 'tecla') {
            this.out.push('await __esperarTecla();');
            this.i++;
            return;
        }
        let unidad = 'segundos';
        let finExpr = toks.length;
        const ult = toks[toks.length - 1];
        if (ult && ult.tipo === 'word') {
            const u = normVar(ult.val);
            if (['segundos', 'segundo', 'seg', 's'].includes(u)) {
                unidad = 'segundos';
                finExpr = toks.length - 1;
            } else if (['milisegundos', 'milisegundo', 'ms'].includes(u)) {
                unidad = 'milisegundos';
                finExpr = toks.length - 1;
            }
        }
        const exprToks = toks.slice(0, finExpr);
        if (exprToks.length === 0) {
            this.errorSintaxis(
                linea,
                "se esperaba el tiempo a esperar después de 'Esperar'."
            );
        }
        const exp = new Expresion(exprToks, linea);
        const duracion = exp.parse();
        const multiplicador = unidad === 'segundos' ? 1000 : 1;
        this.out.push(`await __esperar((${duracion}) * ${multiplicador});`);
        this.i++;
    }

    /**
     * Transpila 'Romper' o 'Interrumpir' (break en bucles).
     */
    private compilarRomper(): void {
        this.out.push('break;');
        this.i++;
    }

    /**
     * Transpila 'Continuar' (continue en bucles).
     */
    private compilarContinuar(): void {
        this.out.push('continue;');
        this.i++;
    }

    private compilarFinalizar(): void {
        this.out.push('return;');
        this.i++;
    }

    /**
     * Transpila `Retornar` con o sin expresión de retorno.
     */
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

    /**
     * Transpila asignaciones `destino <- expresión` con validación ESTRICTA:
     * '=' y '==' en posición de asignación son error con pista pedagógica
     * (igual que '++/--'), cierres de bloque huérfanos (FinSi, Hasta...)
     * dan un mensaje específico, y las llamadas con paréntesis se
     * compilan como expresión. Además declara la variable si es nueva.
     */
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
        const dest = this.analizarDestino(
            linea.toks.slice(0, opIdx),
            linea
        );
        if (dest.esArreglo && dest.indices) {
            this.out.push(
                `__arrSet(${dest.nombre}, '${dest.nombre}', ${expr}, ${linea.numero}, ${dest.indices.join(', ')});`);
        } else {
            this.declararVariable(dest.nombre);
            this.out.push(`${dest.nombre} = ${expr};`);
        }
        this.i++;
    }

    /**
     * Determina el destino de una asignación: si lleva corchetes es una
     * posición de arreglo (se parsea la expresión completa) y si no, una
     * variable simple normalizada.
     */
    private analizarDestino(
        toks: Token[],
        linea?: Linea
    ): {
        esArreglo: boolean;
        nombre: string;
        indices?: string[];
    } {
        const tieneCorchete = toks.some(
            (t, idx) => idx > 0 && t.tipo === 'punt' && t.val === '['
        );
        if (tieneCorchete) {
            const exp = new Expresion(toks, linea);
            const { nombre, indices } = exp.analizarIndizado();
            return {
                esArreglo: true,
                nombre,
                indices,
            };
        }
        if (toks.length > 0 && toks[0].tipo === 'word') {
            return { esArreglo: false, nombre: normVar(toks[0].val) };
        }
        return { esArreglo: false, nombre: '' };
    }

    /**
     * Compila sentencias consecutivas hasta llegar a una de las palabras
     * de cierre indicadas. Si se llega a FinAlgoritmo/FinProceso o al fin
     * del código sin el cierre esperado, lanza "el 'X' no se cerró".
     */
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

    /**
     * Lanza un error de sintaxis con el número de línea de origen.
     * Es el formato estándar de todos los errores del compilador.
     */
    private errorSintaxis(linea: Linea, mensaje: string): never {
        throw new Error(
            `Error de sintaxis en la línea ${linea.numero}: ${mensaje}`
        );
    }

    /**
     * Error genérico cuando la instrucción no se reconoce
     * (con número de línea).
     */
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
    'aleatorio',
    'redondear',
    'truncar',
    'raiz',
    'rc',
    'abs',
    'potencia',
    'sen',
    'cos',
    'tan',
    'log',
    'exp',
    'esnumero',
    'limpiarpantalla',
    'pi',
]);
