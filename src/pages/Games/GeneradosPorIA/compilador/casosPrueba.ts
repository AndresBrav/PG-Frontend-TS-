import type {
    CasoPruebaGrupo,
    ResultadoCasoPrueba,
} from '../../../../types/dominio';
import { ejecutarPseudocodigo } from './runtime';

const MAX_LINEAS_SALIDA = 20;
const MAX_LONGITUD_SALIDA = 500;

const normalizarSalidas = (salidas: string[]) =>
    salidas.map((salida) => salida.replace(/\r\n/g, '\n').trim());

export const ejecutarCasosPrueba = async (
    codigo: string,
    casos: CasoPruebaGrupo[],
): Promise<ResultadoCasoPrueba[]> => {
    const resultados: ResultadoCasoPrueba[] = [];

    for (let indice = 0; indice < casos.length; indice += 1) {
        const caso = casos[indice];
        let entradaActual = 0;
        const salidaObtenida: string[] = [];
        let error: string | null = null;

        const ejecucion = await ejecutarPseudocodigo(codigo, {
            imprimir: (texto) => {
                if (
                    salidaObtenida.length >= MAX_LINEAS_SALIDA ||
                    texto.length > MAX_LONGITUD_SALIDA
                ) {
                    throw new Error(
                        'La salida excede el límite permitido para este caso.',
                    );
                }
                salidaObtenida.push(texto);
            },
            pedirEntrada: async (nombre) => {
                if (entradaActual >= caso.entradas.length) {
                    throw new Error(
                        `Falta una entrada para la variable "${nombre}".`,
                    );
                }
                const entrada = caso.entradas[entradaActual];
                entradaActual += 1;
                return entrada;
            },
        });

        if (ejecucion.error) {
            error = ejecucion.error;
        } else if (entradaActual < caso.entradas.length) {
            error = `Sobran ${caso.entradas.length - entradaActual} entrada(s) sin leer.`;
        }

        const aprobado =
            error === null &&
            JSON.stringify(normalizarSalidas(salidaObtenida)) ===
                JSON.stringify(normalizarSalidas(caso.salidas_esperadas));

        resultados.push({
            indice,
            aprobado,
            salida_obtenida: salidaObtenida,
            error,
        });
    }

    return resultados;
};
