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
    const [mostrarHistorial, setMostrarHistorial] = useState(false);

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

    const filas = useMemo(() => historial.slice(-MAX_FILAS), [historial]);

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
                maxHeight: '45%',
                overflowY: 'auto',
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
                    {/* <span
                        style={{ fontSize: 11, color: '#888', fontWeight: 500 }}
                    >
                        (paso {estado.paso})
                    </span> */}
                </span>
                {nombres.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setMostrarHistorial((prev) => !prev)}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
                {variables.map((v) => {
                    const previo = valoresAnteriores.get(v.nombre);
                    const cambio = filas.length > 0 && previo !== v.valor;
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
                        maxHeight: 140,
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                    }}
                >
                    <table
                        style={{ borderCollapse: 'collapse', minWidth: '100%' }}
                    >
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    position: 'sticky',
                                    top: 0,
                                }}
                            >
                                {nombres.map((nombre) => (
                                    <th
                                        key={nombre}
                                        style={{
                                            padding: '5px 12px',
                                            fontSize: 12,
                                            fontFamily: 'var(--mono)',
                                            textAlign: 'left',
                                            borderBottom:
                                                '1px solid var(--border)',
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

const COLORES_FICHA = [
    '#22c55e',
    '#60a5fa',
    '#f472b6',
    '#eab308',
    '#a78bfa',
    '#2dd4bf',
    '#fb923c',
    '#f87171',
];

const FILAS_MINI_TRAZA = 5;

/**
 * HTML del bloque de variables para incrustar en el modal de
 * "Entrada requerida (Leer)": chips con el valor actual de cada
 * variable + mini traza de las últimas capturas.
 */
export const construirHtmlVariablesEnModal = (
    estado: EstadoEjecucion | null,
    historial: EstadoEjecucion[],
    nombreSolicitado: string
): string => {
    const variables = estado?.variables ?? [];
    if (variables.length === 0) {
        return '';
    }

    const chips = variables
        .map((v, indice) => {
            const color = COLORES_FICHA[indice % COLORES_FICHA.length];
            const esSolicitada = v.nombre === nombreSolicitado;
            return `<span style="display:inline-block;margin:0 6px 4px 0;padding:2px 8px;border-radius:6px;background:${esSolicitada ? 'rgba(251,191,36,0.15)' : 'rgba(0,0,0,0.05)'};outline:1px solid ${esSolicitada ? '#f59e0b' : 'transparent'};font-family:monospace;font-size:12px;">
<b style="color:${color};">${v.nombre}</b> = ${v.valor}${esSolicitada ? '<i style="color:#b45309;font-size:11px;"> (a ingresar)</i>' : ''}
</span>`;
        })
        .join('');

    const bloques = `<div style="margin-top:10px;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
<div style="font-size:12px;font-weight:bold;color:#4b5563;margin-bottom:6px;">🔍 Variables en Ejecución <span style="color:#9ca3af;font-weight:500;font-size:11px;">(paso ${estado?.paso ?? 0})</span></div>
<div style="line-height:1.6;">${chips}</div>
</div>`;

    // Mini traza: últimas 5 filas
    const filas = historial.slice(-FILAS_MINI_TRAZA);
    if (filas.length === 0) {
        return bloques;
    }

    const nombres: string[] = [];
    const presentes = new Set<string>();
    for (const captura of [...historial.slice(-FILAS_MINI_TRAZA)]) {
        for (const v of captura.variables) {
            if (!presentes.has(v.nombre)) {
                presentes.add(v.nombre);
                nombres.push(v.nombre);
            }
        }
    }

    const celdas = (valores: Record<string, string>) =>
        nombres
            .map(
                (nombre) =>
                    `<td style="padding:2px 10px;font-family:monospace;font-size:12px;white-space:nowrap;color:${valores[nombre] === undefined ? '#cbd5e1' : '#1f2937'};">${valores[nombre] ?? '—'}</td>`
            )
            .join('');

    const filasHtml = filas
        .map((captura) => {
            const valores: Record<string, string> = {};
            for (const v of captura.variables) {
                valores[v.nombre] = v.valor;
            }
            return `<tr>${celdas(valores)}</tr>`;
        })
        .join('');

    const encabezados = nombres
        .map(
            (nombre, indice) =>
                `<th style="padding:2px 10px;font-family:monospace;font-size:12px;text-align:left;color:${COLORES_FICHA[indice % COLORES_FICHA.length]};">${nombre}</th>`
        )
        .join('');

    const tabla = `<div style="margin-top:8px;max-height:150px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;">
<table style="border-collapse:collapse;min-width:100%;">
<thead><tr style="background:#f3f4f6;">${encabezados}</tr></thead>
<tbody>${filasHtml}</tbody>
</table>
</div>
<div style="margin-top:4px;font-size:11px;color:#9ca3af;">Últimas ${filas.length} filas de la traza</div>`;

    return bloques + tabla;
};
