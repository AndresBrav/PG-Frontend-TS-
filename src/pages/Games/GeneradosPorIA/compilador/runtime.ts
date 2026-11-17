/**
 * Runtime de ejecución del pseudocódigo PSeInt.
 *
 * Última fase del motor: toma el JS generado por el transpilador, lo
 * envuelve con las funciones incorporadas (Raiz, Azar, Longitud...), el
 * límite de pasos anti-bucle-infinito y los callbacks de UI (consola,
 * entrada del usuario y capturas del modo película), y lo ejecuta de
 * forma asíncrona.
 */
import { ejecutarPseudo } from './compilador';
import { MAX_PASOS } from './tipos';
import type {
    CallbacksEjecucion,
    ResultadoEjecucion,
} from './tipos';

/**
 * Funciones incorporadas de PSeInt disponibles para el usuario (Raiz,
 * Azar, Longitud, Subcadena, etc.). Se inyectan como constantes dentro
 * del cuerpo generado por ejecutarPseudocodigo.
 */
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

/**
 * Punto de entrada del motor: compila el pseudocódigo y lo ejecuta.
 *
 * Flujo: ejecutarPseudo() transpila PSeInt → JS; el JS se arma con las
 * funciones incorporadas, el control de bucles infinitos (__paso con
 * MAX_PASOS) y los puentes al UI (__escribir → consola, __leer → modal
 * de entrada, __debug → modo película con throttle 300 + 1/1000).
 * Devuelve { salida, error } en lugar de lanzar: los errores de sintaxis
 * y de ejecución llegan como string en 'error'.
 */
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

/**
 * Convierte el texto ingresado por el usuario al tipo PSeInt declarado
 * (entero, real, logico, cadena/caracter). Acepta coma decimal; si no
 * puede convertir, devuelve el texto tal cual (comportamiento PSeInt).
 */
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