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
    /** Historial de ejecuciones hasta el paso activo. */
    historial?: EstadoEjecucion[];
    /** Velocidad actual del reproductor (1x, 2x, 4x, etc.). */
    velocidad?: number;
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
    historial,
    velocidad = 1,
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
                    Ejecuta tu algoritmo o pulsa <b>Paso a Paso</b> para ver la
                    simulación gráfica en movimiento.
                </p>
                <span style={{ fontSize: 11, color: '#666' }}>
                    Ideal para algoritmos de ordenamiento (Burbuja, Selección) e
                    intercambio de variables.
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
        () => detectarComparacion(instruccionActual, captura.variables),
        [instruccionActual, captura.variables]
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
                paddingRight: 6,
                paddingBottom: 32,
                width: '100%',
                boxSizing: 'border-box',
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

            {/* CONTENEDOR SPLIT RESPONSIVO: Gráficos 60% / Memoria 40% en laptops */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'stretch',
                }}
            >
                {/* COLUMNA IZQUIERDA (60%): VISTA HÍBRIDA DE ARREGLOS (Barras + Tarjetas + Punteros) */}
                {perfilesArreglos.length > 0 && (
                    <div
                        style={{
                            flex: '1.5 1 400px',
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
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

                            // Detección de Swap enriquecida (multipasos + contextual)
                            const swapInfo = detectarSwapArreglo(
                                elementosAntes,
                                elementosActuales,
                                perfil.nombre,
                                historial
                            );

                            // Detección de punteros legítimos sobre este arreglo (filtrando acumuladores como contador)
                            const punteros = detectarPunterosArreglo(
                                captura.variables,
                                elementosActuales.length,
                                perfil.nombre,
                                captura.iteraciones,
                                captura.instruccion
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
                                        height: '100%',
                                        boxSizing: 'border-box',
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
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
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
                                        </div>

                                        {swapInfo.haySwap && (() => {
                                            // Variable auxiliar (caso típico de burbuja: aux <- numeros[j])
                                            const variableAux = captura.variables.find((v) =>
                                                /^(aux|temp|temporal|buffer|swap)$/i.test(v.nombre)
                                            );

                                            // El valor que estaba originalmente en A proviene de aux, o del valor que pasó a B
                                            const valA = variableAux?.valor !== undefined
                                                ? variableAux.valor
                                                : (elementosActuales.length > swapInfo.indiceB
                                                    ? formatoValor(elementosActuales[swapInfo.indiceB])
                                                    : '?');

                                            // El valor que estaba originalmente en B es el que pasó a A
                                            const valB = elementosActuales.length > swapInfo.indiceA
                                                ? formatoValor(elementosActuales[swapInfo.indiceA])
                                                : '?';

                                            return (
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        background: 'rgba(245, 158, 11, 0.18)',
                                                        border: '1px solid #F59E0B',
                                                        color: '#FBBF24',
                                                        padding: '4px 10px',
                                                        borderRadius: 6,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        boxShadow: '0 0 14px rgba(245, 158, 11, 0.45)',
                                                    }}
                                                >
                                                    <span>🔄</span>
                                                    <span style={{ fontFamily: 'var(--mono)' }}>
                                                        {perfil.nombre}[{swapInfo.posA}]
                                                    </span>
                                                    <span style={{ color: '#EF4444', fontWeight: 900 }}>
                                                        ({valA})
                                                    </span>
                                                    <span style={{ color: '#94A3B8' }}>⇄</span>
                                                    <span style={{ fontFamily: 'var(--mono)' }}>
                                                        {perfil.nombre}[{swapInfo.posB}]
                                                    </span>
                                                    <span style={{ color: '#60A5FA', fontWeight: 900 }}>
                                                        ({valB})
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {elementosActuales.length === 0 ? (
                                        <p
                                            style={{
                                                fontSize: 11,
                                                color: '#888',
                                                margin: 0,
                                            }}
                                        >
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
                                                padding: '24px 6px 12px 6px',
                                                minHeight: 155,
                                                position: 'relative',
                                            }}
                                        >
                                            {/* Keyframes para el salto en arco parabólico estilo AlgoLab */}
                                            <style>{`
                                                @keyframes saltoArcoSuperior {
                                                    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
                                                    30%  { transform: translate(calc(var(--delta-x) * 0.3), -58px) scale(1.2); box-shadow: 0 16px 28px rgba(245,158,11,0.7); opacity: 1; }
                                                    60%  { transform: translate(calc(var(--delta-x) * 0.65), -50px) scale(1.1); opacity: 1; }
                                                    85%  { transform: translate(calc(var(--delta-x) * 0.92), -8px) scale(1.03); opacity: 1; }
                                                    100% { transform: translate(var(--delta-x), 0) scale(1); opacity: 0; }
                                                }
                                                @keyframes saltoArcoInferior {
                                                    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
                                                    30%  { transform: translate(calc(var(--delta-x) * 0.3), 15px) scale(0.88); opacity: 0.88; }
                                                    60%  { transform: translate(calc(var(--delta-x) * 0.65), 11px) scale(0.93); opacity: 0.94; }
                                                    85%  { transform: translate(calc(var(--delta-x) * 0.92), 3px) scale(0.98); opacity: 0.98; }
                                                    100% { transform: translate(var(--delta-x), 0) scale(1); opacity: 0; }
                                                }
                                            `}</style>

                                            {elementosActuales.map((item, idx) => {
                                                const pos1Based = idx + 1;

                                                // Cálculo de swap en arco
                                                const esSwapA = swapInfo.haySwap && idx === swapInfo.indiceA;
                                                const esSwapB = swapInfo.haySwap && idx === swapInfo.indiceB;
                                                const esParteDeSwap = esSwapA || esSwapB;

                                                // Variable auxiliar para intercambio de variables (ej: aux <- numeros[j])
                                                const variableAux = captura.variables.find((v) =>
                                                    /^(aux|temp|temporal|buffer|swap)$/i.test(v.nombre)
                                                );

                                                // Para la animación de swap: el valor que estaba en A es aux (o lo que ahora está en B).
                                                // El valor que estaba en B es lo que ahora está en A.
                                                let itemVisual: unknown = item;
                                                if (esSwapA) {
                                                    itemVisual = variableAux?.valor !== undefined
                                                        ? variableAux.valor
                                                        : (elementosActuales.length > swapInfo.indiceB ? elementosActuales[swapInfo.indiceB] : item);
                                                } else if (esSwapB) {
                                                    itemVisual = elementosActuales.length > swapInfo.indiceA
                                                        ? elementosActuales[swapInfo.indiceA]
                                                        : item;
                                                }

                                                // Altura de la barra animada que vuela en arco
                                                const numVisual = !Number.isNaN(Number(itemVisual)) ? Number(itemVisual) : 0;
                                                const ratioVisual = Math.max(0.12, Math.min(1, Math.abs(numVisual) / maxNum));
                                                const alturaBarraAnimada = Math.round(ratioVisual * 75) + 12;

                                                // Altura de la barra base con el valor final
                                                const numActual = typeof item === 'number' || !Number.isNaN(Number(item))
                                                    ? Number(item) : 0;
                                                const ratioActual = Math.max(0.12, Math.min(1, Math.abs(numActual) / maxNum));
                                                const alturaBarraBase = Math.round(ratioActual * 75) + 12;

                                                // Duración adaptativa a la velocidad del reproductor
                                                const duracionSwapMs = Math.max(
                                                    220,
                                                    Math.round(750 / Math.max(0.25, velocidad))
                                                );

                                                // Distancia entre ranuras (pitch de 34px ancho + 8px gap = 42px)
                                                const PITCH_RANURA = 42;
                                                let deltaXPixels = 0;
                                                let animacionSwap = 'none';

                                                if (esSwapA) {
                                                    const distancia = (swapInfo.indiceB - swapInfo.indiceA);
                                                    deltaXPixels = distancia * PITCH_RANURA;
                                                    animacionSwap = `saltoArcoSuperior ${duracionSwapMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                                                } else if (esSwapB) {
                                                    const distancia = (swapInfo.indiceA - swapInfo.indiceB);
                                                    deltaXPixels = distancia * PITCH_RANURA;
                                                    animacionSwap = `saltoArcoInferior ${duracionSwapMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                                                }

                                                // Punteros activos que apuntan a esta celda
                                                const punterosEnCelda = punteros.filter(
                                                    (p) => p.posicion1Based === pos1Based
                                                );

                                                // ¿Esta celda está en comparación condicional sobre ESTE arreglo?
                                                const indicesComparados =
                                                    comparacion.indicesComparadosPorArreglo?.[
                                                        perfil.nombre.toLowerCase()
                                                    ] ?? [];
                                                const esComparada =
                                                    comparacion.activa &&
                                                    indicesComparados.includes(pos1Based);

                                                // ¿El arreglo ya está en su fase final ordenada?
                                                const esArregloOrdenado =
                                                    nums.length >= 2 &&
                                                    nums.every(
                                                        (val, i) => i === 0 || nums[i - 1] <= val
                                                    ) &&
                                                    (instruccionActual.toLowerCase().includes('escribir') ||
                                                        instruccionActual.toLowerCase().includes('ordenado') ||
                                                        captura.paso > 15);

                                                // Determinar color de la barra (Paleta semántica de referencia)
                                                let barraBg =
                                                    'linear-gradient(180deg, #64748B, #334155)'; // Normal / En espera (Slate)
                                                let borderColor = 'rgba(148, 163, 184, 0.35)';
                                                let glow = 'none';

                                                if (esParteDeSwap) {
                                                    barraBg =
                                                        'linear-gradient(180deg, #FBBF24, #EF4444)'; // Intercambiando (Fuego/AlgoLab)
                                                    borderColor = '#F59E0B';
                                                    glow =
                                                        '0 0 14px rgba(245, 158, 11, 0.7)';
                                                } else if (esComparada) {
                                                    barraBg =
                                                        'linear-gradient(180deg, #FCD34D, #F59E0B)'; // Comparando (Ámbar)
                                                    borderColor = '#D97706';
                                                    glow =
                                                        '0 0 12px rgba(245, 158, 11, 0.55)';
                                                } else if (esArregloOrdenado) {
                                                    barraBg =
                                                        'linear-gradient(180deg, #4ADE80, #16A34A)'; // Ordenado (Verde)
                                                    borderColor = '#22C55E';
                                                    glow =
                                                        '0 0 10px rgba(34, 197, 94, 0.45)';
                                                }

                                                return (
                                                    <div
                                                        key={`${idx}-${captura.paso}`}
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            minWidth: 34,
                                                            width: 34,
                                                            position: 'relative',
                                                            zIndex: esSwapA ? 30 : esSwapB ? 8 : 1,
                                                        }}
                                                    >
                                                        {/* CAPA BASE: valor final (ya intercambiado), siempre presente */}
                                                        {/* Barra vertical con altura proporcional */}
                                                        <div
                                                            style={{
                                                                width: 24,
                                                                height: alturaBarraBase,
                                                                background: barraBg,
                                                                borderRadius: '5px 5px 2px 2px',
                                                                border: `1px solid ${borderColor}`,
                                                                boxShadow: glow,
                                                                transition: 'height 0.35s ease, background 0.25s ease, box-shadow 0.25s ease',
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                justifyContent: 'center',
                                                                paddingTop: 3,
                                                            }}
                                                        >
                                                            {esParteDeSwap && (
                                                                <span style={{ fontSize: 9 }}>🔄</span>
                                                            )}
                                                            {!esParteDeSwap && esComparada && (
                                                                <span style={{ fontSize: 9 }}>⚖️</span>
                                                            )}
                                                            {!esParteDeSwap && !esComparada && esArregloOrdenado && (
                                                                <span style={{ fontSize: 9 }}>✓</span>
                                                            )}
                                                        </div>

                                                        {/* Tarjeta con el valor final */}
                                                        <div
                                                            style={{
                                                                minWidth: 32,
                                                                padding: '3px 4px',
                                                                borderRadius: 5,
                                                                background: esParteDeSwap
                                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                                    : esComparada
                                                                      ? 'rgba(245, 158, 11, 0.2)'
                                                                      : esArregloOrdenado
                                                                        ? 'rgba(34, 197, 94, 0.18)'
                                                                        : 'rgba(255, 255, 255, 0.05)',
                                                                border: `1px solid ${borderColor}`,
                                                                textAlign: 'center',
                                                                fontFamily: 'var(--mono)',
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: esParteDeSwap
                                                                    ? '#FBBF24'
                                                                    : esComparada
                                                                      ? '#FCD34D'
                                                                      : esArregloOrdenado
                                                                        ? '#4ADE80'
                                                                        : 'var(--text)',
                                                                boxShadow: glow,
                                                                transition: 'all 0.25s ease',
                                                            }}
                                                        >
                                                            {formatoValor(item)}
                                                        </div>

                                                        {/* Índice 1-based (PSeInt) */}
                                                        <div
                                                            style={{
                                                                fontSize: 9,
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
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minHeight: 24,
                                                                gap: 3,
                                                                flexWrap: 'wrap',
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
                                                                            fontSize: 12,
                                                                            lineHeight: 1,
                                                                        }}
                                                                    >
                                                                        ▲
                                                                    </span>
                                                                    <span
                                                                        style={{
                                                                            fontSize: 11,
                                                                            fontWeight: 800,
                                                                            color: '#000',
                                                                            background: ptr.color,
                                                                            padding: '2px 6px',
                                                                            borderRadius: 4,
                                                                            whiteSpace: 'nowrap',
                                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                                                                        }}
                                                                    >
                                                                        {ptr.variable}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* CAPA ANIMADA: valor previo que vuela hacia el destino del swap */}
                                                        {esParteDeSwap && (
                                                            <div
                                                                style={
                                                                    {
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '100%',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: 4,
                                                                        animation: animacionSwap,
                                                                        pointerEvents: 'none',
                                                                        '--delta-x': `${deltaXPixels}px`,
                                                                    } as React.CSSProperties
                                                                }
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: 24,
                                                                        height: alturaBarraAnimada,
                                                                        background: 'linear-gradient(180deg, #FBBF24, #EF4444)',
                                                                        borderRadius: '5px 5px 2px 2px',
                                                                        border: '1px solid #F59E0B',
                                                                        boxShadow: '0 0 18px rgba(245, 158, 11, 0.8)',
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        justifyContent: 'center',
                                                                        paddingTop: 3,
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: 9 }}>🔄</span>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        minWidth: 32,
                                                                        padding: '3px 4px',
                                                                        borderRadius: 5,
                                                                        background: 'rgba(239, 68, 68, 0.3)',
                                                                        border: '1px solid #F59E0B',
                                                                        textAlign: 'center',
                                                                        fontFamily: 'var(--mono)',
                                                                        fontSize: 11,
                                                                        fontWeight: 700,
                                                                        color: '#FBBF24',
                                                                        boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
                                                                    }}
                                                                >
                                                                    {formatoValor(itemVisual)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Leyenda Semántica Estilo Visualizador de Referencia */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 12,
                                            fontSize: 10,
                                            color: '#94A3B8',
                                            paddingTop: 6,
                                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <i
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 2,
                                                    background: '#F59E0B',
                                                    display: 'inline-block',
                                                }}
                                            />
                                            Comparando
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <i
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 2,
                                                    background: '#EF4444',
                                                    display: 'inline-block',
                                                }}
                                            />
                                            Intercambiando
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <i
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 2,
                                                    background: '#22C55E',
                                                    display: 'inline-block',
                                                }}
                                            />
                                            Ordenado
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <i
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 2,
                                                    background: '#475569',
                                                    display: 'inline-block',
                                                }}
                                            />
                                            En espera
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* COLUMNA DERECHA (40%): SIMULACIÓN DE VARIABLES ESCALARES (Memoria, Asignaciones, Auxiliares) */}
                <div
                    style={{
                        flex: perfilesArreglos.length > 0 ? '1 1 260px' : '1 1 100%',
                        minWidth: 0,
                        background: 'rgba(0, 0, 0, 0.15)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        boxSizing: 'border-box',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: 'var(--text)',
                            }}
                        >
                            🧠 Memoria de Variables y Registros
                        </span>
                        <span style={{ fontSize: 11, color: '#888' }}>
                            (aux, iteradores, límites)
                        </span>
                    </div>

                    {variablesEscalares.length === 0 ? (
                        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                            No hay variables simples activas.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(min(100%, 88px), 1fr))',
                                gap: 5,
                            }}
                        >
                            {variablesEscalares.map((v, idx) => {
                                const valorPrevio = valoresAnteriores.get(v.nombre);
                                const haCambiado =
                                    anterior !== null &&
                                    valorPrevio !== undefined &&
                                    valorPrevio !== v.valor;
                                const esNuevo =
                                    anterior !== null && valorPrevio === undefined;
                                const color = colorDeVariable(idx);

                                const nombreNorm = v.nombre.toLowerCase();
                                const esEmisora = Boolean(
                                    transferencia.hayTransferencia && (
                                        transferencia.variableOrigen?.toLowerCase() === nombreNorm ||
                                        transferencia.variablesOrigen?.some(
                                            (orig) => orig.toLowerCase() === nombreNorm
                                        )
                                    )
                                );
                                const esReceptora = Boolean(
                                    transferencia.hayTransferencia &&
                                    transferencia.variableDestino.toLowerCase() === nombreNorm
                                );

                                const esAuxiliar =
                                    /^(aux|temp|temporal|buffer|swap)/i.test(
                                        v.nombre
                                    );
                                const esTamanio =
                                    /^(n|tam|tamano|longitud|len|max)/i.test(
                                        v.nombre
                                    );
                                const numEntero = parseInt(v.valor, 10);
                                const esNumeroEntero =
                                    !Number.isNaN(numEntero) && String(numEntero) === v.valor;

                                // Acompañamiento matemático de índices hacia el arreglo activo
                                let acompanamientoArr: {
                                    arrNombre: string;
                                    valActual: string | null;
                                    sigVal: string | null;
                                    posSig: number;
                                } | null = null;

                                if (
                                    esNumeroEntero &&
                                    !esAuxiliar &&
                                    !esTamanio &&
                                    perfilesArreglos.length > 0
                                ) {
                                    for (const pa of perfilesArreglos) {
                                        const textoArr = captura.variables.find(
                                            (x) => x.nombre.toLowerCase() === pa.nombre.toLowerCase()
                                        )?.valor;
                                        if (textoArr && textoArr.startsWith('[')) {
                                            try {
                                                const parsed = JSON.parse(textoArr);
                                                if (
                                                    Array.isArray(parsed) &&
                                                    numEntero >= 1 &&
                                                    numEntero <= parsed.length
                                                ) {
                                                    const elemActual = parsed[numEntero - 1];
                                                    const elemSig =
                                                        numEntero < parsed.length
                                                            ? parsed[numEntero]
                                                            : null;
                                                    acompanamientoArr = {
                                                        arrNombre: pa.nombre,
                                                        valActual:
                                                            elemActual !== undefined
                                                                ? String(elemActual)
                                                                : null,
                                                        sigVal:
                                                            elemSig !== undefined && elemSig !== null
                                                                ? String(elemSig)
                                                                : null,
                                                        posSig: numEntero + 1,
                                                    };
                                                    break;
                                                }
                                            } catch {
                                                /* ignore */
                                            }
                                        }
                                    }
                                }

                                return (
                                    <div
                                        key={v.nombre}
                                        style={{
                                            minWidth: 0,
                                            boxSizing: 'border-box',
                                            background: esReceptora
                                                ? 'rgba(74, 222, 128, 0.18)'
                                                : esEmisora
                                                  ? 'rgba(251, 191, 36, 0.18)'
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
                                            borderRadius: 6,
                                            padding: '3px 6px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            boxShadow: esReceptora
                                                ? '0 0 10px rgba(74, 222, 128, 0.45)'
                                                : esEmisora
                                                  ? '0 0 10px rgba(251, 191, 36, 0.45)'
                                                  : 'none',
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 3,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--mono)',
                                                        fontWeight: 700,
                                                        fontSize: 12,
                                                        color: esReceptora
                                                            ? '#4ADE80'
                                                            : esEmisora
                                                              ? '#FBBF24'
                                                              : color,
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
                                                            borderRadius: 3,
                                                        }}
                                                    >
                                                        aux
                                                    </span>
                                                )}
                                                {esTamanio && (
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            fontWeight: 600,
                                                            background: 'rgba(148, 163, 184, 0.2)',
                                                            color: '#94A3B8',
                                                            padding: '1px 4px',
                                                            borderRadius: 3,
                                                        }}
                                                    >
                                                        límite
                                                    </span>
                                                )}
                                            </div>

                                            {esReceptora ? (
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        color: '#4ADE80',
                                                        background: 'rgba(74, 222, 128, 0.25)',
                                                        padding: '1px 4px',
                                                        borderRadius: 3,
                                                    }}
                                                    title="Variable recibiendo el resultado de la asignación"
                                                >
                                                    ← dest
                                                </span>
                                            ) : esEmisora ? (
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        color: '#FBBF24',
                                                        background: 'rgba(251, 191, 36, 0.25)',
                                                        padding: '1px 4px',
                                                        borderRadius: 3,
                                                    }}
                                                    title="Variable aportando valor para la asignación"
                                                >
                                                    orig
                                                </span>
                                            ) : haCambiado ? (
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        color: '#4ADE80',
                                                        background: 'rgba(74, 222, 128, 0.2)',
                                                        padding: '1px 4px',
                                                        borderRadius: 3,
                                                    }}
                                                >
                                                    ✎ mod
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Fila de Valor actual y transición */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                gap: 4,
                                                minWidth: 0,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: 'var(--mono)',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    minWidth: 0,
                                                    maxWidth: '100%',
                                                    overflowWrap: 'anywhere',
                                                    color: esReceptora
                                                        ? '#4ADE80'
                                                        : esEmisora
                                                          ? '#FBBF24'
                                                          : haCambiado
                                                            ? '#4ADE80'
                                                            : 'var(--text)',
                                                }}
                                            >
                                                {v.valor}
                                            </span>

                                            {haCambiado && valorPrevio && (
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--mono)',
                                                        fontSize: 9,
                                                        maxWidth: '100%',
                                                        overflowWrap: 'anywhere',
                                                        color: '#9CA3AF',
                                                        textDecoration: 'line-through',
                                                    }}
                                                    title={`Previo: ${valorPrevio}`}
                                                >
                                                    {valorPrevio}
                                                </span>
                                            )}
                                        </div>

                                        {/* Acompañamiento explícito para variables índice que apuntan a celdas */}
                                        {acompanamientoArr && (
                                            <div
                                                style={{
                                                    marginTop: 1,
                                                    paddingTop: 2,
                                                    borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                                                    fontSize: 9,
                                                    fontFamily: 'var(--mono)',
                                                    color: '#E2E8F0',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <span style={{ color: '#FBBF24' }}>↳</span>
                                                    <span style={{ opacity: 0.75 }}>
                                                        {acompanamientoArr.arrNombre}[{v.nombre}]=
                                                    </span>
                                                    <b style={{ color: '#60A5FA' }}>
                                                        {acompanamientoArr.valActual ?? '—'}
                                                    </b>
                                                </div>
                                                {acompanamientoArr.sigVal !== null && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <span style={{ color: '#94A3B8' }}>↳</span>
                                                        <span style={{ opacity: 0.65 }}>
                                                            {acompanamientoArr.arrNombre}[{v.nombre}+1]=
                                                        </span>
                                                        <b style={{ color: '#A78BFA' }}>
                                                            {acompanamientoArr.sigVal}
                                                        </b>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN INFERIOR: CARD UNIFICADO DE OPERACIÓN (EVALUACIÓN O TRANSFERENCIA) */}
            {(transferencia.hayTransferencia || comparacion.activa) && (
                <PistaTransferencia
                    transferencia={transferencia}
                    comparacion={comparacion}
                    instruccion={instruccionActual}
                    paso={captura.paso}
                />
            )}
        </div>
    );
};

export default SimulacionMovimiento;
