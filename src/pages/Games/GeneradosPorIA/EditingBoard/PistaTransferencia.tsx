import React from 'react';
import type { ComparacionActiva, TransferenciaVariable } from './visualUtils';

interface PistaTransferenciaProps {
    transferencia?: TransferenciaVariable | null;
    comparacion?: ComparacionActiva | null;
    instruccion?: string;
    paso: number;
}

export const PistaTransferencia: React.FC<PistaTransferenciaProps> = ({
    transferencia,
    comparacion,
    instruccion,
    paso,
}) => {
    const hayTransferencia = Boolean(transferencia?.hayTransferencia);
    const hayComparacion = Boolean(comparacion?.activa);

    if (!hayTransferencia && !hayComparacion) {
        return null;
    }

    // SI ES COMPARACIÓN LÓGICA (Si, Mientras, etc.) Y NO HAY TRANSFERENCIA EN EL MISMO PASO
    if (hayComparacion && !hayTransferencia && comparacion) {
        return (
            <div
                key={`pista-comp-${paso}`}
                style={{
                    background:
                        'linear-gradient(135deg, rgba(30, 41, 59, 0.55), rgba(15, 23, 42, 0.75))',
                    border: '1px solid rgba(129, 140, 248, 0.45)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Cabecera */}
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
                        <span style={{ fontSize: 14 }}>⚖️</span>
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#A5B4FC',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            Evaluación de Condición (Comparación Lógica)
                        </span>
                    </div>

                    <div
                        style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 12,
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '2px 8px',
                            borderRadius: 6,
                            color: '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <span>Condición:</span>
                        <span style={{ color: '#FCD34D', fontWeight: 700 }}>
                            {comparacion.texto}
                        </span>
                    </div>
                </div>

                {/* Cuerpo de evaluación */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        gap: 12,
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 6,
                        padding: '10px 14px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                            Expresión evaluada:
                        </span>
                        <code
                            style={{
                                fontFamily: 'var(--mono)',
                                fontSize: 14,
                                color: '#FCD34D',
                                fontWeight: 700,
                            }}
                        >
                            {comparacion.texto}
                        </code>
                    </div>

                    {comparacion.textoDesglosado && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>
                                Sustitución de valores:
                            </span>
                            <div
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 14,
                                    color: '#60A5FA',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <span>📐</span>
                                <span>{comparacion.textoDesglosado}</span>
                            </div>
                        </div>
                    )}

                    {instruccion && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>
                                Instrucción activa:
                            </span>
                            <span
                                style={{
                                    fontFamily: 'var(--mono)',
                                    fontSize: 12,
                                    color: '#E2E8F0',
                                }}
                            >
                                {instruccion}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!transferencia) {
        return null;
    }

    const {
        tipo,
        variableDestino,
        valorNuevo,
        valorPrevioDestino,
        variableOrigen,
        valorOrigen,
        formula,
        operacionVisual,
    } = transferencia;

    return (
        <div
            key={`pista-${paso}-${variableDestino}`}
            style={{
                background:
                    'linear-gradient(135deg, rgba(30, 41, 59, 0.45), rgba(15, 23, 42, 0.65))',
                border: '1px solid rgba(255, 157, 61, 0.35)',
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
            }}
        >
            {/* Animación keyframes: flujo hacia la izquierda (destino <- origen como en PSeInt) */}
            <style>{`
                @keyframes vueloHaciaDestino {
                    0% {
                        left: 85%;
                        transform: translateY(-50%) scale(0.85);
                        opacity: 0.3;
                    }
                    40% {
                        transform: translateY(-50%) scale(1.15);
                        opacity: 1;
                        box-shadow: 0 0 16px rgba(255, 157, 61, 0.8);
                    }
                    80% {
                        left: 12%;
                        transform: translateY(-50%) scale(1.05);
                        opacity: 1;
                    }
                    100% {
                        left: 10%;
                        transform: translateY(-50%) scale(1);
                        opacity: 0;
                    }
                }
                @keyframes pulsoReceptor {
                    0% { transform: scale(0.97); }
                    60% { transform: scale(1.06); box-shadow: 0 0 14px rgba(74, 222, 128, 0.6); }
                    100% { transform: scale(1); }
                }
                @keyframes caidaLiteral {
                    0% {
                        transform: translateY(-22px) scale(0.7);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(4px) scale(1.1);
                        opacity: 1;
                        box-shadow: 0 0 14px rgba(96, 165, 250, 0.6);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Cabecera del tipo de movimiento */}
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
                    <span style={{ fontSize: 13 }}>
                        {tipo === 'literal'
                            ? '📥'
                            : tipo === 'directa'
                              ? '🔄'
                              : '⚡'}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                                tipo === 'literal'
                                    ? '#60A5FA'
                                    : tipo === 'directa'
                                      ? '#FBBF24'
                                      : '#A78BFA',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {tipo === 'literal'
                            ? 'Asignación de Valor Constante'
                            : tipo === 'directa'
                              ? 'Transferencia Directa de Memoria (Destino ← Origen)'
                              : 'Cálculo Matemático y Asignación (Destino ← Operación)'}
                    </span>
                </div>

                <div
                    style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        color: '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}
                >
                    <span>
                        {formula
                            ? formula
                            : `${variableDestino} ← ${valorNuevo}`}
                    </span>
                </div>
            </div>

            {/* Desglose matemático riguroso para operaciones con celdas de arreglos */}
            {transferencia.desgloseMatematico && (
                <div
                    style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontFamily: 'var(--mono)',
                        color: '#FCD34D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600,
                    }}
                >
                    <span>📐 Desglose de subíndices:</span>
                    <span>{transferencia.desgloseMatematico}</span>
                </div>
            )}

            {/* Escenario PSeInt: DESTINO (Izq) ◀────── ORIGEN (Der) */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    padding: '10px 10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    minHeight: 70,
                }}
            >
                {/* 1. Ranura Destino (Receptora - Izquierda, como en a <- ...) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        minWidth: 78,
                        zIndex: 2,
                    }}
                >
                    <span
                        style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#4ADE80',
                            fontFamily: 'var(--mono)',
                        }}
                    >
                        DESTINO ({variableDestino})
                    </span>

                    <div
                        style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'rgba(74, 222, 128, 0.18)',
                            border: '1px solid #4ADE80',
                            color: '#4ADE80',
                            fontFamily: 'var(--mono)',
                            fontSize: 13,
                            fontWeight: 700,
                            animation:
                                'pulsoReceptor 0.8s ease-out 0.4s forwards',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 5,
                            boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)',
                        }}
                    >
                        <span>{valorNuevo}</span>
                        {valorPrevioDestino &&
                            valorPrevioDestino !== valorNuevo && (
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: '#9CA3AF',
                                        textDecoration: 'line-through',
                                        opacity: 0.7,
                                    }}
                                >
                                    {valorPrevioDestino}
                                </span>
                            )}
                    </div>
                </div>

                {/* 2. Riel Central de Vuelo (Flujo hacia la Izquierda ◀────) */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        margin: '0 12px',
                        height: 38,
                    }}
                >
                    {/* Flecha indicadora de dirección PSeInt (<-) */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#4ADE80',
                            fontSize: 16,
                            fontWeight: 800,
                            zIndex: 1,
                        }}
                    >
                        ◀
                    </div>

                    {/* Línea guía punteada / riel que apunta a la izquierda */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 12,
                            right: 0,
                            height: 2,
                            background:
                                'linear-gradient(270deg, rgba(251,191,36,0.3), rgba(74,222,128,0.6))',
                            zIndex: 1,
                        }}
                    />

                    {/* Cápsula de cálculo (si aplica) */}
                    {tipo === 'calculo' && (
                        <div
                            style={{
                                zIndex: 2,
                                background: 'rgba(167, 139, 250, 0.25)',
                                border: '1px solid #A78BFA',
                                borderRadius: 16,
                                padding: '3px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                color: '#DDD6FE',
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: 'var(--mono)',
                                boxShadow: '0 0 12px rgba(167, 139, 250, 0.4)',
                            }}
                        >
                            <span>{operacionVisual}</span>
                        </div>
                    )}

                    {/* Ficha volante animada que vuela de derecha a izquierda */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            zIndex: 3,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background:
                                tipo === 'calculo'
                                    ? '#A78BFA'
                                    : tipo === 'directa'
                                      ? '#FBBF24'
                                      : '#60A5FA',
                            color: '#000',
                            fontWeight: 800,
                            fontFamily: 'var(--mono)',
                            fontSize: 12,
                            animation:
                                tipo === 'literal'
                                    ? 'caidaLiteral 0.6s ease-out forwards'
                                    : 'vueloHaciaDestino 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                            pointerEvents: 'none',
                        }}
                    >
                        {valorNuevo}
                    </div>
                </div>

                {/* 3. Ranuras Origen (Emisoras - Derecha) */}
                {tipo === 'literal' ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            minWidth: 78,
                            zIndex: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: '#94A3B8',
                                fontFamily: 'var(--mono)',
                            }}
                        >
                            VALOR
                        </span>

                        <div
                            style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: 'rgba(96, 165, 250, 0.15)',
                                border: '1px solid #60A5FA',
                                color: '#93C5FD',
                                fontFamily: 'var(--mono)',
                                fontSize: 13,
                                fontWeight: 700,
                                boxShadow: '0 0 10px rgba(96, 165, 250, 0.3)',
                            }}
                        >
                            {valorNuevo}
                        </div>
                    </div>
                ) : transferencia.origenesDetalle &&
                  transferencia.origenesDetalle.length > 1 ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            zIndex: 2,
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {transferencia.origenesDetalle.map((orig) => (
                            <div
                                key={orig.nombre}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 3,
                                    minWidth: 50,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        color: '#FBBF24',
                                        fontFamily: 'var(--mono)',
                                    }}
                                >
                                    ORIGEN ({orig.nombre})
                                </span>

                                <div
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        background: 'rgba(251, 191, 36, 0.15)',
                                        border: '1px solid #FBBF24',
                                        color: '#FDE68A',
                                        fontFamily: 'var(--mono)',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        boxShadow:
                                            '0 0 10px rgba(251, 191, 36, 0.3)',
                                    }}
                                >
                                    {orig.valor}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            minWidth: 78,
                            zIndex: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: '#94A3B8',
                                fontFamily: 'var(--mono)',
                            }}
                        >
                            ORIGEN ({variableOrigen})
                        </span>

                        <div
                            style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                background: 'rgba(251, 191, 36, 0.15)',
                                border: '1px solid #FBBF24',
                                color: '#FDE68A',
                                fontFamily: 'var(--mono)',
                                fontSize: 13,
                                fontWeight: 700,
                                boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
                            }}
                        >
                            {valorOrigen}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PistaTransferencia;
