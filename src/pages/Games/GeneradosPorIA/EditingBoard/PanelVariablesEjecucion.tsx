import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { EstadoEjecucion, VariableEstado } from './pseintCompiler';
import { perfilesDe } from './visualUtils';
import { colorDeVariable } from './visualUtils';
import GraficaEvolucion from './GraficaEvolucion';
import BarrasEjecucion from './BarrasEjecucion';
import ArregloCasillas from './ArregloCasillas';
import ReproductorEjecucion from './ReproductorEjecucion';

interface PanelVariablesEjecucionProps {
    /** Captura más reciente de las variables (null si aún no se ejecuta). */
    estado: EstadoEjecucion | null;
    /** Traza histórica de capturas (más antigua primero). */
    historial: EstadoEjecucion[];
    /** true mientras corre el pseudocódigo. */
    enEjecucion: boolean;
    /** Notifica la línea de pseudocódigo asociada a la vista actual (para el resalta del editor). */
    onLineaActiva?: (linea: number | null) => void;
}

type TabVisual = 'tabla' | 'evolucion' | 'barras' | 'arreglos';

const TABS: { id: TabVisual; etiqueta: string; titulo: string }[] = [
    { id: 'tabla', etiqueta: '📋 Tabla', titulo: 'chips y traza tipo PSeInt' },
    { id: 'evolucion', etiqueta: '📈 Evolución', titulo: 'cómo cambia cada variable en el tiempo' },
    { id: 'barras', etiqueta: '📊 Barras', titulo: 'variables numéricas contra una escala común' },
    { id: 'arreglos', etiqueta: '🧮 Arreglos', titulo: 'Dimension dibujado en casillas' },
];

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

const colorDe = (indice: number) =>
    coloresVariable[indice % coloresVariable.length];

/**
 * Panel de la ejecución, con vista de película: pestañas de tabla tipo
 * PSeInt, evolution SVG, barras animadas y arreglos en casillas, más un
 * reproductor para rebobinar/reproducir la traza a cualquier paso.
 */
