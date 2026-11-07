import React, { useMemo, useState } from 'react';
import type { EstadoEjecucion, VariableEstado } from './pseintCompiler';

interface PanelVariablesEjecucionProps {
    /** Captura más reciente de las variables (null si aún no se ejecuta). */
    estado: EstadoEjecucion | null;
    /** Traza histórica de capturas (más antigua primero). */
    historial: EstadoEjecucion[];
    /** true mientras corre el pseudocódigo. */
    enEjecucion: boolean;
}

const MAX_FILAS = 150;

const coloresVariable = [
    '#4ADE80',
    '#60A5FA',
    '#F472B6',
    '#FACC15',
    '#A78BFA',
    '#2DD4BF',
    '#FB923C',
    '#F87171',
];

/**
 * Panel tipo debug: muestra el valor actual de cada variable
 * declarada y la traza histórica (tabla PSeInt) de cómo cambian.
 */
const PanelVariablesEjecucion = ({
    estado,
    historial,
    enEjecucion,
}: PanelVariablesEjecucionProps) => {
    const [mostrarHistorial, setMostrarHistorial] = useState(true);

    // Variables vigentes con el estado más reciente
    const variables = estado?.variables ?? [];

    // Columnas del historial (unión de nombres en orden de aparición)
    const nombres = useMemo(() => {
        const vistos: string[] = [];
        const presentes = new Set<string>();
        for (const captura of [...historial.slice(-MAX_FILAS), estado]) {
            for (const v of captura?.variables ?? []) {
                if (!presentes.has(v.nombre)) {
                    presentes.add(v.nombre);
                    vistos.push(v.nombre);
                }
            }
        }
        return vistos;
    }, [historial, estado]);

    const filas = useMemo(
        () => historial.slice(-MAX_FILAS),
        [historial],
    );

    // Valores de la fila anterior, para resaltar el cambio
    const valoresAnteriores = useMemo(() => {
        if (filas.length === 0) return new Map<string, string>();
        const previo = filas[filas.length - 1];
        return new Map(previo.variables.map((v) => [v.nombre, v.valor]));
    }, [filas]);

    if (!estado) {
        return null;
    }

    const colorDe = (nombre: string) =>
        coloresVariable[nombres.indexOf(nombre) % coloresVariable.length];

    const armarFilas = (): Record<string, string>[] =>
        filas.map((captura) => {
            const fila: Record<string, string> = {};
            for (const v of captura.variables) {
                fila[v.nombre] = v.valor;
            }
            return fila;
        });

    return (
        <div
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 15px',
                color: 'var(--text)',
                flexShrink: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                }}
            >
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    🔍 Variables en Ejecución
                    {enEjecucion && (
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: '#FBBF24',
                            }}
                        >
                            ● vivo
                        </span>
                    )}
                    <span
                        style={{ fontSize: 11, color: '#888', fontWeight: 500 }}
                    >
                        (paso {estado.paso})
                    </span>
                </span>
                {nombres.length > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            setMostrarHistorial((prev) => !prev)
                        }
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8ab4f8',
                            cursor: 'pointer',
                            fontSize: 11,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {mostrarHistorial ? 'Ocultar traza ▲' : 'Ver traza ▼'}
                    </button>
                )}
            </div>

            {/* Valores actuales */}
            <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}
            >
                {variables.map((v) => {
                    const previo = valoresAnteriores.get(v.nombre);
                    const cambio =
                        filas.length > 0 && previo !== v.valor;
                    return (
                        <span
                            key={v.nombre}
                            style={{
                                fontFamily: 'var(--mono)',
                                fontSize: 12,
                                padding: '3px 8px',
                                borderRadius: 6,
                                backgroundColor: cambio
                                    ? 'rgba(74, 222, 128, 0.12)'
                                    : 'rgba(255,255,255,0.04)',
                                outline: cambio
                                    ? '1px solid rgba(74, 222, 128, 0.45)'
                                    : '1px solid transparent',
                            }}
                        >
                            <b
                                style={{
                                    color: colorDe(v.nombre),
                                }}
                            >
                                {v.nombre}
                            </b>
                            {` = ${v.valor}`}
                        </span>
                    );
                })}
                {variables.length === 0 && (
                    <span style={{ fontSize: 12, color: '#888' }}>
                        Ejecuta un algoritmo con «Definir» para ver sus
                        variables aquí.
                    </span>
                )}
            </div>

            {/* Traza histórica tipo PSeInt */}
            {mostrarHistorial && nombres.length > 0 && filas.length > 0 && (
                <div
                    style={{
                        overflow: 'auto',
                        maxHeight: 220,
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                    }}
                >
                    <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    position: 'sticky',
                                    top: 0,
                                }}
                            >
                                <th
                                    style={{
                                        padding: '5px 10px',
                                        fontSize: 11,
                                        color: '#888',
                                        textAlign: 'right',
                                        borderBottom: '1px solid var(--border)',
                                        borderRight: '1px solid var(--border)',
                                    }}
                                >
                                    #
                                </th>
                                {nombres.map((nombre) => (
                                    <th
                                        key={nombre}
                                        style={{
                                            padding: '5px 12px',
                                            fontSize: 12,
                                            fontFamily: 'var(--mono)',
                                            textAlign: 'left',
                                            borderBottom: '1px solid var(--border)',
                                            color: colorDe(nombre),
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {armarFilas().map((fila, indice) => (
                                <tr key={indice}>
                                    <td
                                        style={{
                                            padding: '3px 10px',
                                            fontSize: 10,
                                            color: '#666',
                                            textAlign: 'right',
                                            borderRight: '1px solid var(--border)',
                                            fontFamily: 'var(--mono)',
                                        }}
                                    >
                                        {filas[indice].paso}
                                    </td>
                                    {nombres.map((nombre) => (
                                        <td
                                            key={nombre}
                                            style={{
                                                padding: '3px 12px',
                                                fontSize: 12,
                                                fontFamily: 'var(--mono)',
                                                whiteSpace: 'nowrap',
                                                color:
                                                    fila[nombre] === undefined
                                                        ? '#555'
                                                        : 'var(--text)',
                                            }}
                                        >
                                            {fila[nombre] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PanelVariablesEjecucion;
export type { EstadoEjecucion, VariableEstado };
