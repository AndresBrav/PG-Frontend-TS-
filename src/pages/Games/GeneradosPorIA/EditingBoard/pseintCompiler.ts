export interface CallbacksEjecucion {
    imprimir: (texto: string) => void;
    pedirEntrada: (nombre: string) => Promise<string>;
}

export interface ResultadoEjecucion {
    salida: string[];
    error?: string;
}

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

function normVar(nombre: string): string {
    return quitarAcentos(nombre).toLowerCase();
}

function tokenizar(linea: string): Token[] {
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
            while (i < linea.length && linea[i] !== comilla) {
                str += linea[i];
                i++;
            }
            i++;
            toks.push({ tipo: 'str', val: str });
            continue;
        }
        const pareja = linea.slice(i, i + 2);
        if (dosOp.includes(pareja)) {
            toks.push({ tipo: 'punt', val: pareja });
            i += 2;
            continue;
        }
        if ('+-*/%^<>=(),:[];'.includes(c)) {
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
        lineas.push({ numero: idx + 1, toks: tokenizar(limpia) });
    });
    return lineas;
}

class Expresion {
    private toks: Token[];
    private pos = 0;

    constructor(toks: Token[]) {
        this.toks = toks;
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

    private actual(): Token | undefined {
        return this.toks[this.pos];
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
        }
        return indices
            .map((i) => `[(${i}) - 1]`)
            .reduce((acc, seg) => acc + seg, palabra);
    }
}

class Compilador {
    private lineas: Linea[];
    private tipos = new Map<string, string>();
    private declaradas = new Set<string>();
    private i = 0;
    private out: string[] = [];
    private contador = 0;

    constructor(lineas: Linea[]) {
        this.lineas = lineas;
    }

    compilar(): string {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (k === 'algoritmo' || k === 'proceso') {
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
            default:
                this.compilarAsignacion();
        }
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
        this.out.push(`let ${v};`);
        this.declaradas.add(v);
    }

