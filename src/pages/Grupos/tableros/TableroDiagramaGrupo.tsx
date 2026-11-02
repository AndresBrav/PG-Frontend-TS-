import React, { useCallback, useState, useRef, useEffect, useContext } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { Node, Edge } from '@xyflow/react';
import Swal from 'sweetalert2';
import type { NodeType } from '../../Games/GeneradosPorIA/types/flow';
import Sidebar from '../../Games/GeneradosPorIA/components/Sidebar';
import FlowEditor, { type FlowEditorRef } from '../../Games/GeneradosPorIA/components/FlowEditor';
import { TokenContext } from '../../../Context/TokenContext';
import { UsuarioContext } from '../../../Context/UsuarioContext';
import {
    obtenerEjercicioEstudiante,
    guardarEstadoEjercicioEstudiante,
    entregarEjercicioEstudiante,
    listarSolucionesEjercicio,
    calificarEntrega,
} from '../../../api/gruposApi';
import type { EjercicioGrupoEstudiante, SolucionEstudianteGrupo } from '../../../types/dominio';
import '../../Games/GeneradosPorIA/app.css';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

export const TableroDiagramaGrupo: React.FC = () => {
    const { id, ejercicioId: paramEjercicioId } = useParams<{ id: string; ejercicioId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const grupoId = Number(id);
    const ejercicioId = Number(paramEjercicioId);
    const revisarEstudianteId = searchParams.get('revisarEstudiante')
        ? Number(searchParams.get('revisarEstudiante'))
        : null;

    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);

    const esModoRevision = Boolean(revisarEstudianteId);

    // Datos del ejercicio
    const [titulo, setTitulo] = useState<string>('Diagrama de Flujo');
    const [enunciado, setEnunciado] = useState<string>('');
    const [puntosMaximos, setPuntosMaximos] = useState<number>(100);

    // Estado del estudiante en revisión (Profesor)
    const [estudianteRevisado, setEstudianteRevisado] = useState<SolucionEstudianteGrupo | null>(null);
    const [notaAsignada, setNotaAsignada] = useState<number>(0);
    const [guardandoNota, setGuardandoNota] = useState<boolean>(false);

    // Estado del estudiante resolviendo (Estudiante)
    const [ejercicioEstudiante, setEjercicioEstudiante] = useState<EjercicioGrupoEstudiante | null>(null);
    const [entregando, setEntregando] = useState<boolean>(false);

    // Estado del tablero
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [estadoGuardado, setEstadoGuardado] = useState<'guardado' | 'guardando' | 'sin_guardar'>('guardado');
    const [cargando, setCargando] = useState<boolean>(true);

    const flowEditorRef = useRef<FlowEditorRef>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cargar información inicial
    useEffect(() => {
        if (!grupoId || !ejercicioId || !claveAcceso) return;

        let activo = true;

        const cargarDatos = async () => {
            setCargando(true);
            try {
                if (esModoRevision && revisarEstudianteId) {
                    // Modo Profesor: Revisar solución del estudiante
                    const res = await listarSolucionesEjercicio(claveAcceso, ejercicioId, revisarEstudianteId);
                    if (!activo) return;

                    setTitulo(res.ejercicio.titulo);
                    setEnunciado(res.ejercicio.enunciado);
                    setPuntosMaximos(res.ejercicio.puntos);

                    const sol = res.soluciones.find((s) => s.usuario.id === revisarEstudianteId);
                    if (sol) {
                        setEstudianteRevisado(sol);
                        setNotaAsignada(sol.puntos ?? 0);
                        if (sol.estado_tablero) {
                            try {
                                const parsed =
                                    typeof sol.estado_tablero === 'string'
                                        ? JSON.parse(sol.estado_tablero)
                                        : sol.estado_tablero;
                                if (parsed && (parsed.nodes || parsed.edges)) {
                                    setNodes(parsed.nodes || []);
                                    setEdges(parsed.edges || []);
                                    flowEditorRef.current?.loadFlowState(parsed);
                                }
                            } catch (e) {
                                console.error('Error parseando solución del estudiante:', e);
                            }
                        }
                    }
                } else {
                    // Modo Estudiante: Resolver ejercicio
                    const ej = await obtenerEjercicioEstudiante(claveAcceso, grupoId, ejercicioId);
                    if (!activo) return;

                    setEjercicioEstudiante(ej);
                    setTitulo(ej.titulo);
                    setEnunciado(ej.enunciado);
                    setPuntosMaximos(ej.puntos);

                    if (ej.estado_tablero) {
                        try {
                            const parsed =
                                typeof ej.estado_tablero === 'string'
                                    ? JSON.parse(ej.estado_tablero)
                                    : ej.estado_tablero;
                            if (parsed && (parsed.nodes || parsed.edges)) {
                                setNodes(parsed.nodes || []);
                                setEdges(parsed.edges || []);
                                flowEditorRef.current?.loadFlowState(parsed);
                            }
                        } catch (e) {
                            console.error('Error parseando estado del estudiante:', e);
                        }
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos del tablero:', err);
                void Swal.fire('Error', 'No se pudo cargar la información del ejercicio.', 'error');
            } finally {
                if (activo) setCargando(false);
            }
        };

        void cargarDatos();

        return () => {
            activo = false;
        };
    }, [grupoId, ejercicioId, revisarEstudianteId, esModoRevision, claveAcceso]);

    // Función de autoguardado para estudiantes
    const guardarProgresoEstudiante = useCallback(
        async (mostrarToast = false) => {
            if (esModoRevision || !claveAcceso || !flowEditorRef.current) return;

            const flowData = flowEditorRef.current.getFlowState();
            setEstadoGuardado('guardando');

            try {
                await guardarEstadoEjercicioEstudiante(claveAcceso, grupoId, ejercicioId, flowData);
                setEstadoGuardado('guardado');
                if (mostrarToast) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Progreso guardado',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                }
            } catch (error) {
                console.error('Error al guardar estado de ejercicio:', error);
                setEstadoGuardado('sin_guardar');
            }
        },
        [esModoRevision, claveAcceso, grupoId, ejercicioId],
    );

    const handleFlowChange = useCallback(() => {
        if (esModoRevision) return;

        setEstadoGuardado('sin_guardar');
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            void guardarProgresoEstudiante(false);
        }, 1500);
    }, [esModoRevision, guardarProgresoEstudiante]);

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

    // Acción de entregar para estudiantes
    const handleEntregarEjercicio = async () => {
        if (!claveAcceso || !flowEditorRef.current) return;

        const flowData = flowEditorRef.current.getFlowState();
        if (!flowData.nodes || flowData.nodes.length === 0) {
            void Swal.fire('Diagrama vacío', 'Por favor, crea tu diagrama antes de entregarlo.', 'warning');
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Entregar ejercicio?',
            text: 'Tu solución se enviará para que el profesor la revise y asigne tu calificación.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, entregar solución',
            cancelButtonText: 'Seguir editando',
            confirmButtonColor: '#10b981',
        });

        if (!confirmacion.isConfirmed) return;

        setEntregando(true);
        try {
            await entregarEjercicioEstudiante(claveAcceso, grupoId, ejercicioId, flowData);
            setEstadoGuardado('guardado');
            await Swal.fire({
                title: '¡Entrega realizada!',
                text: 'Tu diagrama ha sido entregado exitosamente a tu profesor.',
                icon: 'success',
            });
            navigate(`/grupos/${grupoId}`);
        } catch (err: any) {
            void Swal.fire('Error al entregar', err.response?.data?.message || 'No se pudo entregar el ejercicio.', 'error');
        } finally {
            setEntregando(false);
        }
    };

    // Acción de calificar para profesor
    const handleGuardarCalificacion = async () => {
        if (!claveAcceso || !revisarEstudianteId) return;

        setGuardandoNota(true);
        try {
            await calificarEntrega(claveAcceso, ejercicioId, revisarEstudianteId, notaAsignada);
            void Swal.fire({
                title: '¡Calificación guardada!',
                text: `Se asignó ${notaAsignada}/${puntosMaximos} pts a este estudiante.`,
                icon: 'success',
                timer: 2000,
            });
            if (estudianteRevisado) {
                setEstudianteRevisado({ ...estudianteRevisado, puntos: notaAsignada });
            }
        } catch (err: any) {
            void Swal.fire('Error', err.response?.data?.message || 'No se pudo guardar la calificación.', 'error');
        } finally {
            setGuardandoNota(false);
        }
    };

    // Reiniciar diagrama (Estudiante)
    const handleReiniciar = async () => {
        const confirmacion = await Swal.fire({
            title: '¿Limpiar diagrama?',
            text: 'Se eliminarán todos los bloques actuales del lienzo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
        });

        if (confirmacion.isConfirmed) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            flowEditorRef.current?.loadFlowState({ nodes: [], edges: [] });
            setNodes([]);
            setEdges([]);
            void guardarProgresoEstudiante(false);
        }
    };

    return (
        <ReactFlowProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                {/* BARRA SUPERIOR PROFESOR (MODO REVISIÓN) */}
                {esModoRevision && (
                    <header
                        style={{
                            background: '#1a1b23',
                            borderBottom: '1px solid #2e303a',
                            padding: '10px 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            zIndex: 20,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link
                                to={`/grupos/${grupoId}`}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: '#252630',
                                    color: '#9ca3af',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                ← Volver al Grupo
                            </Link>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>
                                    Revisión: {titulo}
                                </h1>
                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                                    Estudiante: <span style={{ fontWeight: 600, color: '#fff' }}>{estudianteRevisado?.usuario.username}</span> ({estudianteRevisado?.usuario.codigo}) | Estado: {estudianteRevisado?.completado ? '✅ Entregado' : '⏳ En progreso'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
                                Calificación (0 - {puntosMaximos}):
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={puntosMaximos}
                                value={notaAsignada}
                                onChange={(e) =>
                                    setNotaAsignada(Math.max(0, Math.min(puntosMaximos, Number(e.target.value))))
                                }
                                style={{
                                    width: '70px',
                                    borderRadius: '6px',
                                    border: '1px solid #4b5563',
                                    background: '#0f172a',
                                    padding: '4px 8px',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    color: '#fbbf24',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="button"
                                disabled={guardandoNota}
                                onClick={handleGuardarCalificacion}
                                style={{
                                    borderRadius: '8px',
                                    background: guardandoNota ? '#4b5563' : '#059669',
                                    padding: '6px 16px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    border: 'none',
                                    cursor: guardandoNota ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {guardandoNota ? 'Guardando...' : 'Asignar Nota'}
                            </button>
                        </div>
                    </header>
                )}

                {/* BARRA SUPERIOR ESTUDIANTE */}
                {!esModoRevision && (
                    <header
                        style={{
                            background: '#1a1b23',
                            borderBottom: '1px solid #2e303a',
                            padding: '10px 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            zIndex: 20,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link
                                to={`/grupos/${grupoId}`}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: '#252630',
                                    color: '#9ca3af',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                ← Volver al Grupo
                            </Link>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f3f4f6' }}>
                                    {titulo}
                                </h1>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24' }}>
                                    Valor: {puntosMaximos} pts {ejercicioEstudiante?.completado && `(Tu nota: ${ejercicioEstudiante.puntosObtenidos} pts)`}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Indicador de guardado */}
                            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {estadoGuardado === 'guardando' && (
                                    <>
                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                                        Guardando borrador...
                                    </>
                                )}
                                {estadoGuardado === 'guardado' && (
                                    <>
                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                                        Borrador guardado
                                    </>
                                )}
                                {estadoGuardado === 'sin_guardar' && (
                                    <>
                                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#6b7280' }} />
                                        Cambios pendientes...
                                    </>
                                )}
                            </span>

                            <button
                                type="button"
                                onClick={handleReiniciar}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    background: 'transparent',
                                    color: '#f87171',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Limpiar
                            </button>

                            <button
                                type="button"
                                disabled={entregando}
                                onClick={handleEntregarEjercicio}
                                style={{
                                    padding: '6px 20px',
                                    borderRadius: '8px',
                                    background: entregando ? '#4b5563' : '#059669',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: entregando ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {entregando ? 'Entregando...' : ejercicioEstudiante?.completado ? 'Actualizar Entrega' : '🚀 Entregar Ejercicio'}
                            </button>
                        </div>
                    </header>
                )}

                {/* Contenedor .app para que hereden las variables CSS del DesignBoard */}
                <div className="app" style={{ flex: 1, minHeight: 0 }}>
                    {/* Enunciado del ejercicio (mismo estilo del DesignBoard) */}
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
                            {enunciado || 'No hay descripción disponible'}
                        </p>
                    </div>

                    {/* Sidebar de bloques (solo para estudiante) */}
                    {!esModoRevision && (
                        <Sidebar
                            onDragStart={onDragStart}
                            onAddNode={isTouchDevice ? onAddNode : undefined}
                        />
                    )}

                    {/* Lienzo de ReactFlow */}
                    {cargando ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            Cargando diagrama...
                        </div>
                    ) : (
                        <FlowEditor
                            ref={flowEditorRef}
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={handleNodesChange}
                            onEdgesChange={handleEdgesChange}
                            onFlowChange={handleFlowChange}
                        />
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
};
export default TableroDiagramaGrupo;
