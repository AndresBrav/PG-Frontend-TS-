import { useCallback, useRef, useMemo, useImperativeHandle, forwardRef, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StartEndNode, ProcessNode, DataNode, DecisionNode } from './nodes';
import type { NodeType } from '../types/flow';

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

let id = 0;
const getId = () => `node_${id++}`;

const edgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
};

export interface FlowEditorRef {
  addNodeAtCenter: (type: NodeType) => void;
}

interface FlowEditorProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(
  ({ nodes, edges, onNodesChange, onEdgesChange }, ref) => {
    const [internalNodes, setInternalNodes, onNodesChangeInternal] = useNodesState(nodes);
    const [internalEdges, setInternalEdges, onEdgesChangeInternal] = useEdgesState(edges);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const syncNodes = useCallback((newNodes: Node[]) => {
      setInternalNodes(newNodes);
      onNodesChange(newNodes);
    }, [setInternalNodes, onNodesChange]);

    const syncEdges = useCallback((newEdges: Edge[]) => {
      setInternalEdges(newEdges);
      onEdgesChange(newEdges);
    }, [setInternalEdges, onEdgesChange]);

    const onConnect: OnConnect = useCallback(
      (params) => {
        const sourceNode = internalNodes.find((n) => n.id === params.source);
        let label = '';

        if (sourceNode?.type === 'decision') {
          if (params.sourceHandle === 'right-source') label = 'Si';
          if (params.sourceHandle === 'left-source') label = 'No';
        }

        const newEdge = {
          ...params,
          ...edgeOptions,
          label,
        };

        const newEdges = addEdge(newEdge, internalEdges);
        syncEdges(newEdges);
      },
      [internalEdges, internalNodes, syncEdges]
    );

    const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
      const newLabel = prompt('Editar texto del nodo:', node.data.label as string);
      if (newLabel !== null && newLabel.trim() !== '') {
        const updatedNodes = internalNodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label: newLabel.trim() } } : n
        );
        syncNodes(updatedNodes);
      }
    }, [internalNodes, syncNodes]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
      setSelectedNodeId(null);
    }, []);

    const deleteNodeById = useCallback((nodeId: string) => {
      const remainingNodes = internalNodes.filter((n) => n.id !== nodeId);
      const remainingEdges = internalEdges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      syncNodes(remainingNodes);
      syncEdges(remainingEdges);
      setSelectedNodeId(null);
    }, [internalNodes, internalEdges, syncNodes, syncEdges]);

    const onNodesDelete: OnNodesDelete = useCallback(
      (deleted) => {
        const deletedIds = deleted.map((n) => n.id);
        const remainingNodes = internalNodes.filter((n) => !deletedIds.includes(n.id));
        const remainingEdges = internalEdges.filter(
          (e) => !deletedIds.includes(e.source) && !deletedIds.includes(e.target)
        );
        syncNodes(remainingNodes);
        syncEdges(remainingEdges);
      },
      [internalNodes, internalEdges, syncNodes, syncEdges]
    );

    const onEdgesDelete: OnEdgesDelete = useCallback(
      (deleted) => {
        const deletedIds = deleted.map((e) => e.id);
        const remainingEdges = internalEdges.filter((e) => !deletedIds.includes(e.id));
        syncEdges(remainingEdges);
      },
      [internalEdges, syncEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();

        const type = event.dataTransfer.getData('application/reactflow') as NodeType;
        if (!type || !reactFlowWrapper.current) return;

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: { label: defaultLabels[type], type },
        };

        syncNodes([...internalNodes, newNode]);
      },
      [internalNodes, syncNodes]
    );

    const addNodeAtCenter = useCallback((type: NodeType) => {
      if (!reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerPosition = screenToFlowPosition({
        x: bounds.width / 2,
        y: bounds.height / 2,
      });

      const offset = (Math.random() - 0.5) * 60;

      const newNode: Node = {
        id: getId(),
        type,
        position: {
          x: centerPosition.x + offset,
          y: centerPosition.y + offset,
        },
        data: { label: defaultLabels[type], type },
      };

      syncNodes([...internalNodes, newNode]);
    }, [internalNodes, screenToFlowPosition, syncNodes]);

    useImperativeHandle(ref, () => ({
      addNodeAtCenter,
    }));

    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    const nodeTypesWithProps = useMemo(() => ({
      startEnd: (props: any) => <StartEndNode {...props} selectedNodeId={selectedNodeId} onDeleteNode={deleteNodeById} />,
      process: (props: any) => <ProcessNode {...props} selectedNodeId={selectedNodeId} onDeleteNode={deleteNodeById} />,
      data: (props: any) => <DataNode {...props} selectedNodeId={selectedNodeId} onDeleteNode={deleteNodeById} />,
      decision: (props: any) => <DecisionNode {...props} selectedNodeId={selectedNodeId} onDeleteNode={deleteNodeById} />,
    }), [selectedNodeId, deleteNodeById]);

    return (
      <div ref={reactFlowWrapper} className="flow-editor">
        <ReactFlow
          nodes={internalNodes}
          edges={internalEdges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChangeInternal}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypesWithProps}
          defaultEdgeOptions={edgeOptions}
          fitView
          deleteKeyCode={["Delete", "Backspace"]}
          snapToGrid
          snapGrid={[15, 15]}
          proOptions={proOptions}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        </ReactFlow>
      </div>
    );
  }
);

export default FlowEditor;
