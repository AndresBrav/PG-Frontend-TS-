/**
 * Tokenizador y preprocesado del pseudocódigo PSeInt.
 *
 * Primera fase del compilador: limpia comentarios, parte el código en
 * líneas numeradas y las convierte en tokens. También define normVar(),
 * la normalización de identificadores usada por todo el motor.
 */
import type { Linea, Token } from './tipos';

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

export /** Elimina acentos y eñes de un texto (á→a, ñ→n). */
function quitarAcentos(texto: string): string {
    return texto.replace(/[áéíóúÁÉÍÓÚñÑ]/g, (c) => MAPA_ACENTOS[c] ?? c);
}

/**
 * Normaliza un identificador para comparar: sin acentos y en minúsculas.
 * Es la función central de equivalencia de nombres en PSeInt (las palabras
 * clave y variables son insensibles a mayúsculas y tildes).
 */
export function normVar(nombre: string): string {
    return quitarAcentos(nombre).toLowerCase();
}

/**
 * Convierte una línea de pseudocódigo en una lista de tokens.
 * Reconoce cadenas entre comillas (con validación de cierre), operadores
 * de dos caracteres (<-, <>, <=, >=, ==), símbolos, números (con un solo
 * punto decimal) e identificadores con tildes.
 * Lanza "Error de sintaxis en la línea N" ante comillas sin cerrar,
 * números mal formados o caracteres no reconocidos (con pista pedagógica).
 */
export function tokenizar(linea: string, numeroLinea: number): Token[] {
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

/**
 * Elimina los comentarios `//` de una línea (respetando el contenido de
 * las cadenas entre comillas) y recorta los espacios de los bordes.
 */
export function normalizarLinea(linea: string): string {
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

/**
 * Prepara el código fuente para el Compilador: separa por líneas, limpia
 * comentarios y tokeniza cada línea conservando su número original (1-based),
 * de modo que los errores puedan señalar la línea exacta del editor.
 */
export function preprocesar(codigo: string): Linea[] {
    const lineas: Linea[] = [];
    codigo.split('\n').forEach((bruta, idx) => {
        const limpia = normalizarLinea(bruta);
        if (!limpia) {
            return;
        }
        lineas.push({
            numero: idx + 1,
            texto: limpia,
            toks: tokenizar(limpia, idx + 1),
        });
    });
    return lineas;
}