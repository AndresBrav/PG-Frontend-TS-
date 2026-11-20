import React, { useMemo } from 'react';
import type { EstadoEjecucion } from '../compilador';
import {
    colorDeVariable,
    detectarComparacion,
    detectarPunterosArreglo,
    detectarSwapArreglo,
    detectarTransferenciaVariable,
    type PerfilVariable,
} from './visualUtils';
import PistaTransferencia from './PistaTransferencia';

interface SimulacionMovimientoProps {
    /** Perfiles de variables calculados sobre la traza histórica. */
    perfiles: PerfilVariable[];
    /** Captura del paso activo en reproducción o ejecución. */
    captura: EstadoEjecucion | null;
    /** Captura inmediatamente anterior para calcular deltas de movimiento. */
    anterior: EstadoEjecucion | null;
}

/** Formatea cualquier celda de forma legible. */
const formatoValor = (v: unknown): string => {
    if (v === undefined || v === null) return '—';
    if (typeof v === 'boolean') return v ? 'V' : 'F';
    return String(v);
};

export const SimulacionMovimiento: React.FC<SimulacionMovimientoProps> = ({
    perfiles,
    captura,
    anterior,
}) => {
    if (!captura) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 15px',
                    color: '#888',
                    gap: 8,
                    textAlign: 'center',
                }}
            >
                <span style={{ fontSize: 28 }}>🎬</span>
                <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>
                    Ejecuta tu algoritmo o pulsa <b>Paso a Paso</b> para ver la simulación gráfica en movimiento.
                </p>
                <span style={{ fontSize: 11, color: '#666' }}>
                    Ideal para algoritmos de ordenamiento (Burbuja, Selección) e intercambio de variables.
                </span>
            </div>
        );
    }

    // Mapa de valores anteriores
    const valoresAnteriores = useMemo(() => {
        const mapa = new Map<string, string>();
        if (anterior) {
            for (const v of anterior.variables) {
                mapa.set(v.nombre, v.valor);
            }
        }
        return mapa;
    }, [anterior]);

    // Instrucción actual y detección de comparación y transferencia
    const instruccionActual = captura.instruccion ?? '';
    const comparacion = useMemo(
        () => detectarComparacion(instruccionActual),
        [instruccionActual]
    );

    const transferencia = useMemo(
        () =>
            detectarTransferenciaVariable(
                instruccionActual,
                captura.variables,
                valoresAnteriores
            ),
        [instruccionActual, captura.variables, valoresAnteriores]
    );

    // Separamos las variables en arreglos y escalares
    const perfilesArreglos = useMemo(
        () => perfiles.filter((p) => p.tipo === 'arreglo'),
        [perfiles]
    );

    const variablesEscalares = useMemo(() => {
        return captura.variables.filter((v) => {
            const perfil = perfiles.find((p) => p.nombre === v.nombre);
            return !perfil || perfil.tipo !== 'arreglo';
        });
    }, [captura.variables, perfiles]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                paddingRight: 4,
            }}
        >
            {/* Banner de estado de la simulación */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#FF9D3D',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <span>🎬 Simulación en Paso {captura.paso}</span>
                        {captura.linea && (
                            <span
                                style={{
                                    fontSize: 10,
                                    background: 'rgba(255, 157, 61, 0.15)',
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    color: '#FBBF24',
                                }}
                            >
                                Línea {captura.linea}
                            </span>
                        )}
                    </span>

                    {comparacion.activa && (
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                background: 'rgba(129, 140, 248, 0.18)',
                                border: '1px solid rgba(129, 140, 248, 0.4)',
                                color: '#A5B4FC',
                                padding: '2px 8px',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            ⚖️ Comparando condición: <code>{comparacion.texto}</code>
                        </span>
                    )}
                </div>

                {instruccionActual && (
                    <div
                        style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 11,
                            color: 'var(--text)',
                            opacity: 0.85,
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        &gt; {instruccionActual}
                    </div>
                )}
            </div>

            {/* SECCIÓN 1: VISTA HÍBRIDA DE ARREGLOS (Barras + Tarjetas + Punteros) */}
            {perfilesArreglos.map((perfil) => {
                const textoActual = captura.variables.find(
                    (v) => v.nombre === perfil.nombre
                )?.valor;
                let elementosActuales: unknown[] = [];
                try {
                    if (textoActual?.startsWith('[')) {
                        const parsed = JSON.parse(textoActual);
                        if (Array.isArray(parsed)) elementosActuales = parsed;
                    }
                } catch {
                    elementosActuales = [];
                }

                // Elementos anteriores
                const textoAntes = valoresAnteriores.get(perfil.nombre);
                let elementosAntes: unknown[] | null = null;
                try {
                    if (textoAntes?.startsWith('[')) {
                        const parsed = JSON.parse(textoAntes);
                        if (Array.isArray(parsed)) elementosAntes = parsed;
                    }
                } catch {
                    elementosAntes = null;
                }

                // Detección de Swap
                const swapInfo = detectarSwapArreglo(elementosAntes, elementosActuales);

                // Detección de punteros sobre este arreglo
                const punteros = detectarPunterosArreglo(
                    captura.variables,
                    elementosActuales.length
                );

                // Valores numéricos para el cálculo de alturas
                const nums = elementosActuales.map((e) => {
                    const n = Number(e);
                    return Number.isNaN(n) ? 0 : n;
                });
                const maxNum = Math.max(...nums.map((n) => Math.abs(n)), 1);

                return (
                    <div
                        key={perfil.nombre}
                        style={{
                            background: 'rgba(0, 0, 0, 0.15)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 6,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: colorDeVariable(perfil.indice),
                                        fontFamily: 'var(--mono)',
                                    }}
                                >
                                    {perfil.nombre}[{elementosActuales.length}]
                                </span>
                                <span style={{ fontSize: 11, color: '#888' }}>
                                    (Modo Híbrido: Barras + Tarjetas + Punteros)
                                </span>
                            </div>

                            {swapInfo.haySwap && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        background: 'rgba(245, 158, 11, 0.2)',
                                        border: '1px solid #F59E0B',
                                        color: '#FBBF24',
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        animation: 'pulse 1.5s infinite',
                                    }}
                                >
                                    🔄 Swap detectado: {perfil.nombre}[{swapInfo.posA}] ⇄ {perfil.nombre}[{swapInfo.posB}]
                                </span>
                            )}
                        </div>

                        {elementosActuales.length === 0 ? (
                            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                                Arreglo vacío o aún no inicializado.
                            </p>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    overflowX: 'auto',
                                    padding: '24px 8px 12px 8px',
                                    minHeight: 180,
                                    position: 'relative',
                                }}
                            >
                                {elementosActuales.map((item, idx) => {
                                    const pos1Based = idx + 1;
                                    const esNumero = typeof item === 'number' || !Number.isNaN(Number(item));
                                    const numVal = esNumero ? Number(item) : 0;
                                    const ratio = Math.max(0.12, Math.min(1, Math.abs(numVal) / maxNum));
                                    const alturaBarra = Math.round(ratio * 105) + 15;

                                    const esParteDeSwap =
                                        swapInfo.haySwap &&
                                        (idx === swapInfo.indiceA || idx === swapInfo.indiceB);

                                    // Punteros activos que apuntan a esta celda
                                    const punterosEnCelda = punteros.filter(
                                        (p) => p.posicion1Based === pos1Based
                                    );

                                    // ¿Esta celda está en comparación condicional?
                                    const esComparada =
                                        comparacion.activa &&
                                        (punterosEnCelda.length > 0 ||
                                            comparacion.texto.includes(`[${pos1Based}]`));

                                    // Determinar color de la barra
                                    let barraBg = 'linear-gradient(180deg, #34D399, #059669)';
                                    let borderColor = 'rgba(52, 211, 153, 0.4)';
                                    let glow = 'none';

                                    if (esParteDeSwap) {
                                        barraBg = 'linear-gradient(180deg, #FBBF24, #D97706)';
                                        borderColor = '#F59E0B';
                                        glow = '0 0 14px rgba(245, 158, 11, 0.6)';
                                    } else if (esComparada) {
                                        barraBg = 'linear-gradient(180deg, #818CF8, #4F46E5)';
                                        borderColor = '#6366F1';
                                        glow = '0 0 12px rgba(99, 102, 241, 0.5)';
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 6,
                                                minWidth: 44,
                                                position: 'relative',
                                                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: esParteDeSwap ? 'scale(1.05) translateY(-4px)' : 'none',
                                            }}
                                        >
                                            {/* Barra vertical con altura proporcional */}
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: alturaBarra,
                                                    background: barraBg,
                                                    borderRadius: '6px 6px 2px 2px',
                                                    border: `1px solid ${borderColor}`,
                                                    boxShadow: glow,
                                                    transition: 'height 0.35s ease, background 0.3s ease, box-shadow 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'center',
                                                    paddingTop: 4,
                                                }}
                                            >
                                                {/* Mini icono o destello si hay swap o comparación */}
                                                {esParteDeSwap && (
                                                    <span style={{ fontSize: 10 }}>🔄</span>
                                                )}
                                                {!esParteDeSwap && esComparada && (
                                                    <span style={{ fontSize: 10 }}>⚖️</span>
                                                )}
                                            </div>

                                            {/* Tarjeta con el valor numérico */}
                                            <div
                                                style={{
                                                    minWidth: 38,
                                                    padding: '4px 6px',
                                                    borderRadius: 6,
                                                    background: esParteDeSwap
                                                        ? 'rgba(245, 158, 11, 0.18)'
                                                        : esComparada
                                                        ? 'rgba(99, 102, 241, 0.18)'
                                                        : 'rgba(255, 255, 255, 0.06)',
                                                    border: `1px solid ${borderColor}`,
                                                    textAlign: 'center',
                                                    fontFamily: 'var(--mono)',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: esParteDeSwap
                                                        ? '#FBBF24'
                                                        : esComparada
                                                        ? '#C7D2FE'
                                                        : 'var(--text)',
                                                    boxShadow: glow,
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                {formatoValor(item)}
                                            </div>

                                            {/* Índice 1-based (PSeInt) */}
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    color: '#9CA3AF',
                                                    fontFamily: 'var(--mono)',
                                                }}
                                            >
                                                [{pos1Based}]
                                            </div>

                                            {/* Punteros que apuntan a esta posición */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    minHeight: 28,
                                                    gap: 2,
                                                }}
                                            >
                                                {punterosEnCelda.map((ptr) => (
                                                    <div
                                                        key={ptr.variable}
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            animation: 'bounce 1s infinite',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                color: ptr.color,
                                                                fontSize: 10,
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            ▲
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: '#000',
                                                                background: ptr.color,
                                                                padding: '1px 5px',
                                                                borderRadius: 4,
                                                                whiteSpace: 'nowrap',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                            }}
                                                        >
                                                            {ptr.variable}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* SECCIÓN 2: SIMULACIÓN DE VARIABLES ESCALARES (Memoria, Asignaciones, Auxiliares) */}
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
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
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                        🧠 Memoria de Variables y Registros
                    </span>
                    <span style={{ fontSize: 10, color: '#888' }}>
                        Transformaciones directas (ej: a = 5, b = a + 3, aux)
                    </span>
                </div>

                {/* Pista de transferencia animada (vuelo físico de valores) */}
                {transferencia.hayTransferencia && (
                    <PistaTransferencia
                        transferencia={transferencia}
                        paso={captura.paso}
                    />
                )}

                {variablesEscalares.length === 0 ? (
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                        No hay variables simples activas.
                    </p>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: 10,
                        }}
                    >
                        {variablesEscalares.map((v, idx) => {
                            const valorPrevio = valoresAnteriores.get(v.nombre);
                            const haCambiado = anterior !== null && valorPrevio !== undefined && valorPrevio !== v.valor;
                            const esNuevo = anterior !== null && valorPrevio === undefined;
                            const color = colorDeVariable(idx);

                            const nombreNorm = v.nombre.toLowerCase();
                            const esEmisora =
                                transferencia.hayTransferencia &&
                                transferencia.variableOrigen?.toLowerCase() === nombreNorm;
                            const esReceptora =
                                transferencia.hayTransferencia &&
                                transferencia.variableDestino.toLowerCase() === nombreNorm;

                            const esAuxiliar = /^(aux|temp|temporal|buffer|swap)/i.test(v.nombre);

                            return (
                                <div
                                    key={v.nombre}
                                    style={{
                                        background: esReceptora
                                            ? 'rgba(74, 222, 128, 0.16)'
                                            : esEmisora
                                            ? 'rgba(251, 191, 36, 0.16)'
                                            : haCambiado
                                            ? 'rgba(74, 222, 128, 0.10)'
                                            : esNuevo
                                            ? 'rgba(96, 165, 250, 0.10)'
                                            : 'rgba(255, 255, 255, 0.04)',
                                        border: `1px solid ${
                                            esReceptora
                                                ? '#4ADE80'
                                                : esEmisora
                                                ? '#FBBF24'
                                                : haCambiado
                                                ? 'rgba(74, 222, 128, 0.5)'
                                                : esNuevo
                                                ? 'rgba(96, 165, 250, 0.5)'
                                                : 'var(--border)'
                                        }`,
                                        borderRadius: 8,
                                        padding: '8px 10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                        boxShadow: esReceptora
                                            ? '0 0 12px rgba(74, 222, 128, 0.45)'
                                            : esEmisora
                                            ? '0 0 12px rgba(251, 191, 36, 0.45)'
                                            : haCambiado
                                            ? '0 0 10px rgba(74, 222, 128, 0.25)'
                                            : 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 4,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: 'var(--mono)',
                                                fontWeight: 700,
                                                fontSize: 12,
                                                color: color,
                                            }}
                                        >
                                            {v.nombre}
                                        </span>

                                        {esAuxiliar && (
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    background: 'rgba(244, 114, 182, 0.2)',
                                                    color: '#F472B6',
                                                    padding: '1px 4px',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                aux
                                            </span>
                                        )}

                                        {esEmisora && (
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: '#FBBF24',
                                                    background: 'rgba(251, 191, 36, 0.2)',
                                                    padding: '1px 4px',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                📤 Emisor
                                            </span>
                                        )}

                                        {esReceptora && (
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: '#4ADE80',
                                                    background: 'rgba(74, 222, 128, 0.2)',
                                                    padding: '1px 4px',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                📥 Receptor
                                            </span>
                                        )}

                                        {!esReceptora && !esEmisora && haCambiado && (
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: '#4ADE80',
                                                    background: 'rgba(74, 222, 128, 0.2)',
                                                    padding: '1px 4px',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                ✎ modificado
                                            </span>
                                        )}
                                    </div>

                                    {/* Valor y transición */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            gap: 6,
                                            marginTop: 2,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: 'var(--mono)',
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: haCambiado ? '#4ADE80' : 'var(--text)',
                                            }}
                                        >
                                            {v.valor}
                                        </span>

                                        {haCambiado && valorPrevio && (
                                            <span
                                                style={{
                                                    fontFamily: 'var(--mono)',
                                                    fontSize: 11,
                                                    color: '#9CA3AF',
                                                    textDecoration: 'line-through',
                                                }}
                                                title={`Valor previo: ${valorPrevio}`}
                                            >
                                                {valorPrevio}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimulacionMovimiento;
