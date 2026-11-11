import type { EstadoEjecucion } from './pseintCompiler';
import type { PerfilVariable } from './visualUtils';
import { colorDeVariable } from './visualUtils';

interface ArregloCasillasProps {
    /** Perfiles calculados sobre la traza recortada al paso elegido. */
    perfiles: PerfilVariable[];
    /** Captura del paso activo. */
    captura: EstadoEjecucion | null;
    /** Captura inmediatamente anterior (para encender las casillas cambiadas). */
    anterior: EstadoEjecucion | null;
}

const MAX_CASILLAS = 96;

/** Texto corto de una celda (soporta elementos anidados). */
const textoCelda = (valor: unknown): string => {
    if (Array.isArray(valor)) {
        return `[${valor.map((v) => textoCelda(v)).join(',')}]`;
    }
    if (typeof valor === 'boolean') return valor ? 'V' : 'F';
    return String(valor);
};

const sonIguales = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a) === JSON.stringify(b);

/**
 * Pestaña "Arreglos": cada `Dimension` dibujado como casillas con su
 * índice (0, 1, 2...). La casilla cuyo valor cambió respecto al paso
 * anterior se enciende. Los arreglos anidados se muestran como matriz.
 */
const ArregloCasillas = ({ perfiles, captura, anterior }: ArregloCasillasProps) => {
    if (!captura) {
        return (
            <p style={{ fontSize: 12, color: '#888', padding: '6px 2px' }}>
                Ejecuta un algoritmo con {`«Dimension»`} para ver los vectores
                aquí.
            </p>
        );
    }

    const arreglos = perfiles.filter(
        (p) => p.tipo === 'arreglo' && p.serieArreglo.length > 0
    );

    if (arreglos.length === 0) {
        return (
            <p style={{ fontSize: 12, color: '#888', padding: '6px 2px' }}>
                Este algoritmo no usa arreglos (Dimension).
            </p>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
            }}
        >
            {arreglos.map((perfil) => {
                const color = colorDeVariable(perfil.indice);
                const actual = perfil.serieArreglo[perfil.serieArreglo.length - 1];
                const valores = actual.valores;

                // Arreglo en el paso anterior (de la traza recortada)
                let valoresAntes: unknown[] | null = null;
                if (anterior) {
                    const crudo = anterior.variables.find(
                        (v) => v.nombre === perfil.nombre
                    )?.valor;
                    if (crudo?.startsWith('[')) {
                        try {
                            const parsed = JSON.parse(crudo);
                            if (Array.isArray(parsed)) valoresAntes = parsed;
                        } catch {
                            /* ignora */
                        }
                    }
                }

                const anidado = valores.some((v) => Array.isArray(v));
                const truncado = valores.length > MAX_CASILLAS;
                const visibles = truncado
                    ? valores.slice(0, MAX_CASILLAS)
                    : valores;

                return (
                    <div
                        key={perfil.nombre}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '8px 10px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color,
                                }}
                            >
                                {perfil.nombre}
                            </span>
                            <span style={{ fontSize: 11, color: '#888' }}>
                                ({valores.length}
                                {anidado ? ' × filas anidadas' : ' posiciones'})
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 3,
                                marginTop: 6,
                                flexWrap: 'wrap',
                            }}
                        >
                            {visibles.map((valor, indice) => {
                                const cambio =
                                    valoresAntes !== null &&
                                    (indice >= valoresAntes.length ||
                                        !sonIguales(valor, valoresAntes[indice]));

                                return (
                                    <div
                                        key={indice}
                                        title={`${perfil.nombre}[${indice}] = ${textoCelda(valor)}`}
                                        style={{
                                            minWidth: 38,
                                            textAlign: 'center',
                                            borderRadius: 6,
                                            border: cambio
                                                ? `1px solid ${color}`
                                                : '1px solid var(--border)',
                                            backgroundColor: cambio
                                                ? 'rgba(255,255,255,0.10)'
                                                : 'rgba(0,0,0,0.2)',
                                            padding: '2px 5px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 9,
                                                color: '#777',
                                                lineHeight: '10px',
                                            }}
                                        >
                                            {indice}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: 'var(--mono)',
                                                fontSize: 11,
                                                color: cambio
                                                    ? 'var(--text)'
                                                    : '#bbb',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: 90,
                                                lineHeight: '14px',
                                            }}
                                        >
                                            {textoCelda(valor)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {truncado && (
                            <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                                +{valores.length - MAX_CASILLAS} posiciones más
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ArregloCasillas;
