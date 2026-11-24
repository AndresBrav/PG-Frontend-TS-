import React from 'react';
import type { TransferenciaVariable } from './visualUtils';

interface PistaTransferenciaProps {
    transferencia: TransferenciaVariable;
    paso: number;
}

export const PistaTransferencia: React.FC<PistaTransferenciaProps> = ({
    transferencia,
    paso,
}) => {
    if (!transferencia.hayTransferencia) {
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
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45), rgba(15, 23, 42, 0.65))',
                border: '1px solid rgba(255, 157, 61, 0.35)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
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
                    <span>{formula ? formula : `${variableDestino} ← ${valorNuevo}`}</span>
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
                    padding: '16px 12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    minHeight: 88,
                }}
            >
                {/* 1. Ranura Destino (Receptora - Izquierda, como en a <- ...) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 88,
                        zIndex: 2,
                    }}
                >
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#4ADE80',
                            fontFamily: 'var(--mono)',
                        }}
                    >
                        DESTINO ({variableDestino})
                    </span>

                    <div
                        style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'rgba(74, 222, 128, 0.18)',
                            border: '1px solid #4ADE80',
                            color: '#4ADE80',
                            fontFamily: 'var(--mono)',
                            fontSize: 14,
                            fontWeight: 700,
                            animation: 'pulsoReceptor 0.8s ease-out 0.4s forwards',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 6,
                            boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)',
                        }}
                    >
                        <span>{valorNuevo}</span>
                        {valorPrevioDestino && valorPrevioDestino !== valorNuevo && (
                            <span
                                style={{
                                    fontSize: 10,
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
                        margin: '0 16px',
                        height: 48,
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
                            <span>⚡</span>
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

                {/* 3. Ranura Origen (Emisora - Derecha, como en ... <- b) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 88,
                        zIndex: 2,
                    }}
                >
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#94A3B8',
                            fontFamily: 'var(--mono)',
                        }}
                    >
                        {tipo === 'literal' ? 'VALOR' : `ORIGEN (${variableOrigen})`}
                    </span>

                    <div
                        style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            background:
                                tipo === 'literal'
                                    ? 'rgba(96, 165, 250, 0.15)'
                                    : 'rgba(251, 191, 36, 0.15)',
                            border: `1px solid ${
                                tipo === 'literal' ? '#60A5FA' : '#FBBF24'
                            }`,
                            color: tipo === 'literal' ? '#93C5FD' : '#FDE68A',
                            fontFamily: 'var(--mono)',
                            fontSize: 14,
                            fontWeight: 700,
                            boxShadow: `0 0 10px ${
                                tipo === 'literal'
                                    ? 'rgba(96, 165, 250, 0.3)'
                                    : 'rgba(251, 191, 36, 0.3)'
                            }`,
                        }}
                    >
                        {tipo === 'literal' ? valorNuevo : valorOrigen}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PistaTransferencia;
