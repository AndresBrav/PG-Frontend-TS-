import {
    useCallback,
    useState,
    useRef,
    useEffect,
    useContext,
} from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import {
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';
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
    abrirEjercicioGrupo,
    completarEjercicioGrupo,
    guardarEstadoEjercicioGrupo,
    listarSolucionesEjercicio,
} from '../../../api/gruposApi';
import { obtenerMensajeError } from '../../../api/http';
import {
    ejecutarPseudocodigo,
    esCanceladoPorUsuario,
    type EstadoEjecucion,
} from './compilador';
import PanelVariablesEjecucion, {
    construirHtmlVariablesEnModal,
} from './EditingBoard/PanelVariablesEjecucion';
import {
    generarCodigoDeDiagrama,
    ErrorDiagrama,
} from './compilador';
import Swal from 'sweetalert2';
import './app.css';
import CasosPruebaPanel from '../../Grupos/CasosPruebaPanel';
import type {
    CasoPruebaGrupo,
    ResultadoCasoPrueba,
} from '../../../types/dominio';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

interface LocationState {
    juegoId?: number;
    juegoDescripcion?: string;
    rutaVolver?: string;
}

/** Información del ejercicio de grupo para el banner del tablero. */
interface InfoEjercicioGrupo {
    titulo: string;
    enunciado: string;
    fechaLimite: string | null;
    vencido: boolean;
    completado: boolean;
    puntos: number;
    calificado: boolean;
    puntosProfesor: number | null;
    comentario: string | null;
    casosPrueba?: CasoPruebaGrupo[];
    estudiante?: string;
}

