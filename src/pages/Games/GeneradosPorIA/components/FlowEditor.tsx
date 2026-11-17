import {
    createContext,
    useContext,
    useCallback,
    useRef,
    useMemo,
    useImperativeHandle,
    forwardRef,
    useState,
} from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    addEdge,
    useNodesState,
    useEdgesState,
    MarkerType,
    useReactFlow,
    type OnConnect,
    type Node,
    type Edge,
    type OnNodesDelete,
    type OnEdgesDelete,
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Swal from 'sweetalert2';
import { StartEndNode, ProcessNode, DataNode, DecisionNode } from './nodes';
import type { NodeType } from '../types/flow';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

interface NodeDeleteContextType {
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    deleteNodeById: (id: string) => void;
}

const NodeDeleteContext = createContext<NodeDeleteContextType>({
    selectedNodeId: null,
    setSelectedNodeId: () => {},
    deleteNodeById: () => {},
});

export const useNodeDelete = () => useContext(NodeDeleteContext);

const nodeTypes = {
    startEnd: StartEndNode,
    process: ProcessNode,
    data: DataNode,
    decision: DecisionNode,
};

const defaultLabels: Record<NodeType, string> = {
    startEnd: 'Inicio',
    process: 'Proceso',
    data: 'Datos',
    decision: 'Condicion?',
};

// CRÍTICO: los ids de símbolos DEBEN ser únicos para siempre. El antiguo
// contador (`let id = 0; getId()`) se reseteaba en cada recarga, así que
// un símbolo nuevo heredaba el id de uno ya guardado en la BD y borrar
// uno eliminaba ambos (filter n.id !== id). El sello temporal con guion
// nunca colisiona con los `node_N` históricos ni consigo mismo.
let contadorNodos = 0;
const generarIdNodo = (): string =>
    `node-${Date.now().toString(36)}-${(contadorNodos++).toString(36)}`;

function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    selected,
    style = {},
    markerEnd,
    data: edgeData,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isSelected = selected || (edgeData as any)?.selected;

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="edge-label"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
            {isSelected && (
                <EdgeLabelRenderer>
                    <button
                        className="edge-delete-btn"
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
                            pointerEvents: 'all',
                            touchAction: 'none',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            (edgeData as any)?.onDeleteEdge?.(id);
                        }}
                        aria-label="Eliminar flecha"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

const edgeTypes = {
    custom: CustomEdge,
};

const edgeOptions = {
    type: 'custom',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
    style: {
        strokeWidth: 2,
    },
};

// Contador para ids únicos de flechas. CRÍTICO: toda flecha DEBE tener
// id propio; sin él, todas comparten `id: undefined` y borrar una con
// el botón ✕ (filter e.id !== id) elimina TODAS de golpe.
let contadorEdges = 0;
const generarIdEdge = (): string =>
    `edge-${Date.now().toString(36)}-${(contadorEdges++).toString(36)}`;

export interface FlowEditorRef {
    addNodeAtCenter: (type: NodeType) => void;
    getFlowState: () => { nodes: Node[]; edges: Edge[]; viewport?: { x: number; y: number; zoom: number } };
    loadFlowState: (state: { nodes?: Node[]; edges?: Edge[]; viewport?: { x: number; y: number; zoom: number } }) => void;
    /** Resalta el símbolo activo de la ejecución y/o el símbolo con error. */
    setNodeHighlight: (activoId: string | null, errorId?: string | null) => void;
}

