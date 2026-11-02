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
            <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121212] text-white">
                {/* BARRA SUPERIOR PROFESOR (MODO REVISIÓN) */}
                {esModoRevision && (
                    <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
                        <div className="flex items-center gap-4">
                            <Link
                                to={`/grupos/${grupoId}`}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                            >
                                ← Volver al Grupo
                            </Link>
                            <div>
                                <h1 className="text-base font-bold text-sky-400">
                                    Revisión: {titulo}
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Estudiante: <span className="font-semibold text-white">{estudianteRevisado?.usuario.username}</span> ({estudianteRevisado?.usuario.codigo}) | Estado: {estudianteRevisado?.completado ? '✅ Entregado' : '⏳ En progreso'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-slate-300">
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
                                className="w-20 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-center font-bold text-amber-300 text-sm focus:border-amber-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                disabled={guardandoNota}
                                onClick={handleGuardarCalificacion}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                            >
                                {guardandoNota ? 'Guardando...' : 'Asignar Nota'}
                            </button>
                        </div>
                    </header>
                )}

                {/* BARRA SUPERIOR ESTUDIANTE */}
                {!esModoRevision && (
                    <header className="bg-[#1e1e1e] border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
                        <div className="flex items-center gap-4">
                            <Link
                                to={`/grupos/${grupoId}`}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition"
                            >
                                ← Volver al Grupo
                            </Link>
                            <div>
                                <h1 className="text-base font-bold text-white">
                                    {titulo}
                                </h1>
                                <span className="text-xs font-semibold text-amber-400">
                                    Valor: {puntosMaximos} pts {ejercicioEstudiante?.completado && `(Tu nota: ${ejercicioEstudiante.puntosObtenidos} pts)`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Indicador de guardado */}
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                {estadoGuardado === 'guardando' && (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        Guardando borrador...
                                    </>
                                )}
                                {estadoGuardado === 'guardado' && (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                                        Borrador guardado
                                    </>
                                )}
                                {estadoGuardado === 'sin_guardar' && (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
                                        Cambios pendientes...
                                    </>
                                )}
                            </span>

                            <button
                                type="button"
                                onClick={handleReiniciar}
                                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition"
                            >
                                Limpiar
                            </button>

                            <button
                                type="button"
                                disabled={entregando}
                                onClick={handleEntregarEjercicio}
                                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg disabled:opacity-50"
                            >
                                {entregando ? 'Entregando...' : ejercicioEstudiante?.completado ? 'Actualizar Entrega' : '🚀 Entregar Ejercicio'}
                            </button>
                        </div>
                    </header>
                )}

                {/* ENUNCIADO DEL EJERCICIO */}
                <div className="mx-4 my-2 px-4 py-2.5 rounded-xl bg-white/5 border-l-4 border-[#FF7C02] text-sm text-gray-200">
                    <span className="font-bold text-[#FF9D3D] mr-2">Enunciado:</span>
                    {enunciado || 'Sin descripción disponible'}
                </div>

                {/* LIENZO DE REACTFLOW */}
                <div className="relative flex-1 w-full overflow-hidden flex">
                    {!esModoRevision && (
                        <Sidebar
                            onDragStart={onDragStart}
                            onAddNode={isTouchDevice ? onAddNode : undefined}
                        />
                    )}

                    {cargando ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Cargando diagrama...
                        </div>
                    ) : (
                        <div className="flex-1 h-full w-full relative">
                            <FlowEditor
                                ref={flowEditorRef}
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={handleNodesChange}
                                onEdgesChange={handleEdgesChange}
                                onFlowChange={handleFlowChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
};
export default TableroDiagramaGrupo;