function DesignBoard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routeParams = useParams<{ id?: string; ejercicioId?: string }>();
    const { claveAcceso } = useContext(TokenContext);

    const locationState = location.state as LocationState | null;
    const queryId = searchParams.get('id');
    const juegoId =
        locationState?.juegoId ?? (queryId ? Number(queryId) : undefined);

    // ── Modo grupo: ejercicio de grupo cargado desde la BD del módulo ──
    const esModoGrupo = Boolean(routeParams.ejercicioId);
    const grupoId = routeParams.id ?? null;
    const ejercicioId = routeParams.ejercicioId ?? null;
    const revisarEstudianteId = searchParams.get('revisarEstudiante')
        ? Number(searchParams.get('revisarEstudiante'))
        : null;
    const esRevision = esModoGrupo && revisarEstudianteId !== null;
    const rutaVolverDetalle =
        esRevision &&
        grupoId &&
        (locationState?.rutaVolver?.startsWith(
            `/grupos/${grupoId}/reporte/estudiantes/`,
        ) ||
            locationState?.rutaVolver?.startsWith(
                `/grupos/${grupoId}/reporte/ejercicios/`,
            ))
            ? locationState.rutaVolver
            : null;
    const [infoGrupo, setInfoGrupo] = useState<InfoEjercicioGrupo | null>(
        null
    );
    const [enunciadoVisible, setEnunciadoVisible] = useState(false);
    const [resultadoCasosPrueba, setResultadoCasosPrueba] =
        useState<ResultadoCasoPrueba[] | null>(null);
    const actualizarResultadoCasosPrueba = useCallback(
        (resultado: ResultadoCasoPrueba[] | null) =>
            setResultadoCasosPrueba(resultado),
        [],
    );
    const [entregando, setEntregando] = useState(false);
    // Solo lectura: revisión del profesor o ejercicio vencido.
    const soloLectura =
        esModoGrupo && (esRevision || infoGrupo?.vencido === true);

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
        if (!juegoId || !claveAcceso || esModoGrupo) return;

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
    }, [juegoId, claveAcceso, esModoGrupo]);

    // Carga del ejercicio de grupo (estudiante o revisión del profesor)
    useEffect(() => {
        if (!esModoGrupo || !claveAcceso || !grupoId || !ejercicioId) return;

        setEnunciadoVisible(false);
        let activo = true;

        const aplicarEstado = (estadoTablero: string | null) => {
            if (!estadoTablero) return;
            try {
                const parsed = JSON.parse(estadoTablero);
                if (parsed && (parsed.nodes || parsed.edges)) {
                    flowEditorRef.current?.loadFlowState(parsed);
                    if (parsed.nodes) setNodes(parsed.nodes);
                    if (parsed.edges) setEdges(parsed.edges);
                    setEstadoGuardado('guardado');
                }
            } catch (e) {
                console.error('Error parseando estado del tablero:', e);
            }
        };

        const cargarGrupo = async () => {
            try {
                if (esRevision && revisarEstudianteId !== null) {
                    // Profesor: la entrega vive en las soluciones del ejercicio
                    const soluciones = await listarSolucionesEjercicio(
                        claveAcceso,
                        ejercicioId
                    );
                    const entrega = soluciones.find(
                        (s) => s.usuario_id === revisarEstudianteId
                    );
                    if (!activo) return;
                    if (!entrega) {
                        await Swal.fire({
                            icon: 'warning',
                            title: 'Sin entrega',
                            text: 'Ese estudiante todavía no abrió este ejercicio.',
                        });
                        navigate(`/grupos/${grupoId}`);
                        return;
                    }
                    setInfoGrupo({
                        titulo: 'Revisión de entrega',
                        enunciado: `Solución de ${entrega.estudiante.username} (${entrega.estudiante.codigo}).`,
                        fechaLimite: null,
                        vencido: false,
                        completado: entrega.completado,
                        puntos: entrega.puntos,
                        calificado: entrega.calificado,
                        puntosProfesor: entrega.puntos_profesor,
                        comentario: entrega.comentario_profesor,
                        estudiante: entrega.estudiante.username,
                    });
                    aplicarEstado(entrega.estado_tablero);
                } else {
                    // Estudiante: abre su propia entrega
                    const abierto = await abrirEjercicioGrupo(
                        claveAcceso,
                        grupoId,
                        ejercicioId
                    );
                    if (!activo) return;
                    setInfoGrupo({
                        titulo: abierto.ejercicio.titulo,
                        enunciado: abierto.ejercicio.enunciado,
                        fechaLimite: abierto.ejercicio.fecha_limite,
                        vencido: abierto.vencido,
                        completado: abierto.entrega.completado,
                        puntos: abierto.entrega.puntos,
                        calificado: abierto.entrega.calificado,
                        puntosProfesor: abierto.entrega.puntos_profesor,
                        comentario: abierto.entrega.comentario_profesor,
                        casosPrueba: abierto.ejercicio.casos_prueba ?? [],
                    });
                    aplicarEstado(abierto.entrega.estado_tablero);
                }
            } catch (error) {
                if (!activo) return;
                const mensaje = obtenerMensajeError(
                    error,
                    'No se pudo cargar el ejercicio'
                );
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje,
                });
                navigate(`/grupos/${grupoId}`);
            }
        };

        void cargarGrupo();

        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [esModoGrupo, claveAcceso, grupoId, ejercicioId, esRevision, revisarEstudianteId]);

    // Funcion de guardado (manual o automatica)
    const guardarProgresoEnBD = useCallback(
        async (mostrarToast = false) => {
            if (!claveAcceso || !flowEditorRef.current) return;
            // En modo grupo sin ids, en solo lectura o vencido no se guarda.
            if (esModoGrupo && (!grupoId || !ejercicioId || soloLectura))
                return;
            if (!esModoGrupo && !juegoId) return;

            const flowData = flowEditorRef.current.getFlowState();
            setEstadoGuardado('guardando');

            try {
                if (esModoGrupo && grupoId && ejercicioId) {
                    // El estado del tablero de grupo es texto plano
                    await guardarEstadoEjercicioGrupo(
                        claveAcceso,
                        grupoId,
                        ejercicioId,
                        JSON.stringify(flowData)
                    );
                } else if (juegoId) {
                    await guardarEstadoTablero(claveAcceso, juegoId, flowData);

                    try {
                        localStorage.setItem(
                            `flow_draft_${juegoId}`,
                            JSON.stringify(flowData)
                        );
                    } catch {
                        // ignorar li­mites de storage
                    }
                }
                setEstadoGuardado('guardado');

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
        [juegoId, claveAcceso, esModoGrupo, grupoId, ejercicioId, soloLectura]
    );

    // Auto-guardado con debounce de 1.5s ante cualquier cambio en el tablero
    const handleFlowChange = useCallback(() => {
        setResultadoCasosPrueba(null);
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

    /** Entrega el ejercicio de grupo (puntos solo la primera vez). */
    const handleEntregar = async () => {
        if (!claveAcceso || !grupoId || !ejercicioId) return;

        // Cierra cualquier autoguardado pendiente antes de entregar
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        await guardarProgresoEnBD(false);

        const confirmar = await Swal.fire({
            title: '¿Entregar ejercicio?',
            text: 'Se marcará como completado y tu profesor podrá revisarlo. Los puntos solo se otorgan la primera vez.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Entregar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#FF7C02',
        });
        if (!confirmar.isConfirmed) return;

        setEntregando(true);
        try {
            const flowData = flowEditorRef.current?.getFlowState();
            const resultado = await completarEjercicioGrupo(
                claveAcceso,
                grupoId,
                ejercicioId,
                JSON.stringify(flowData),
                resultadoCasosPrueba,
            );
            setInfoGrupo((prev) =>
                prev
                    ? { ...prev, completado: true, puntos: resultado.puntos }
                    : prev
            );
            await Swal.fire({
                icon: 'success',
                title: 'Ejercicio entregado',
                text: 'Esperando la calificación de tu profesor.',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate(`/grupos/${grupoId}`);
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo entregar el ejercicio'
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setEntregando(false);
        }
    };

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

            if (esModoGrupo && grupoId && ejercicioId && !soloLectura) {
                // Reiniciar en grupo = canvas vacío guardado en su BD
                try {
                    await guardarEstadoEjercicioGrupo(
                        claveAcceso!,
                        grupoId,
                        ejercicioId,
                        JSON.stringify({ nodes: [], edges: [] })
                    );
                } catch (error) {
                    console.error('Error reiniciando entrega:', error);
                }
            } else if (juegoId && claveAcceso) {
                try {
                    localStorage.removeItem(`flow_draft_${juegoId}`);
                } catch {
                    // ignorar
                }

                await reiniciarEstadoTableroApi(claveAcceso, juegoId);
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
                    estadoGuardado={estadoGuardado}
                    onGuardarManual={
                        soloLectura
                            ? undefined
                            : () => void guardarProgresoEnBD(true)
                    }
                    onReiniciar={
                        soloLectura ? undefined : handleReiniciar
                    }
                    onEjecutar={() => void handleEjecutar()}
                    ejecutando={ejecutando}
                    rutaVolver={
                        esRevision && grupoId && ejercicioId
                            ? rutaVolverDetalle ??
                              `/profesor/grupos/${grupoId}/ejercicios/${ejercicioId}/revisar?tipo=diagrama`
                            : esModoGrupo && grupoId
                              ? `/grupos/${grupoId}`
                              : undefined
                    }
                    ocultarVerificarIA={esModoGrupo}
                />
                {esModoGrupo && infoGrupo && (
                    <div
                        style={{
                            margin: '5px 10px',
                            padding: '7px 12px',
                            backgroundColor: 'rgba(217, 217, 217, 0.3)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #FF7C02',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                            }}
                        >
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            color: '#FF7C02',
                                            fontSize: '15px',
                                        }}
                                    >
                                        {infoGrupo.titulo}
                                    </h3>
                                    <button
                                        type="button"
                                        aria-expanded={enunciadoVisible}
                                        onClick={() =>
                                            setEnunciadoVisible(
                                                (visible) => !visible,
                                            )
                                        }
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            padding: '3px 8px',
                                            background: 'rgba(0,0,0,0.18)',
                                            color: '#ddd',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {enunciadoVisible
                                            ? 'Ocultar enunciado'
                                            : 'Ver enunciado'}
                                    </button>
                                </div>
                                {enunciadoVisible && (
                                    <p
                                        style={{
                                            margin: '5px 0 0',
                                            maxHeight: '100px',
                                            overflowY: 'auto',
                                            color: '#ffffff',
                                            lineHeight: '1.4',
                                            fontSize: '13px',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {infoGrupo.enunciado}
                                    </p>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        marginTop: '5px',
                                        fontSize: '11px',
                                    }}
                                >
                                    <span
                                        style={{
                                            background: 'rgba(0,0,0,0.25)',
                                            borderRadius: '999px',
                                            padding: '2px 8px',
                                            color: '#ddd',
                                        }}
                                    >
                                        {infoGrupo.fechaLimite
                                            ? infoGrupo.vencido
                                                ? `⏰ Venció el ${infoGrupo.fechaLimite}`
                                                : `⏰ Fecha límite: ${infoGrupo.fechaLimite}`
                                            : 'Sin fecha límite'}
                                    </span>
                                    {infoGrupo.calificado && (
                                        <span
                                            style={{
                                                background:
                                                    'rgba(255,124,2,0.18)',
                                                borderRadius: '999px',
                                                padding: '2px 8px',
                                                color: '#FFB86C',
                                            }}
                                        >
                                            ⭐ Profesor:{' '}
                                            {infoGrupo.puntosProfesor ?? 0} pts
                                            {infoGrupo.comentario
                                                ? ` — "${infoGrupo.comentario}"`
                                                : ''}
                                        </span>
                                    )}
                                    {infoGrupo.completado &&
                                        !infoGrupo.calificado && (
                                            <span
                                                style={{
                                                    background:
                                                        'rgba(39,167,69,0.18)',
                                                    borderRadius: '999px',
                                                    padding: '2px 8px',
                                                    color: '#7DE08A',
                                                }}
                                            >
                                                ✅ Entregado — pendiente de
                                                calificación
                                            </span>
                                        )}
                                    {esRevision && (
                                        <span
                                            style={{
                                                background:
                                                    'rgba(59,130,246,0.18)',
                                                borderRadius: '999px',
                                                padding: '2px 8px',
                                                color: '#93C5FD',
                                            }}
                                        >
                                            👁 Modo revisión (solo lectura)
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!esRevision &&
                                !infoGrupo.completado &&
                                (infoGrupo.vencido ? (
                                    <span
                                        style={{
                                            color: '#fca5a5',
                                            alignSelf: 'center',
                                            fontSize: '13px',
                                        }}
                                    >
                                        ⏰ Vencido: no puedes entregar
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => void handleEntregar()}
                                        disabled={entregando}
                                        style={{
                                            backgroundColor: '#FF7C02',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: entregando
                                                ? 'wait'
                                                : 'pointer',
                                            opacity: entregando ? 0.6 : 1,
                                        }}
                                    >
                                        {entregando
                                            ? '⏳ Entregando...'
                                            : '✅ Entregar ejercicio'}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
                {!esModoGrupo && (
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
                            {juegoDescripcion ||
                                'No hay descripcion disponible'}
                        </p>
                    </div>
                )}
                {!soloLectura && (
                    <Sidebar
                        onDragStart={onDragStart}
                        onAddNode={isTouchDevice ? onAddNode : undefined}
                    />
                )}
                <FlowEditor
                    ref={flowEditorRef}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onFlowChange={handleFlowChange}
                    soloLectura={soloLectura}
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
                {esModoGrupo &&
                    !esRevision &&
                    infoGrupo?.casosPrueba &&
                    infoGrupo.casosPrueba.length > 0 && (
                        <CasosPruebaPanel
                            codigo={() => {
                                const flowData =
                                    flowEditorRef.current?.getFlowState();
                                if (!flowData) {
                                    throw new Error(
                                        'No se pudo leer el diagrama actual.',
                                    );
                                }
                                return generarCodigoDeDiagrama(
                                    flowData.nodes,
                                    flowData.edges,
                                ).codigo;
                            }}
                            codigoVersion={JSON.stringify([nodes, edges])}
                            casosPrueba={infoGrupo.casosPrueba}
                            deshabilitado={soloLectura || entregando}
                            onResultadosChange={
                                actualizarResultadoCasosPrueba
                            }
                        />
                    )}
            </div>
        </ReactFlowProvider>
    );
}

export default DesignBoard;