interface FlowEditorProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: (nodes: Node[]) => void;
    onEdgesChange: (edges: Edge[]) => void;
    onFlowChange?: () => void;
    /** Modo revisión (profesor): no se puede editar, borrar ni conectar. */
    soloLectura?: boolean;
}

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(
    (
        {
            nodes,
            edges,
            onNodesChange,
            onEdgesChange,
            onFlowChange,
            soloLectura = false,
        },
        ref
    ) => {
        const [internalNodes, setInternalNodes, onNodesChangeInternal] =
            useNodesState(nodes);
        const [internalEdges, setInternalEdges, onEdgesChangeInternal] =
            useEdgesState(edges);
        const reactFlowWrapper = useRef<HTMLDivElement>(null);
        const { screenToFlowPosition, toObject, setViewport } = useReactFlow();
        const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
            null
        );
        const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(
            null
        );

        const deleteEdgeById = useCallback(
            (edgeId: string) => {
                if (soloLectura) return;
                const remainingEdges = internalEdges.filter(
                    (e) => e.id !== edgeId
                );
                setInternalEdges(remainingEdges);
                onEdgesChange(remainingEdges);
                setSelectedEdgeId(null);
                onFlowChange?.();
            },
            [
                internalEdges,
                setInternalEdges,
                onEdgesChange,
                onFlowChange,
                soloLectura,
            ]
        );

        const syncNodes = useCallback(
            (newNodes: Node[]) => {
                setInternalNodes(newNodes);
                onNodesChange(newNodes);
                onFlowChange?.();
            },
            [setInternalNodes, onNodesChange, onFlowChange]
        );

        const syncEdges = useCallback(
            (newEdges: Edge[]) => {
                const edgesWithDelete = newEdges.map((edge) => ({
                    ...edge,
                    data: {
                        ...edge.data,
                        // En solo lectura no hay botón de borrar flecha.
                        onDeleteEdge: soloLectura
                            ? undefined
                            : deleteEdgeById,
                    },
                }));
                setInternalEdges(edgesWithDelete);
                onEdgesChange(edgesWithDelete);
                onFlowChange?.();
            },
            [setInternalEdges, onEdgesChange, deleteEdgeById, onFlowChange, soloLectura]
        );

        const deleteNodeById = useCallback(
            (nodeId: string) => {
                if (soloLectura) return;
                const remainingNodes = internalNodes.filter(
                    (n) => n.id !== nodeId
                );
                const remainingEdges = internalEdges.filter(
                    (e) => e.source !== nodeId && e.target !== nodeId
                );
                syncNodes(remainingNodes);
                syncEdges(remainingEdges);
                setSelectedNodeId(null);
            },
            [internalNodes, internalEdges, syncNodes, syncEdges, soloLectura]
        );

        const loadFlowState = useCallback(
            (state: {
                nodes?: Node[];
                edges?: Edge[];
                viewport?: { x: number; y: number; zoom: number };
            }) => {
                let edgesSanos: Edge[] = Array.isArray(state.edges)
                    ? state.edges
                    : [];
                if (state.nodes && Array.isArray(state.nodes)) {
                    // Blindaje: diagramas antiguos pueden tener ids
                    // DUPLICADOS (el contador node_N se reseteaba en cada
                    // recarga). Al borrar uno morían ambos. Se renombra
                    // cada duplicado y se re-apuntan sus flechas; así el
                    // diagrama existente se repara con la primera carga.
                    const vistos = new Set<string>();
                    const remapeo = new Map<string, string>();
                    const nodosSanos = state.nodes.map((nodo) => {
                        if (!vistos.has(nodo.id)) {
                            vistos.add(nodo.id);
                            return nodo;
                        }
                        const nuevoId = generarIdNodo();
                        remapeo.set(nodo.id, nuevoId);
                        return { ...nodo, id: nuevoId };
                    });
                    if (remapeo.size > 0) {
                        edgesSanos = edgesSanos.map((a) => ({
                            ...a,
                            source: remapeo.get(a.source) ?? a.source,
                            target: remapeo.get(a.target) ?? a.target,
                        }));
                    }
                    setInternalNodes(nodosSanos);
                    onNodesChange(nodosSanos);
                }
                if (Array.isArray(state.edges)) {
                    const edgesWithDelete = edgesSanos.map((edge) => ({
                        ...edge,
                        // Blindaje: flechas guardadas antes del fix pueden
                        // llegar sin id; sin él el borrador las confunde.
                        id: edge.id ?? generarIdEdge(),
                        data: {
                            ...edge.data,
                            onDeleteEdge: soloLectura
                                ? undefined
                                : deleteEdgeById,
                        },
                    }));
                    setInternalEdges(edgesWithDelete);
                    onEdgesChange(edgesWithDelete);
                }
                if (state.viewport) {
                    void setViewport(state.viewport);
                }
            },
            [
                setInternalNodes,
                onNodesChange,
                setInternalEdges,
                onEdgesChange,
                deleteEdgeById,
                setViewport,
            ]
        );

        const getFlowState = useCallback(() => {
            return toObject();
        }, [toObject]);

        const onConnect: OnConnect = useCallback(
            (params) => {
                if (soloLectura) return;
                const sourceNode = internalNodes.find(
                    (n) => n.id === params.source
                );
                let label = '';

                if (sourceNode?.type === 'decision') {
                    if (params.sourceHandle === 'right-source') label = 'Si';
                    if (params.sourceHandle === 'left-source') label = 'No';
                }

                const newEdge = {
                    id: generarIdEdge(),
                    ...params,
                    ...edgeOptions,
                    label,
                    data: { onDeleteEdge: deleteEdgeById },
                };

                const newEdges = addEdge(newEdge, internalEdges);
                syncEdges(newEdges);
            },
            [internalEdges, internalNodes, syncEdges, deleteEdgeById]
        );

        const onNodeDoubleClick = useCallback(
            async (_event: React.MouseEvent, node: Node) => {
                if (soloLectura) return;
                const { value: newLabel, isConfirmed } = await Swal.fire({
                    title: 'Editar Texto del Símbolo',
                    input: 'text',
                    inputValue: (node.data.label as string) || '',
                    inputPlaceholder: 'Escribe el texto o instrucción...',
                    showCancelButton: true,
                    confirmButtonText: 'Guardar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#FF7C02',
                    cancelButtonColor: '#6B7280',
                    customClass: {
                        title: 'titulo-celular',
                        confirmButton: 'btn-semitransparente',
                    },
                    width: '90%',
                    maxWidth: '440px',
                });

                if (
                    isConfirmed &&
                    newLabel !== undefined &&
                    newLabel.trim() !== ''
                ) {
                    const updatedNodes = internalNodes.map((n) =>
                        n.id === node.id
                            ? {
                                  ...n,
                                  data: { ...n.data, label: newLabel.trim() },
                              }
                            : n
                    );
                    syncNodes(updatedNodes);
                }
            },
            [internalNodes, syncNodes]
        );

        const onNodeClick = useCallback(
            (_event: React.MouseEvent, node: Node) => {
                setSelectedNodeId(node.id);
            },
            []
        );

        const onPaneClick = useCallback(() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
        }, []);

        const onEdgeClick = useCallback(
            (_event: React.MouseEvent, edge: Edge) => {
                setSelectedEdgeId(edge.id);
                setSelectedNodeId(null);
            },
            []
        );

        const onNodesDelete: OnNodesDelete = useCallback(
            (deleted) => {
                const deletedIds = deleted.map((n) => n.id);
                const remainingNodes = internalNodes.filter(
                    (n) => !deletedIds.includes(n.id)
                );
                const remainingEdges = internalEdges.filter(
                    (e) =>
                        !deletedIds.includes(e.source) &&
                        !deletedIds.includes(e.target)
                );
                syncNodes(remainingNodes);
                syncEdges(remainingEdges);
            },
            [internalNodes, internalEdges, syncNodes, syncEdges]
        );

        const onEdgesDelete: OnEdgesDelete = useCallback(
            (deleted) => {
                const deletedIds = deleted.map((e) => e.id);
                const remainingEdges = internalEdges.filter(
                    (e) => !deletedIds.includes(e.id)
                );
                syncEdges(remainingEdges);
                if (selectedEdgeId && deletedIds.includes(selectedEdgeId)) {
                    setSelectedEdgeId(null);
                }
            },
            [internalEdges, syncEdges, selectedEdgeId]
        );

        const onDragOver = useCallback((event: React.DragEvent) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        }, []);

        const onDrop = useCallback(
            (event: React.DragEvent) => {
                if (soloLectura) return;
                event.preventDefault();

                const type = event.dataTransfer.getData(
                    'application/reactflow'
                ) as NodeType;
                if (!type || !reactFlowWrapper.current) return;

                const reactFlowBounds =
                    reactFlowWrapper.current.getBoundingClientRect();
                const position = {
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                };

                const newNode: Node = {
                    id: generarIdNodo(),
                    type,
                    position,
                    data: { label: defaultLabels[type], type },
                };

                syncNodes([...internalNodes, newNode]);
            },
            [internalNodes, syncNodes]
        );

        const addNodeAtCenter = useCallback(
            (type: NodeType) => {
                if (!reactFlowWrapper.current) return;

                const bounds = reactFlowWrapper.current.getBoundingClientRect();
                const centerPosition = screenToFlowPosition({
                    x: bounds.width / 2,
                    y: bounds.height / 2,
                });

                const offset = (Math.random() - 0.5) * 60;

                const newNode: Node = {
                    id: generarIdNodo(),
                    type,
                    position: {
                        x: centerPosition.x + offset,
                        y: centerPosition.y + offset,
                    },
                    data: { label: defaultLabels[type], type },
                };

                syncNodes([...internalNodes, newNode]);
            },
            [internalNodes, screenToFlowPosition, syncNodes]
        );

        /** Marca `nodoActivo` / `nodoError` en los data de los nodos internos. */
        const setNodeHighlight = useCallback(
            (activoId: string | null, errorId: string | null = null) => {
                setInternalNodes((nds) =>
                    nds.map((n) => {
                        const data = n.data as Record<string, unknown>;
                        return {
                            ...n,
                            data: {
                                ...data,
                                nodoActivo: n.id === activoId,
                                nodoError: n.id === errorId,
                            },
                        };
                    })
                );
            },
            [setInternalNodes]
        );

        useImperativeHandle(ref, () => ({
            addNodeAtCenter,
            getFlowState,
            loadFlowState,
            setNodeHighlight,
        }));

        const onNodeDragStop = useCallback(() => {
            const currentNodes = toObject().nodes;
            onNodesChange(currentNodes);
            onFlowChange?.();
        }, [toObject, onNodesChange, onFlowChange]);

        const proOptions = useMemo(() => ({ hideAttribution: true }), []);

        const contextValue = useMemo(
            () => ({
                selectedNodeId,
                setSelectedNodeId,
                deleteNodeById,
            }),
            [selectedNodeId, deleteNodeById]
        );

        return (
            <NodeDeleteContext.Provider value={contextValue}>
                <div ref={reactFlowWrapper} className="flow-editor">
                    <ReactFlow
                        nodes={internalNodes}
                        edges={internalEdges}
                        onNodesChange={onNodesChangeInternal}
                        onEdgesChange={onEdgesChangeInternal}
                        onNodeDragStop={onNodeDragStop}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        onNodesDelete={onNodesDelete}
                        onEdgesDelete={onEdgesDelete}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={edgeOptions}
                        fitView
                        deleteKeyCode={
                            soloLectura ? null : ['Delete', 'Backspace']
                        }
                        nodesDraggable={!soloLectura}
                        elementsSelectable={!soloLectura}
                        snapToGrid={!isTouchDevice}
                        snapGrid={[15, 15]}
                        proOptions={proOptions}
                    >
                        <Controls />
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={15}
                            size={1}
                        />
                    </ReactFlow>
                </div>
            </NodeDeleteContext.Provider>
        );
    }
);

export default FlowEditor;