const PanelVariablesEjecucion = ({
    estado,
    historial,
    enEjecucion,
    onLineaActiva,
}: PanelVariablesEjecucionProps) => {
    const [tab, setTab] = useState<TabVisual>('tabla');

    // Modo película (null estada en vivo)
    const [modoVivo, setModoVivo] = useState(true);
    const [indiceRep, setIndiceRep] = useState(0);
    const [reproduciendo, setReproduciendo] = useState(false);
    const [velocidad, setVelocidad] = useState(2);
    const [mostrarHistorial, setMostrarHistorial] = useState(false);

    const onLineaActivaRef = useRef(onLineaActiva);
    onLineaActivaRef.current = onLineaActiva;

    const total = historial.length;
    const ultima = total > 0 ? historial[total - 1] : null;
    const idxSeguro = Math.min(indiceRep, Math.max(total - 1, 0));
    const captura = modoVivo || total === 0 ? ultima : historial[idxSeguro] ?? ultima;
    const anterior = modoVivo
        ? total > 1
            ? historial[total - 2]
            : null
        : idxSeguro > 0
          ? historial[idxSeguro - 1]
          : null;
    // Traza recortada al paso activo: alimenta los valores y los gráficos
    const cortado = useMemo(
        () => (modoVivo ? historial : historial.slice(0, idxSeguro + 1)),
        [modoVivo, historial, idxSeguro]
    );
    const perfiles = useMemo(
        () => perfilesDe(cortado.slice(-400)),
        [cortado]
    );

    // Valores de la captura anterior, para resaltar el cambio en chips
    const valoresAnteriores = useMemo(() => {
        if (!anterior) return new Map<string, string>();
        return new Map(anterior.variables.map((v) => [v.nombre, v.valor]));
    }, [anterior]);

    const nombres = useMemo(() => {
        const vistos: string[] = [];
        const presentes = new Set<string>();
        for (const capturaDe of [...cortado.slice(-MAX_FILAS), captura]) {
            for (const v of capturaDe?.variables ?? []) {
                if (!presentes.has(v.nombre)) {
                    presentes.add(v.nombre);
                    vistos.push(v.nombre);
                }
            }
        }
        return vistos;
    }, [cortado, captura]);

    const filas = useMemo(() => cortado.slice(-MAX_FILAS), [cortado]);

    // Si la traza se reinicia (nueva ejecución) regresamos al modo vivo
    useEffect(() => {
        if (total === 0 && !modoVivo) {
            setModoVivo(true);
            setIndiceRep(0);
            setReproduciendo(false);
        }
    }, [total, modoVivo]);

    // Conduit del reproductor: avanza una captura por tick
    useEffect(() => {
        if (!reproduciendo) return;

        if (total <= 1) {
            setReproduciendo(false);
            return;
        }

        const id = window.setInterval(() => {
            setIndiceRep((prev) => {
                const siguiente = Math.min(prev + 1, total - 1);
                if (siguiente >= total - 1) {
                    setReproduciendo(false);
                }
                return siguiente;
            });
        }, 420 / velocidad);

        return () => window.clearInterval(id);
    }, [reproduciendo, velocidad, total]);

    // Paso/state seleccionado → línea resaltada en el editor
    useEffect(() => {
        const linea = !estado ? null : (captura?.linea ?? null);
        onLineaActivaRef.current?.(linea);
    }, [estado, captura]);

    const alternarPlay = () => {
        if (total === 0) return;
        if (modoVivo) {
            setModoVivo(false);
            setIndiceRep(0);
            setReproduciendo(total > 1);
        } else {
            setReproduciendo((prev) => !prev);
        }
    };

    const irVivo = () => {
        setModoVivo(true);
        setReproduciendo(false);
        setIndiceRep(total > 0 ? total - 1 : 0);
    };

    const seleccionar = (indice: number) => {
        setModoVivo(false);
        setReproduciendo(false);
        setIndiceRep(indice);
    };

    if (!estado) {
        return null;
    }

    const colorDeNombre = (nombre: string) =>
        colorDe(perfiles.find((p) => p.nombre === nombre)?.indice ?? 0);

    const armarFilas = (): Record<string, string>[] =>
        filas.map((capturaDe) => {
            const fila: Record<string, string> = {};
            for (const v of capturaDe.variables) {
                fila[v.nombre] = v.valor;
            }
            return fila;
        });

    const esTabDeGraficas = tab !== 'tabla';

    return (
        <div
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 15px',
                color: 'var(--text)',
                flex: 2,
                minHeight: 0,
                overflow: 'hidden',
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
                </span>
                {nombres.length > 0 && (
                    <span style={{ fontSize: 10, color: '#888' }}>
                        {modoVivo ? 'seguimiento en vivo' : 'modo película ⏯'}
                    </span>
                )}
            </div>

            {/* Pestañas */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                }}
            >
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        title={item.titulo}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            background:
                                tab === item.id
                                    ? 'rgba(255,124,2,0.18)'
                                    : 'transparent',
                            color:
                                tab === item.id ? '#FF9D3D' : 'var(--text)',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: tab === item.id ? 700 : 500,
                            padding: '2px 8px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.etiqueta}
                    </button>
                ))}
            </div>

            {/* Contenido de la pestaña */}
            {tab === 'tabla' && (
                <>
                    {/* Valores actuales */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px 10px',
                        }}
                    >
                        {captura.variables.map((v) => {
                            const previo = valoresAnteriores.get(v.nombre);
                            const cambio =
                                anterior !== null && previo !== v.valor;
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
                                    <b style={{ color: colorDeNombre(v.nombre) }}>
                                        {v.nombre}
                                    </b>
                                    {` = ${v.valor}`}
                                </span>
                            );
                        })}
                        {captura.variables.length === 0 && (
                            <span style={{ fontSize: 12, color: '#888' }}>
                                Ejecuta un algoritmo con «Definir» para ver sus
                                variables aquí.
                            </span>
                        )}
                    </div>

                    {/* Traza histórica tipo PSeInt */}
                    {nombres.length > 0 && filas.length > 0 && (
                        <div>
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
                                    padding: 0,
                                }}
                            >
                                {mostrarHistorial
                                    ? 'Ocultar traza ▲'
                                    : 'Ver traza ▼'}
                            </button>

                            {mostrarHistorial && (
                                <div
                                    style={{
                                        overflow: 'auto',
                                        maxHeight: 140,
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        marginTop: 5,
                                    }}
                                >
                                    <table
                                        style={{
                                            borderCollapse: 'collapse',
                                            minWidth: '100%',
                                        }}
                                    >
                                        <thead>
                                            <tr
                                                style={{
                                                    backgroundColor:
                                                        'rgba(255,255,255,0.05)',
                                                    position: 'sticky',
                                                    top: 0,
                                                }}
                                            >
                                                <th
                                                    style={{
                                                        padding: '5px 12px',
                                                        fontSize: 11,
                                                        color: '#888',
                                                        textAlign: 'left',
                                                        borderBottom:
                                                            '1px solid var(--border)',
                                                    }}
                                                >
                                                    paso
                                                </th>
                                                {nombres.map((nombre, i) => (
                                                    <th
                                                        key={nombre}
                                                        style={{
                                                            padding: '5px 12px',
                                                            fontSize: 12,
                                                            fontFamily:
                                                                'var(--mono)',
                                                            textAlign: 'left',
                                                            borderBottom:
                                                                '1px solid var(--border)',
                                                            color: colorDe(i),
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {nombre}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {armarFilas().map((fila, i) => (
                                                <tr key={`${filas[i]?.paso}-${i}`}>
                                                    <td
                                                        style={{
                                                            padding: '3px 12px',
                                                            fontSize: 10,
                                                            color: '#777',
                                                        }}
                                                    >
                                                        {filas[i]?.paso ?? '—'}
                                                    </td>
                                                    {nombres.map((nombre) => (
                                                        <td
                                                            key={nombre}
                                                            style={{
                                                                padding: '3px 12px',
                                                                fontSize: 12,
                                                                fontFamily:
                                                                    'var(--mono)',
                                                                whiteSpace:
                                                                    'nowrap',
                                                                color:
                                                                    fila[nombre] ===
                                                                    undefined
                                                                        ? '#555'
                                                                        : 'var(--text)',
                                                            }}
                                                        >
                                                            {fila[nombre] ??
                                                                '—'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {tab === 'evolucion' && <GraficaEvolucion perfiles={perfiles} />}

            {tab === 'barras' && (
                <BarrasEjecucion
                    perfiles={perfiles}
                    captura={captura}
                    anterior={anterior}
                />
            )}

            {tab === 'arreglos' && (
                <ArregloCasillas
                    perfiles={perfiles}
                    captura={captura}
                    anterior={anterior}
                />
            )}

            {/* Reproductor (para pestañas gráficas) */}
            {esTabDeGraficas && (
                <ReproductorEjecucion
                    total={total}
                    modoVivo={modoVivo}
                    indice={idxSeguro}
                    paso={captura?.paso ?? 0}
                    pasoUltimo={ultima?.paso ?? 0}
                    enEjecucion={enEjecucion}
                    reproduciendo={reproduciendo}
                    velocidad={velocidad}
                    onSeleccionar={seleccionar}
                    onIrVivo={irVivo}
                    onTogglePlay={alternarPlay}
                    onVelocidad={setVelocidad}
                />
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
