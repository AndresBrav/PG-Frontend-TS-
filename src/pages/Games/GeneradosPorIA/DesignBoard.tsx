import { useCallback, useState, useRef, useEffect, useContext } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { Node, Edge } from '@xyflow/react';
import type { NodeType } from './types/flow';
import Sidebar from './components/Sidebar';
import FlowEditor, { type FlowEditorRef } from './components/FlowEditor';
import Toolbar from './components/Toolbar';
import { TokenContext } from '../../../Context/TokenContext';
import {
    obtenerJuegoIAPorId,
    guardarEstadoTablero,
    reiniciarEstadoTableroApi,
} from '../../../api/ejerciciosIA/ejercicioIAapi';
import {
    ejecutarPseudocodigo,
    esCanceladoPorUsuario,
    type EstadoEjecucion,
} from './EditingBoard/pseintCompiler';
import PanelVariablesEjecucion, {
    construirHtmlVariablesEnModal,
} from './EditingBoard/PanelVariablesEjecucion';
import {
    generarCodigoDeDiagrama,
    ErrorDiagrama,
} from './diagramaACodigo';
import Swal from 'sweetalert2';
import './app.css';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

interface LocationState {
    juegoId?: number;
    juegoDescripcion?: string;
}

function DesignBoard() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { claveAcceso } = useContext(TokenContext);

    const locationState = location.state as LocationState | null;
    const queryId = searchParams.get('id');
    const juegoId =
        locationState?.juegoId ?? (queryId ? Number(queryId) : undefined);

    const [juegoDescripcion, setJuegoDescripcion] = useState<string>(
        locationState?.juegoDescripcion || ''
    );
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [estadoGuardado, setEstadoGuardado] = useState<
        'guardado' | 'guardando' | 'sin_guardar'
    >('guardado');

    const flowEditorRef = useRef<FlowEditorRef>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Ejecución del diagrama (compilador PSeInt local + modo película) ──
    const [salidaConsola, setSalidaConsola] = useState<string[]>([]);
    const [estadoVariables, setEstadoVariables] =
        useState<EstadoEjecucion | null>(null);
    const [historialVariables, setHistorialVariables] = useState<
        EstadoEjecucion[]
    >([]);
    const [ejecutando, setEjecutando] = useState(false);
    const [panelVisible, setPanelVisible] = useState(false);
    const estadoVariablesRef = useRef<EstadoEjecucion | null>(null);
    const historialVariablesRef = useRef<EstadoEjecucion[]>([]);
    /** Mapa línea de pseudocódigo generada → id del símbolo del diagrama. */
    const mapaLineaNodoRef = useRef<Map<number, string> | null>(null);

    // Cargar progreso previo guardado al montar el componente
    useEffect(() => {
        if (!juegoId || !claveAcceso) return;

        let activo = true;

        const cargarProgreso = async () => {
            const juego = await obtenerJuegoIAPorId(claveAcceso, juegoId);
            if (!activo || !juego) return;

            if (juego.descripcion) {
                setJuegoDescripcion(juego.descripcion);
            }

            if (juego.estado_tablero) {
                try {
                    const parsed = JSON.parse(juego.estado_tablero);
                    if (parsed && (parsed.nodes || parsed.edges)) {
                        flowEditorRef.current?.loadFlowState(parsed);
                        if (parsed.nodes) setNodes(parsed.nodes);
                        if (parsed.edges) setEdges(parsed.edges);
                        setEstadoGuardado('guardado');
                    }
                } catch (e) {
                    console.error('Error parseando estado del tablero:', e);
                }
            }
        };

        void cargarProgreso();

        return () => {
            activo = false;
        };
    }, [juegoId, claveAcceso]);

    // Funcion de guardado (manual o automatica)
    const guardarProgresoEnBD = useCallback(
        async (mostrarToast = false) => {
            if (!juegoId || !claveAcceso || !flowEditorRef.current) return;

            const flowData = flowEditorRef.current.getFlowState();
            setEstadoGuardado('guardando');

            try {
                await guardarEstadoTablero(claveAcceso, juegoId, flowData);
                setEstadoGuardado('guardado');

                try {
                    localStorage.setItem(
                        `flow_draft_${juegoId}`,
                        JSON.stringify(flowData)
                    );
                } catch {
                    // ignorar li­mites de storage
                }

                if (mostrarToast) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Progreso guardado',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                    });
                }
            } catch (error) {
                console.error('Error guardando progreso:', error);
                setEstadoGuardado('sin_guardar');
            }
        },
        [juegoId, claveAcceso]
    );

    // Auto-guardado con debounce de 1.5s ante cualquier cambio en el tablero
    const handleFlowChange = useCallback(() => {
        setEstadoGuardado('sin_guardar');
        // Editar el diagrama invalida cualquier resaltado de ejecución
        flowEditorRef.current?.setNodeHighlight(null, null);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            void guardarProgresoEnBD(false);
        }, 1500);
    }, [guardarProgresoEnBD]);

    /** Mapea un mensaje de error con "línea N" al símbolo del diagrama. */
    const nodoDeError = useCallback(
        (mensaje: string): string | null => {
            const m = mensaje.match(/línea (\d+)/);
            if (!m) return null;
            return mapaLineaNodoRef.current?.get(Number(m[1])) ?? null;
        },
        []
    );

    // Ejecutar el diagrama: grafo → pseudocódigo → compilador local
    const handleEjecutar = useCallback(async () => {
        if (!flowEditorRef.current) return;
        setPanelVisible(true);

        const flowData = flowEditorRef.current.getFlowState();

        let codigo: string;
        try {
            const generado = generarCodigoDeDiagrama(
                flowData.nodes,
                flowData.edges
            );
            codigo = generado.codigo;
            mapaLineaNodoRef.current = generado.lineaANodo;
        } catch (err) {
            const nodeId =
                err instanceof ErrorDiagrama ? err.nodeId : undefined;
            flowEditorRef.current.setNodeHighlight(null, nodeId ?? null);
            setSalidaConsola([
                `[Diagrama] ${err instanceof Error ? err.message : String(err)}`,
            ]);
            return;
        }

        setEjecutando(true);
        setSalidaConsola(['[Sistema] Ejecutando el diagrama...']);
        setEstadoVariables(null);
        setHistorialVariables([]);
        setPanelVisible(true);
        estadoVariablesRef.current = null;
        historialVariablesRef.current = [];
        flowEditorRef.current.setNodeHighlight(null, null);

        try {
            const result = await ejecutarPseudocodigo(codigo, {
                imprimir: (texto) => {
                    setSalidaConsola((prev) => [...prev, texto]);
                },
                onEstado: (estado) => {
                    estadoVariablesRef.current = estado;
                    historialVariablesRef.current = [
                        ...historialVariablesRef.current.slice(-999),
                        estado,
                    ];
                    setEstadoVariables(estado);
                    setHistorialVariables(
                        (prev) => [...prev.slice(-999), estado]
                    );
                    // Ilumina el símbolo del diagrama que se está ejecutando
                    const nodo = estado.linea
                        ? (mapaLineaNodoRef.current?.get(estado.linea) ??
                          null)
                        : null;
                    flowEditorRef.current?.setNodeHighlight(nodo);
                },
                pedirEntrada: async (nombre, _tipo, mensajePrevio) => {
                    // Ilumina el símbolo "Leer" que pide la entrada
                    const lineaLeer = estadoVariablesRef.current?.linea;
                    const nodoLeer = lineaLeer
                        ? (mapaLineaNodoRef.current?.get(lineaLeer) ?? null)
                        : null;
                    if (nodoLeer) {
                        flowEditorRef.current?.setNodeHighlight(nodoLeer);
                    }
                    const aviso = mensajePrevio
                        ? `<div style="text-align:left;color:#555;line-height:1.5;font-weight:bold;margin-bottom:8px;">${mensajePrevio}</div>`
                        : '';
                    const fichaVariables = construirHtmlVariablesEnModal(
                        estadoVariablesRef.current,
                        nombre,
                    );
                    const { value, isConfirmed } = await Swal.fire({
                        title: 'Entrada requerida (Leer)',
                        html: `${aviso}<div style="text-align:left;color:#333;line-height:1.5;">El algoritmo necesita el valor de <strong>${nombre}</strong>.</div>${fichaVariables}`,
                        input: 'text',
                        inputPlaceholder: `Escribe un valor para ${nombre}...`,
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#FF7C02',
                        customClass: {
                            title: 'titulo-celular',
                            confirmButton: 'btn-semitransparente',
                            icon: 'icono-celular',
                        },
                        width: '80%',
                    });

                    if (!isConfirmed) {
                        // Cancelar detiene TODA la ejecución
                        setSalidaConsola((prev) => [
                            ...prev,
                            `> ${nombre} = (cancelado)`,
                            '[Sistema] Ejecucion cancelada por el usuario.',
                        ]);
                        throw new Error('EJECUCION_CANCELADA');
                    }
                    const valor = value ?? '';
                    setSalidaConsola((prev) => [
                        ...prev,
                        `> ${nombre} = ${valor}`,
                    ]);
                    return String(valor);
                },
            });

            setEjecutando(false);

            if (result.error) {
                if (esCanceladoPorUsuario(result.error)) {
                    flowEditorRef.current?.setNodeHighlight(null, null);
                    return;
                }
                flowEditorRef.current?.setNodeHighlight(
                    null,
                    nodoDeError(result.error)
                );
                setSalidaConsola((prev) => [
                    ...prev,
                    '[Sistema] Ejecucion finalizada.',
                    `[Error] ${result.error}`,
                ]);
                return;
            }

            flowEditorRef.current?.setNodeHighlight(null, null);
            setSalidaConsola((prev) => [
                ...prev,
                '[Sistema] Ejecucion finalizada.',
            ]);
        } catch (err) {
            setEjecutando(false);
            if (esCanceladoPorUsuario(err)) {
                flowEditorRef.current?.setNodeHighlight(null, null);
                setSalidaConsola((prev) => [
                    ...prev,
                    '[Sistema] Ejecucion cancelada por el usuario.',
                ]);
                return;
            }
            const mensaje = err instanceof Error ? err.message : String(err);
            flowEditorRef.current?.setNodeHighlight(null, nodoDeError(mensaje));
            setSalidaConsola((prev) => [...prev, `[Error] ${mensaje}`]);
            Swal.fire({
                title: 'Error inesperado',
                text: mensaje,
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#FF7C02',
            });
        }
    }, [nodoDeError]);

    // Guardar cambios pendientes al desmontar si hay timer activo
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onAddNode = useCallback((nodeType: NodeType) => {
        flowEditorRef.current?.addNodeAtCenter(nodeType);
    }, []);

    const handleNodesChange = useCallback((newNodes: Node[]) => {
        setNodes(newNodes);
    }, []);

    const handleEdgesChange = useCallback((newEdges: Edge[]) => {
        setEdges(newEdges);
    }, []);

    const handleClear = () => {
        setNodes([]);
        setEdges([]);
        handleFlowChange();
    };

    const handleReiniciar = async () => {
        const confirmacion = await Swal.fire({
            title: '¿Reiniciar diagrama?',
            text: 'Se eliminarán todos los bloques y conexiones del diagrama para comenzar desde cero.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e11919',
        });

        if (confirmacion.isConfirmed) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            flowEditorRef.current?.loadFlowState({ nodes: [], edges: [] });
            setNodes([]);
            setEdges([]);

            if (juegoId) {
                try {
                    localStorage.removeItem(`flow_draft_${juegoId}`);
                } catch {
                    // ignorar
                }

                if (claveAcceso) {
                    await reiniciarEstadoTableroApi(claveAcceso, juegoId);
                }
            }

            setEstadoGuardado('guardado');

            Swal.fire({
                title: 'Diagrama reiniciado',
                text: 'El lienzo se ha restablecido a su estado inicial.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    return (
        <ReactFlowProvider>
            <div className="app">
                <Toolbar
                    nodes={nodes}
                    edges={edges}
                    onClear={handleClear}
                    juegoId={juegoId}
                    juegoDescripcion={juegoDescripcion}
                    estadoGuardado={estadoGuardado}
                    onGuardarManual={() => void guardarProgresoEnBD(true)}
                    onReiniciar={handleReiniciar}
                    onEjecutar={() => void handleEjecutar()}
                    ejecutando={ejecutando}
                />
                <div
                    style={{
                        padding: '0px',
                        margin: '10px',
                        backgroundColor: 'rgba(217, 217, 217, 0.3)',
                        borderRadius: '10px',
                        borderLeft: '4px solid #FF7C02',
                    }}
                >
                    <p
                        style={{
                            margin: '0',
                            color: '#ffffff',
                            lineHeight: '1.6',
                            fontSize: '16px',
                        }}
                    >
                        {juegoDescripcion || 'No hay descripcion disponible'}
                    </p>
                </div>
                <Sidebar
                    onDragStart={onDragStart}
                    onAddNode={isTouchDevice ? onAddNode : undefined}
                />
                <FlowEditor
                    ref={flowEditorRef}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onFlowChange={handleFlowChange}
                />
                {panelVisible && (
                    <div
                        style={{
                            flexShrink: 0,
                            height: 'clamp(240px, 40vh, 380px)',
                            margin: '0 10px 10px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #444',
                            background: '#1e1e1e',
                            display: 'flex',
                            gap: '1px',
                        }}
                    >
                        {/* Consola de salida */}
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0,
                                background: '#1e1e1e',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #444',
                                    color: '#ddd',
                                    fontSize: '13px',
                                    flexShrink: 0,
                                }}
                            >
                                <span>📟 Consola de Salida</span>
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <button
                                        onClick={() => setSalidaConsola([])}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={() => setPanelVisible(false)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            lineHeight: 1,
                                        }}
                                        title="Cerrar panel"
                                    >
                                        ✕
                                    </button>
                                </span>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '12px',
                                    color: '#00FF00',
                                    overflowY: 'auto',
                                    lineHeight: '1.6',
                                }}
                            >
                                {salidaConsola.length === 0 ? (
                                    <span style={{ color: '#888' }}>
                                        Presiona "▶ Ejecutar" para correr tu
                                        diagrama aquí.
                                    </span>
                                ) : (
                                    salidaConsola.map((log, index) => (
                                        <div
                                            key={index}
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Panel de variables en ejecución (debug + película) */}
                        <div
                            style={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                borderLeft: '1px solid #444',
                            }}
                        >
                            <PanelVariablesEjecucion
                                estado={estadoVariables}
                                historial={historialVariables}
                                enEjecucion={ejecutando}
                                onLineaActiva={(linea) => {
                                    const nodo = linea
                                        ? (mapaLineaNodoRef.current?.get(
                                              linea
                                          ) ?? null)
                                        : null;
                                    flowEditorRef.current?.setNodeHighlight(
                                        nodo
                                    );
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
}

export default DesignBoard;
