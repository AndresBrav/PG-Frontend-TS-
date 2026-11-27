import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { normVar } from '../compilador';
import type {
    ContextoIteracion,
    EstadoEjecucion,
    VariableEstado,
} from '../compilador';
import { colorDeVariable, evaluarAccesoArreglo, perfilesDe } from './visualUtils';
import GraficaEvolucion from './GraficaEvolucion';
import BarrasEjecucion from './BarrasEjecucion';
import SimulacionMovimiento from './SimulacionMovimiento';
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

type TabVisual =
    | 'tabla'
    | 'escritorio'
    | 'evolucion'
    | 'barras'
    | 'simulacion';

const TABS: { id: TabVisual; etiqueta: string; titulo: string }[] = [
    { id: 'tabla', etiqueta: '📋 Tabla', titulo: 'chips y traza tipo PSeInt' },
    {
        id: 'escritorio',
        etiqueta: '🧾 Escritorio',
        titulo: 'valores antes y después de cada asignación',
    },
    { id: 'evolucion', etiqueta: '📈 Evolución', titulo: 'cómo cambia cada variable en el tiempo' },
    { id: 'barras', etiqueta: '📊 Barras', titulo: 'variables numéricas contra una escala común' },
    {
        id: 'simulacion',
        etiqueta: '🎬 Simulación',
        titulo: 'simulación gráfica interactiva con animación de intercambios y punteros',
    },
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

interface FilaPruebaEscritorio {
    paso: number;
    linea: number;
    iteracion: string;
    control: string;
    variable: string;
    anterior: string;
    operacion: string;
    nuevo: string;
}

const sustituirVariables = (
    expresion: string,
    valores: Map<string, string>,
): string =>
    expresion.replace(
        /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)/g,
        (
            coincidencia,
            textoLiteral: string | undefined,
            nombre: string | undefined,
        ) => {
            if (textoLiteral || !nombre) return coincidencia;
            return valores.get(normVar(nombre)) ?? nombre;
        },
    );

const describirControl = (iteraciones: ContextoIteracion[]): string =>
    iteraciones.length
        ? iteraciones
              .map((ciclo) => {
                  const nombre =
                      ciclo.variable && ciclo.valor !== undefined
                          ? `${ciclo.variable}=${ciclo.valor}`
                          : ciclo.tipo;
                  return `${ciclo.tipo} ${ciclo.iteracion} (${nombre})`;
              })
              .join(' / ')
        : 'Fuera del ciclo';

const celdaEscritorio = {
    padding: '5px 10px',
    fontSize: 11,
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap' as const,
};