    private compilarDefinir(): void {
        const linea = this.lineas[this.i];
        const idxComo = this.indicePalabra(linea, 1, 'como');
        const varsAux: string[] = [];
        if (idxComo === -1) {
            for (let j = 1; j < linea.toks.length; j++) {
                if (linea.toks[j].tipo === 'word') {
                    varsAux.push(normVar(linea.toks[j].val));
                }
            }
        } else {
            for (let j = 1; j < idxComo; j++) {
                if (linea.toks[j].tipo === 'word') {
                    varsAux.push(normVar(linea.toks[j].val));
                }
            }
            const tipoVal = linea.toks[idxComo + 1];
            if (tipoVal && tipoVal.tipo === 'word') {
                for (const v of varsAux) {
                    this.tipos.set(v, normVar(tipoVal.val));
                }
            }
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
                    dims.push(new Expresion(parte).parse());
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
            const nombre = normVar(
                seg.find((t) => t.tipo === 'word')?.val ?? ''
            );
            if (!nombre) {
                continue;
            }
            const tipo = this.tipos.get(nombre) ?? '';
            if (tieneIndice) {
                const destino = new Expresion(seg).parse();
                this.out.push(
                    `${destino} = await __leer(${JSON.stringify(nombre)}, ${JSON.stringify(tipo)});`
                );
            } else {
                this.declararVariable(nombre);
                this.out.push(
                    `${nombre} = await __leer(${JSON.stringify(nombre)}, ${JSON.stringify(tipo)});`
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
        const resto = linea.toks.slice(inicio);
        if (resto.length === 0) {
            this.i++;
            return;
        }
        const exp = new Expresion(resto);
        const args = exp.argumentos();
        this.out.push(`__escribir(${args.join(', ')});`);
        this.i++;
    }

    private compilarSi(): void {
        const linea = this.lineas[this.i];
        const idxEntonces = this.indicePalabra(linea, 1, 'entonces');
        const condToks =
            idxEntonces === -1
                ? linea.toks.slice(1)
                : linea.toks.slice(1, idxEntonces);
        const cond = new Expresion(condToks).parse();
        this.out.push(`if (${cond}) {`);
        this.i++;
        this.recorrerHasta(['finsi', 'sino']);
        if (this.clave() === 'sino') {
            this.i++;
            this.out.push('} else {');
            this.recorrerHasta(['finsi']);
        }
        if (this.clave() === 'finsi') {
            this.i++;
        }
        this.out.push('}');
    }

    private compilarMientras(): void {
        const linea = this.lineas[this.i];
        const idxHacer = this.indicePalabra(linea, 1, 'hacer');
        const condToks =
            idxHacer === -1
                ? linea.toks.slice(1)
                : linea.toks.slice(1, idxHacer);
        const cond = new Expresion(condToks).parse();
        this.out.push(`while (${cond}) { __paso();`);
        this.i++;
        this.recorrerHasta(['finmientras']);
        if (this.clave() === 'finmientras') {
            this.i++;
        }
        this.out.push('}');
    }

    private compilarPara(): void {
        const linea = this.lineas[this.i];
        const vNombre = normVar(linea.toks[1]?.val ?? '');
        if (!vNombre) {
            this.erro(linea);
        }
        let opIdx = -1;
        for (let j = 2; j < linea.toks.length; j++) {
            if (
                linea.toks[j].tipo === 'punt' &&
                (linea.toks[j].val === '<-' || linea.toks[j].val === '=')
            ) {
                opIdx = j;
                break;
            }
        }
        if (opIdx === -1) {
            this.throwErro(linea);
        }
        const idxHasta = this.indicePalabra(linea, opIdx + 1, 'hasta');
        if (idxHasta === -1) {
            this.erro(linea);
        }
        const iniToks = linea.toks.slice(opIdx + 1, idxHasta);
        const resto = linea.toks.slice(idxHasta + 1);
        const iHacer = this.indicePalabraEn(resto, 'hacer');
        const finToks = iHacer === -1 ? resto : resto.slice(0, iHacer);
        const idxPasoWord = this.indicePalabraEn(finToks, 'paso');
        let finTok = finToks;
        let pasoToks: Token[] = [];
        if (idxPasoWord !== -1) {
            const restoPaso = finToks.slice(idxPasoWord + 1);
            let completo = 0;
            if (
                restoPaso[0]?.tipo === 'word' &&
                normVar(restoPaso[0].val) === 'paso'
            ) {
                pasoToks = restoPaso.slice(1);
            } else {
                pasoToks = restoPaso;
            }
            finTok = finToks.slice(0, idxPasoWord);
        }
        const ini = new Expresion(iniToks).parse();
        const fin = new Expresion(finTok).parse();
        const pasoVal = pasoToks.length ? new Expresion(pasoToks).parse() : '1';
        const pasoVar = `__pi${this.contador++}`;
        this.declararVariable(vNombre);
        this.out.push(`{ const ${pasoVar} = ${pasoVal};`);
        this.out.push(
            `for (${vNombre} = ${ini}; ${pasoVar} > 0 ? ${vNombre} <= ${fin} : ${vNombre} >= ${fin}; ${vNombre} = ${vNombre} + ${pasoVar}) { __paso();`
        );
        this.i++;
        this.recorrerHasta(['finpara']);
        if (this.clave() === 'finpara') {
            this.i++;
        }
        this.out.push('}');
        this.out.push('}');
    }

    private indicePalabraEn(resto: Token[], palabra: string): number {
        for (let j = 0; j < resto.length; j++) {
            if (resto[j].tipo === 'word' && normVar(resto[j].val) === palabra) {
                return j;
            }
        }
        return -1;
    }

    private compilarRepetir(): void {
        this.out.push('do { __paso();');
        this.i++;
        this.recorrerHasta(['hasta']);
        let cond = 'false';
        const linea = this.lineas[this.i];
        if (this.clave() === 'hasta') {
            let inicioHasta = 1;
            if (
                linea &&
                linea.toks[1]?.tipo === 'word' &&
                normVar(linea.toks[1].val) === 'que'
            ) {
                inicioHasta = 2;
            }
            cond = new Expresion(linea.toks.slice(inicioHasta)).parse();
            this.i++;
        }
        this.out.push(`} while (!(${cond}));`);
    }

    private compilarSegun(): void {
        const linea = this.lineas[this.i];
        const idxHacer = this.indicePalabra(linea, 1, 'hacer');
        const exprToks =
            idxHacer === -1
                ? linea.toks.slice(1)
                : linea.toks.slice(1, idxHacer);
        const expr = new Expresion(exprToks).parse();
        this.out.push(`switch (${expr}) {`);
        this.i++;
        this.compilarCasos();
        if (this.clave() === 'finsegun') {
            this.i++;
        }
        this.out.push('}');
    }

    private compilarCasos(): void {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (k === 'finsegun') {
                return;
            }
            const linea = this.lineas[this.i];
            if (k === 'caso' || this.esLineaCaso(linea)) {
                const idxPuntos = linea.toks.findIndex(
                    (t) => t.tipo === 'punt' && t.val === ':'
                );
                const labelsToks =
                    idxPuntos <= 0
                        ? linea.toks
                              .filter(
                                  (t) =>
                                      !(
                                          t.tipo === 'punt' &&
                                          (t.val === ':' || t.val === '-')
                                      )
                              )
                        : linea.toks.slice(0, idxPuntos);
                const labels = new Expresion(labelsToks).argumentos();
                for (const lbl of labels) {
                    this.out.push(`case ${lbl}:`);
                }
                const restoLinea =
                    idxPuntos !== -1 ? linea.toks.slice(idxPuntos + 1) : [];
                this.i++;
                if (restoLinea.length > 0) {
                    this.out.push(
                        ...this.compilarToksInLinea(restoLinea)
                    );
                }
                while (this.i < this.lineas.length) {
                    const k2 = this.clave();
                    if (
                        k2 === 'caso' ||
                        k2 === 'finsegun' ||
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
                        this.clave() === 'caso'
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

    private compilarToksInLinea(toks: Token[]): string[] {
        const salida: string[] = [];
        const k = normVar(toks[0]?.val ?? '');
        if (k === 'escribir') {
            const exp = new Expresion(toks.slice(1));
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
            aux.lineas = [{ toks }];
            aux.compilarLeer();
            salida.push(...aux.out);
        } else {
            const exp = new Expresion(toks);
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
            this.erro(linea);
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
        this.recorrerHasta([finNombre]);
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

    private compilarRetornar(): void {
        const linea = this.lineas[this.i];
        const resto = linea.toks.slice(1);
        if (resto.length === 0) {
            this.out.push('return;');
        } else {
            const expr = new Expresion(resto).parse();
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
                opIdx = j;
                break;
            }
        }
        if (opIdx === -1) {
            const tieneParentesis = linea.toks.some(
                (t, idx) => idx > 0 && t.tipo === 'punt' && t.val === '('
            );
            if (tieneParentesis) {
                const call = new Expresion(linea.toks).parse();
                this.out.push(`${call};`);
                this.i++;
                return;
            }
            this.erro(linea);
        }
        const exprToks = linea.toks.slice(opIdx + 1);
        const expr = new Expresion(exprToks).parse();
        const { esArreglo, destino } = this.analizarDestino(
            linea.toks.slice(0, opIdx)
        );
        if (!esArreglo) {
            this.declararVariable(nombre);
        }
        this.out.push(`${destino} = ${expr};`);
        this.i++;
    }

    private analizarDestino(toks: Token[]): {
        esArreglo: boolean;
        destino: string;
    } {
        const tieneCorchete = toks.some(
            (t, idx) => idx > 0 && t.tipo === 'punt' && t.val === '['
        );
        if (tieneCorchete) {
            return {
                esArreglo: true,
                destino: new Expresion(toks).parse(),
            };
        }
        if (toks.length > 0 && toks[0].tipo === 'word') {
            return { esArreglo: false, destino: normVar(toks[0].val) };
        }
        return { esArreglo: false, destino: '' };
    }

    private recorrerHasta(finales: string[]): void {
        while (this.i < this.lineas.length) {
            const k = this.clave();
            if (finales.includes(k)) {
                return;
            }
            if (k === 'finalgoritmo' || k === 'finproceso') {
                return;
            }
            this.compilarSentencia();
        }
    }

    private erro(linea: Linea): never {
        throw new Error(
            `Error de sintaxis en la línea ${linea.numero}. No pude reconocer la instrucción.`
        );
    }

    private throwErro(linea: Linea): never {
        throw new Error(
            `Error de sintaxis en la línea ${linea.numero}. Revisa la estructura del 'Para'.`
        );
    }
}

export function ejecutarPseudo(codigo: string): string {
    const lineas = preprocesar(codigo);
    const c = new Compilador(lineas);
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
        fuente = ejecutarPseudo(codigo);
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
    const __leer = async (nombre, tipo) => {
        const valor = await callbacks.pedirEntrada(nombre);
        return convertir(valor, tipo);
    };
    const __escribir = (...args) => {
        const texto = args
            .map(a => typeof a === 'boolean' ? (a ? 'VERDADERO' : 'FALSO') : String(a))
            .join(' ');
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
