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

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            void guardarProgresoEnBD(false);
        }, 1500);
    }, [guardarProgresoEnBD]);

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
            </div>
        </ReactFlowProvider>
    );
}

export default DesignBoard;