/** Ícono SVG de ojo para mostrar / ocultar (mismo diseño SVG de BotonMostrarPassword) */
const IconoOjo = ({ visible, size = 14 }: { visible: boolean; size?: number }) => {
    if (!visible) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
                <path
                    d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
            <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

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
    const [mostrarHistorial, setMostrarHistorial] = useState(true);
    const [variablesOcultas, setVariablesOcultas] = useState<Set<string>>(new Set());

    const alternarVisibilidadVariable = (nombre: string) => {
        setVariablesOcultas((prev) => {
            const nuevo = new Set(prev);
            if (nuevo.has(nombre)) {
                nuevo.delete(nombre);
            } else {
                nuevo.add(nombre);
            }
            return nuevo;
        });
    };

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

        // Agregar también como columnas independientes los accesos a arreglos detectados en las instrucciones (ej: numeros[i], numeros[j])
        for (const capturaDe of cortado.slice(-MAX_FILAS)) {
            const instruccion = capturaDe?.instruccion ?? '';
            const accesos =
                instruccion.match(
                    /[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*\s*\[\s*[^\]]+?\s*\]/g,
                ) ?? [];
            for (const acc of accesos) {
                const accNorm = acc.replace(/\s+/g, '');
                if (!presentes.has(accNorm)) {
                    presentes.add(accNorm);
                    vistos.push(accNorm);
                }
            }
        }

        return vistos;
    }, [cortado, captura]);

    const nombresVisibles = useMemo(
        () => nombres.filter((n) => !variablesOcultas.has(n)),
        [nombres, variablesOcultas]
    );

    const filas = useMemo(() => cortado.slice(-MAX_FILAS), [cortado]);
    const accesosArregloPorFila = useMemo(
        () =>
            filas.map((capturaDe) => {
                const instruccion = capturaDe.instruccion ?? '';
                // Extraer todos los accesos a arreglos en cualquier parte de la instrucción (Si, <-, Leer, Escribir, etc.)
                const accesos =
                    instruccion.match(
                        /[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*\s*\[\s*[^\]]+?\s*\]/g,
                    ) ?? [];

                // Deduplicar expresiones idénticas dentro de la misma línea si las hubiera
                const accesosUnicos = Array.from(new Set(accesos));

                return accesosUnicos.flatMap((expresion) => {
                    const acceso = evaluarAccesoArreglo(
                        expresion,
                        capturaDe.variables,
                    );
                    if (!acceso || acceso.valorCelda === null) return [];

                    return [
                        {
                            expresion,
                            nombreArr: acceso.nombreArr,
                            celdaConcreta: acceso.celdaConcreta,
                            valor: acceso.valorCelda,
                        },
                    ];
                });
            }),
        [filas],
    );

    // Accesos activos a arreglos en la captura actual (para chips de inspección en tiempo real)
    const accesosCapturaActual = useMemo(() => {
        if (!captura?.instruccion) return [];
        const matches =
            captura.instruccion.match(
                /[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*\s*\[\s*[^\]]+?\s*\]/g,
            ) ?? [];
        const unicos = Array.from(new Set(matches));
        return unicos.flatMap((expresion) => {
            const acceso = evaluarAccesoArreglo(expresion, captura.variables);
            if (!acceso || acceso.valorCelda === null) return [];
            return [
                {
                    expresion,
                    nombreArr: acceso.nombreArr,
                    celdaConcreta: acceso.celdaConcreta,
                    valor: acceso.valorCelda,
                },
            ];
        });
    }, [captura]);
    const filasEscritorio = useMemo(() => {
        const filasGeneradas: FilaPruebaEscritorio[] = [];
        const asignacionesFueraDeCiclo = new Set<string>();

        cortado.forEach((capturaDe, indice) => {
            const instruccion = capturaDe.instruccion?.trim();
            if (!instruccion) return;

            const capturaAnterior = cortado[indice - 1];
            const valoresAnteriores = new Map<string, string>(
                (capturaAnterior?.variables ?? []).map((variable) => [
                    normVar(variable.nombre),
                    variable.valor,
                ]),
            );
            const valoresActuales = new Map<string, string>(
                capturaDe.variables.map((variable) => [
                    normVar(variable.nombre),
                    variable.valor,
                ]),
            );
            const iteraciones = capturaDe.iteraciones ?? [];
            const cicloActivo = iteraciones[iteraciones.length - 1];

            // 1. Asignaciones con <-
            const asignacion = instruccion.match(
                /^([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*(?:\s*\[[^\]]+\])?)\s*<-\s*(.+)$/,
            );
            if (asignacion) {
                const objetivo = asignacion[1].trim();
                const esArreglo = objetivo.includes('[');
                const nombreVariable = objetivo.split('[')[0].trim();
                const nombreNormalizado = normVar(nombreVariable);
                const valorNuevoTotal = valoresActuales.get(nombreNormalizado);
                if (valorNuevoTotal === undefined) return;

                const yaAsignadaFueraDeCiclo =
                    asignacionesFueraDeCiclo.has(nombreNormalizado);

                let valorCeldaNuevo = valorNuevoTotal;
                const valorCeldaAnterior =
                    cicloActivo || yaAsignadaFueraDeCiclo
                        ? (valoresAnteriores.get(nombreNormalizado) ?? '—')
                        : '—';

                if (esArreglo) {
                    try {
                        const parsed = JSON.parse(valorNuevoTotal);
                        const corcheteMatch = objetivo.match(/\[([^\]]+)\]/);
                        if (corcheteMatch) {
                            const subIndices = corcheteMatch[1].split(',').map((s) => s.trim());
                            let valCur: unknown = parsed;
                            for (const s of subIndices) {
                                const idxNum = parseInt(sustituirVariables(s, valoresAnteriores), 10);
                                if (!Number.isNaN(idxNum) && Array.isArray(valCur) && idxNum >= 1 && idxNum <= valCur.length) {
                                    valCur = (valCur as unknown[])[idxNum - 1];
                                }
                            }
                            if (valCur !== undefined && !Array.isArray(valCur)) {
                                valorCeldaNuevo = String(valCur);
                            }
                        }
                    } catch {
                        // Conservar valorNuevoTotal si no es JSON válido
                    }
                }

                filasGeneradas.push({
                    paso: capturaDe.paso,
                    linea: capturaDe.linea ?? 0,
                    iteracion: cicloActivo
                        ? String(cicloActivo.iteracion)
                        : yaAsignadaFueraDeCiclo
                          ? '—'
                          : 'Inicial',
                    control: describirControl(iteraciones),
                    variable: objetivo,
                    anterior: valorCeldaAnterior,
                    operacion: cicloActivo
                        ? sustituirVariables(
                              asignacion[2].trim(),
                              valoresAnteriores,
                          )
                        : `${objetivo} ← ${asignacion[2].trim()}`,
                    nuevo: valorCeldaNuevo,
                });

                if (!cicloActivo) {
                    asignacionesFueraDeCiclo.add(nombreNormalizado);
                }
                return;
            }

            // 2. Cabecera del ciclo Para (iterador)
            const esPara = instruccion.match(
                /^para\s+([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\s*<-\s*(.+?)\s+hasta\s+(.+)$/i,
            );
            if (esPara && cicloActivo && cicloActivo.tipo === 'Para') {
                const varPara = esPara[1].trim();
                const varParaNorm = normVar(varPara);
                const valorNuevo = valoresActuales.get(varParaNorm);
                if (valorNuevo !== undefined) {
                    const valorAnterior = valoresAnteriores.get(varParaNorm) ?? '—';
                    filasGeneradas.push({
                        paso: capturaDe.paso,
                        linea: capturaDe.linea ?? 0,
                        iteracion: String(cicloActivo.iteracion),
                        control: describirControl(iteraciones),
                        variable: varPara,
                        anterior: valorAnterior,
                        operacion:
                            cicloActivo.iteracion === 1
                                ? sustituirVariables(esPara[2].trim(), valoresAnteriores)
                                : `${varPara} + paso`,
                        nuevo: valorNuevo,
                    });
                }
                return;
            }

            // 3. Lectura de entrada (Leer v1, v2, ...)
            const esLeer = instruccion.match(/^leer\s+(.+)$/i);
            if (esLeer) {
                const variablesLeidas = esLeer[1].split(',').map((v) => v.trim());
                for (const v of variablesLeidas) {
                    const nombreBase = v.split('[')[0].trim();
                    const nombreNorm = normVar(nombreBase);
                    const valorNuevo = valoresActuales.get(nombreNorm);
                    if (valorNuevo !== undefined) {
                        const valorAnterior = valoresAnteriores.get(nombreNorm) ?? '—';
                        filasGeneradas.push({
                            paso: capturaDe.paso,
                            linea: capturaDe.linea ?? 0,
                            iteracion: cicloActivo
                                ? String(cicloActivo.iteracion)
                                : '—',
                            control: describirControl(iteraciones),
                            variable: v,
                            anterior: valorAnterior,
                            operacion: `Leer(${v})`,
                            nuevo: valorNuevo,
                        });
                    }
                }
            }
        });

        return filasGeneradas.slice(-MAX_FILAS);
    }, [cortado]);

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

    const irAlPasoAnterior = () => {
        seleccionar(Math.max(idxSeguro - 1, 0));
    };

    const irAlPasoSiguiente = () => {
        seleccionar(Math.min(idxSeguro + 1, Math.max(total - 1, 0)));
    };

    if (!estado) {
        return null;
    }

    const colorDeNombre = (nombre: string) =>
        colorDe(perfiles.find((p) => p.nombre === nombre)?.indice ?? 0);

    const armarFilas = (): Record<string, string>[] =>
        filas.map((capturaDe, idxFila) => {
            const fila: Record<string, string> = {};
            for (const v of capturaDe.variables) {
                fila[v.nombre] = v.valor;
            }

            // Llenar valores evaluados para columnas de accesos indexados (ej: numeros[i])
            const accesosDeEstaFila = accesosArregloPorFila[idxFila] ?? [];
            for (const acceso of accesosDeEstaFila) {
                const accNorm = acceso.expresion.replace(/\s+/g, '');
                // Formato descriptivo: "valor [índice]" ej: "4 [2]" o simplemente el valor "4"
                fila[accNorm] = acceso.valor;
            }

            return fila;
        });

    const renderizarCeldaValor = (
        valor: string | undefined,
        valorPrevio: string | undefined
    ) => {
        if (valor === undefined || valor === null) return '—';
        const strVal = String(valor);

        // Si es un arreglo (formato JSON "[...]")
        if (strVal.startsWith('[') && strVal.endsWith(']')) {
            try {
                const arr = JSON.parse(strVal);
                if (Array.isArray(arr)) {
                    let prevArr: unknown[] | null = null;
                    if (
                        valorPrevio &&
                        typeof valorPrevio === 'string' &&
                        valorPrevio.startsWith('[') &&
                        valorPrevio.endsWith(']')
                    ) {
                        const p = JSON.parse(valorPrevio);
                        if (Array.isArray(p)) prevArr = p;
                    }

                    return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <span>[</span>
                            {arr.map((elem, idx) => {
                                const cambio =
                                    prevArr !== null &&
                                    idx < prevArr.length &&
                                    JSON.stringify(elem) !== JSON.stringify(prevArr[idx]);

                                return (
                                    <React.Fragment key={idx}>
                                        {idx > 0 && <span style={{ opacity: 0.4, marginRight: 2 }}>,</span>}
                                        <span
                                            style={{
                                                padding: cambio ? '1px 3px' : '0',
                                                borderRadius: 3,
                                                backgroundColor: cambio ? 'rgba(74, 222, 128, 0.28)' : 'transparent',
                                                color: cambio ? '#4ADE80' : 'inherit',
                                                fontWeight: cambio ? 800 : 400,
                                                outline: cambio ? '1px solid rgba(74, 222, 128, 0.55)' : 'none',
                                            }}
                                            title={cambio ? `Índice [${idx + 1}] cambió a ${String(elem)}` : undefined}
                                        >
                                            {String(elem)}
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                            <span>]</span>
                        </span>
                    );
                }
            } catch {
                /* no parseable */
            }
        }

        return strVal;
    };

    return (
        <div
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '10px 12px',
                color: 'var(--text)',
                flex: 1,
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexShrink: 0,
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

            {/* Pestañas (Fijas arriba) */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                    flexShrink: 0,
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

            {/* Contenedor scrolleable del contenido de la pestaña activa */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    paddingRight: 4,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 157, 61, 0.4) rgba(255, 255, 255, 0.03)',
                }}
            >
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
                            const estaOculta = variablesOcultas.has(v.nombre);
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
                                        opacity: estaOculta ? 0.55 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <b style={{ color: colorDeNombre(v.nombre) }}>
                                        {v.nombre}
                                    </b>
                                    {` = ${v.valor}`}
                                    <button
                                        type="button"
                                        onClick={() => alternarVisibilidadVariable(v.nombre)}
                                        title={
                                            estaOculta
                                                ? `Mostrar ${v.nombre} en la tabla de traza`
                                                : `Ocultar ${v.nombre} de la tabla de traza`
                                        }
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '1px 2px',
                                            lineHeight: 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: estaOculta ? '#94A3B8' : '#FBBF24',
                                            opacity: estaOculta ? 0.6 : 0.9,
                                        }}
                                    >
                                        <IconoOjo visible={!estaOculta} size={14} />
                                    </button>
                                </span>
                            );
                        })}
                        {captura.variables.length === 0 && (
                            <span style={{ fontSize: 12, color: '#888' }}>
                                Ejecuta un algoritmo con «Definir» para ver sus
                                variables aquí.
                            </span>
                        )}

                        {/* Chips de inspección en vivo de elementos de arreglo (ej: numeros[i], numeros[j]) */}
                        {accesosCapturaActual.map((acceso) => {
                            const colorArr = colorDeNombre(acceso.nombreArr);
                            return (
                                <span
                                    key={`acceso-${acceso.expresion}-${acceso.celdaConcreta}`}
                                    title={`En este paso: ${acceso.expresion} equivale a la posición ${acceso.celdaConcreta}`}
                                    style={{
                                        fontFamily: 'var(--mono)',
                                        fontSize: 12,
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                        backgroundColor: 'rgba(96, 165, 250, 0.12)',
                                        border: '1px solid rgba(96, 165, 250, 0.45)',
                                        boxShadow: '0 0 8px rgba(96, 165, 250, 0.25)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        animation: 'pulse 1.8s infinite',
                                    }}
                                >
                                    <span style={{ fontSize: 11, color: '#93C5FD' }}>🔍</span>
                                    <b style={{ color: colorArr }}>
                                        {acceso.expresion}
                                    </b>
                                    <span style={{ color: '#94A3B8', fontSize: 11 }}>
                                        ({acceso.celdaConcreta})
                                    </span>
                                    <span style={{ color: '#FBBF24', fontWeight: 700 }}>
                                        = {acceso.valor}
                                    </span>
                                </span>
                            );
                        })}
                    </div>

                    {/* Traza histórica tipo PSeInt */}
                    {nombres.length > 0 && filas.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                minHeight: 0,
                                marginTop: 4,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexShrink: 0,
                                    marginBottom: 4,
                                    flexWrap: 'wrap',
                                    gap: 6,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>
                                        Traza de variables por paso ({filas.length} pasos)
                                    </span>
                                    {variablesOcultas.size > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setVariablesOcultas(new Set())}
                                            title="Volver a mostrar todas las columnas ocultas"
                                            style={{
                                                background: 'rgba(255, 157, 61, 0.12)',
                                                border: '1px solid rgba(255, 157, 61, 0.35)',
                                                color: '#FBBF24',
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: '2px 7px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 5,
                                            }}
                                        >
                                            <IconoOjo visible={true} size={13} />
                                            <span>
                                                Mostrar todas ({variablesOcultas.size} oculta{variablesOcultas.size > 1 ? 's' : ''})
                                            </span>
                                        </button>
                                    )}
                                </div>
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
                            </div>

                            {mostrarHistorial && (
                                <div
                                    style={{
                                        overflow: 'auto',
                                        flex: 1,
                                        minHeight: 120,
                                        maxHeight: 220,
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
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
                                                    zIndex: 2,
                                                }}
                                            >
                                                <th
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: 11,
                                                        color: '#888',
                                                        textAlign: 'left',
                                                        borderBottom:
                                                            '1px solid var(--border)',
                                                        backgroundColor: 'var(--sidebar-bg)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    paso
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: 11,
                                                        color: '#888',
                                                        textAlign: 'left',
                                                        borderBottom:
                                                            '1px solid var(--border)',
                                                        backgroundColor: 'var(--sidebar-bg)',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    línea
                                                </th>
                                                {nombresVisibles.map((nombre) => {
                                                    const idxOriginal = nombres.indexOf(nombre);
                                                    return (
                                                        <th
                                                            key={nombre}
                                                            style={{
                                                                padding: '5px 10px',
                                                                fontSize: 12,
                                                                fontFamily:
                                                                    'var(--mono)',
                                                                textAlign: 'left',
                                                                borderBottom:
                                                                    '1px solid var(--border)',
                                                                color: colorDe(idxOriginal >= 0 ? idxOriginal : 0),
                                                                whiteSpace:
                                                                    'nowrap',
                                                                backgroundColor: 'var(--sidebar-bg)',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 5,
                                                                }}
                                                            >
                                                                <span>{nombre}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        alternarVisibilidadVariable(nombre);
                                                                    }}
                                                                    title={`Ocultar columna ${nombre} de la tabla`}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        padding: '1px 2px',
                                                                        opacity: 0.7,
                                                                        color: 'inherit',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <IconoOjo visible={true} size={13} />
                                                                </button>
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const filasArray = armarFilas();
                                                if (nombresVisibles.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td
                                                                colSpan={2}
                                                                style={{
                                                                    padding: '16px 10px',
                                                                    textAlign: 'center',
                                                                    color: '#888',
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                Todas las columnas están ocultas.{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setVariablesOcultas(new Set())}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: '#FBBF24',
                                                                        cursor: 'pointer',
                                                                        textDecoration: 'underline',
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    Mostrar todas
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return filasArray.map((fila, i) => {
                                                    const capturaFila = filas[i];
                                                    const pasoActual = capturaFila?.paso;
                                                    const lineaActual = capturaFila?.linea;
                                                    const instruccionFila = capturaFila?.instruccion;
                                                    const esSeleccionado = captura?.paso === pasoActual;
                                                    const filaPrevia = i > 0 ? filasArray[i - 1] : undefined;
                                                    const accesosArreglo = accesosArregloPorFila[i] ?? [];

                                                    return (
                                                        <tr
                                                            key={`${pasoActual}-${i}`}
                                                            style={{
                                                                backgroundColor: esSeleccionado
                                                                    ? 'rgba(255,124,2,0.14)'
                                                                    : i % 2 === 0
                                                                      ? 'transparent'
                                                                      : 'rgba(255,255,255,0.02)',
                                                            }}
                                                        >
                                                            <td
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    fontSize: 10,
                                                                    color: esSeleccionado ? '#FF9D3D' : '#777',
                                                                    fontWeight: esSeleccionado ? 700 : 400,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {pasoActual ?? '—'}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    fontSize: 10,
                                                                    fontFamily: 'var(--mono)',
                                                                    color: esSeleccionado ? '#FBBF24' : '#94A3B8',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                                title={instruccionFila ? `Instrucción: ${instruccionFila}` : undefined}
                                                            >
                                                                {lineaActual ? `L${lineaActual}` : '—'}
                                                            </td>
                                                            {nombresVisibles.map((nombre) => {
                                                                const esColumnaAcceso = nombre.includes('[');
                                                                const celdasAccedidas = !esColumnaAcceso
                                                                    ? accesosArreglo.filter(
                                                                          (acceso) =>
                                                                              normVar(acceso.nombreArr) ===
                                                                              normVar(nombre),
                                                                      )
                                                                    : [];

                                                                const valorCeldaActual = fila[nombre];
                                                                const accesoPropio = esColumnaAcceso
                                                                    ? accesosArreglo.find(
                                                                          (a) => a.expresion.replace(/\s+/g, '') === nombre
                                                                      )
                                                                    : null;

                                                                return (
                                                                    <td
                                                                        key={nombre}
                                                                        style={{
                                                                            padding: '4px 12px',
                                                                            fontSize: 12,
                                                                            fontFamily:
                                                                                'var(--mono)',
                                                                            whiteSpace:
                                                                                'nowrap',
                                                                            color:
                                                                                valorCeldaActual ===
                                                                                undefined
                                                                                    ? '#555'
                                                                                    : esColumnaAcceso
                                                                                      ? '#FBBF24'
                                                                                      : 'var(--text)',
                                                                        }}
                                                                    >
                                                                        {esColumnaAcceso ? (
                                                                            valorCeldaActual !== undefined ? (
                                                                                <span
                                                                                    style={{
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 4,
                                                                                        padding: '1px 5px',
                                                                                        borderRadius: 4,
                                                                                        background: 'rgba(251, 191, 36, 0.12)',
                                                                                        border: '1px solid rgba(251, 191, 36, 0.4)',
                                                                                        fontWeight: 700,
                                                                                    }}
                                                                                    title={
                                                                                        accesoPropio
                                                                                            ? `${accesoPropio.expresion} = ${accesoPropio.celdaConcreta} (${valorCeldaActual})`
                                                                                            : undefined
                                                                                    }
                                                                                >
                                                                                    <b style={{ color: '#FBBF24' }}>
                                                                                        {valorCeldaActual}
                                                                                    </b>
                                                                                    {accesoPropio && (
                                                                                        <span
                                                                                            style={{
                                                                                                fontSize: 9.5,
                                                                                                color: '#94A3B8',
                                                                                                fontWeight: 500,
                                                                                            }}
                                                                                        >
                                                                                            [{accesoPropio.celdaConcreta.replace(/^[^[]*\[(.*)\]$/, '$1')}]
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#555', opacity: 0.5 }}>—</span>
                                                                            )
                                                                        ) : (
                                                                            renderizarCeldaValor(
                                                                                valorCeldaActual,
                                                                                filaPrevia
                                                                                    ? filaPrevia[nombre]
                                                                                    : undefined,
                                                                            )
                                                                        )}
                                                                        {celdasAccedidas.map(
                                                                            (acceso) => (
                                                                                <div
                                                                                    key={`${acceso.celdaConcreta}-${acceso.expresion}`}
                                                                                    title={`${acceso.expresion} evaluado en este paso es la celda ${acceso.celdaConcreta} con valor ${acceso.valor}`}
                                                                                    style={{
                                                                                        display: 'inline-flex',
                                                                                        gap: 4,
                                                                                        alignItems: 'center',
                                                                                        marginTop: 3,
                                                                                        marginRight: 6,
                                                                                        padding: '1px 5px',
                                                                                        borderRadius: 4,
                                                                                        background: 'rgba(96, 165, 250, 0.12)',
                                                                                        border: '1px solid rgba(96, 165, 250, 0.35)',
                                                                                        fontSize: 10,
                                                                                        whiteSpace: 'nowrap',
                                                                                    }}
                                                                                >
                                                                                    <span
                                                                                        style={{
                                                                                            color: '#93C5FD',
                                                                                            fontWeight: 600,
                                                                                        }}
                                                                                    >
                                                                                        ↳ {acceso.expresion}
                                                                                        {acceso.expresion !== acceso.celdaConcreta && (
                                                                                            <span style={{ opacity: 0.75, fontSize: 9.5 }}>
                                                                                                [{acceso.celdaConcreta.replace(/^[^[]*\[(.*)\]$/, '$1')}]
                                                                                            </span>
                                                                                        )}
                                                                                        :
                                                                                    </span>
                                                                                    <b
                                                                                        style={{
                                                                                            color: '#FBBF24',
                                                                                            fontWeight: 700,
                                                                                        }}
                                                                                    >
                                                                                        {acceso.valor}
                                                                                    </b>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {tab === 'escritorio' && (
                <div>
                    <div style={{ marginBottom: 6 }}>
                        <strong style={{ fontSize: 12 }}>
                            Prueba de escritorio
                        </strong>
                        <p style={{ fontSize: 10, color: '#888', margin: 0 }}>
                            Cada fila muestra una asignación y los valores
                            anteriores y nuevos. La traza completa sigue
                            disponible en la pestaña Tabla.
                        </p>
                    </div>
                    {filasEscritorio.length === 0 ? (
                        <span style={{ fontSize: 11, color: '#888' }}>
                            Ejecuta un algoritmo con asignaciones para generar
                            esta tabla.
                        </span>
                    ) : (
                        <div
                            style={{
                                overflow: 'auto',
                                maxHeight: 220,
                                border: '1px solid var(--border)',
                                borderRadius: 8,
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
                                        {[
                                            'iteración',
                                            'control',
                                            'variable',
                                            'valor anterior',
                                            'operación',
                                            'valor nuevo',
                                        ].map((titulo) => (
                                            <th
                                                key={titulo}
                                                style={{
                                                    padding: '6px 10px',
                                                    fontSize: 10,
                                                    color: '#888',
                                                    textAlign: 'left',
                                                    whiteSpace: 'nowrap',
                                                    borderBottom:
                                                        '1px solid var(--border)',
                                                }}
                                            >
                                                {titulo}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasEscritorio.map((fila, indice) => (
                                        <tr
                                            key={`${fila.paso}-${fila.linea}-${indice}`}
                                        >
                                            <td style={celdaEscritorio}>
                                                {fila.iteracion}
                                            </td>
                                            <td style={celdaEscritorio}>
                                                {fila.control}
                                            </td>
                                            <td
                                                style={{
                                                    ...celdaEscritorio,
                                                    fontWeight: 700,
                                                    color: '#60A5FA',
                                                }}
                                            >
                                                {fila.variable}
                                            </td>
                                            <td
                                                style={{
                                                    ...celdaEscritorio,
                                                    color: '#FBBF24',
                                                }}
                                            >
                                                {fila.anterior}
                                            </td>
                                            <td style={celdaEscritorio}>
                                                {fila.operacion}
                                            </td>
                                            <td
                                                style={{
                                                    ...celdaEscritorio,
                                                    color: '#4ADE80',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {fila.nuevo}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'evolucion' && (
                <GraficaEvolucion
                    perfiles={perfiles}
                    variablesOcultas={variablesOcultas}
                    onToggleVariable={alternarVisibilidadVariable}
                />
            )}

            {tab === 'barras' && (
                <BarrasEjecucion
                    perfiles={perfiles}
                    captura={captura}
                    anterior={anterior}
                    variablesOcultas={variablesOcultas}
                    onToggleVariable={alternarVisibilidadVariable}
                />
            )}

            {tab === 'simulacion' && (
                <SimulacionMovimiento
                    perfiles={perfiles}
                    captura={captura}
                    anterior={anterior}
                    historial={cortado}
                    velocidad={velocidad}
                />
            )}
            </div>

            {/* Reproductor de Modo Película (Fijo y Estático abajo de todo) */}
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
                onPasoAnterior={irAlPasoAnterior}
                onPasoSiguiente={irAlPasoSiguiente}
                onIrVivo={irVivo}
                onTogglePlay={alternarPlay}
                onVelocidad={setVelocidad}
            />
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

/**
 * HTML del bloque de variables para incrustar en el modal de
 * "Entrada requerida (Leer)": chips con el valor actual de cada variable.
 */
export const construirHtmlVariablesEnModal = (
    estado: EstadoEjecucion | null,
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

    return `<div style="margin-top:10px;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
<div style="font-size:12px;font-weight:bold;color:#4b5563;margin-bottom:6px;">🔍 Variables en Ejecución <span style="color:#9ca3af;font-weight:500;font-size:11px;">(paso ${estado?.paso ?? 0})</span></div>
<div style="line-height:1.6;">${chips}</div>
</div>`;
};
