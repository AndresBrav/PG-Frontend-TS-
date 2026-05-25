import { useCallback, useState, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useLocation } from 'react-router-dom';
import type { Node, Edge } from '@xyflow/react';
import type { NodeType } from './types/flow';
import Sidebar from './components/Sidebar';
import FlowEditor, { type FlowEditorRef } from './components/FlowEditor';
import Toolbar from './components/Toolbar';
import './App.css';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

interface LocationState {
    juegoId?: number;
    juegoDescripcion?: string;
}

function DesignBoard() {
    const location = useLocation();
    const { juegoId, juegoDescripcion } =
        (location.state as LocationState) || {};
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const flowEditorRef = useRef<FlowEditorRef>(null);

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
    };

    return (
        <ReactFlowProvider>
            <div className="app">
                <Toolbar nodes={nodes} edges={edges} onClear={handleClear} />
                <div
                    style={{
                        padding: '0px',
                        margin: '10px',
                        backgroundColor: 'rgba(217, 217, 217, 0.3)',
                        borderRadius: '10px',
                        borderLeft: '4px solid #FF7C02',
                    }}
                >
                    {/* <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        Ejercicio ID: {juegoId || 'No especificado'}
                    </h3> */}
                    <p
                        style={{
                            margin: '0',
                            color: '#ffffff',
                            lineHeight: '1.6',
                            fontSize: '16px',
                        }}
                    >
                        {juegoDescripcion || 'No hay descripción disponible'}
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
                />
            </div>
        </ReactFlowProvider>
    );
}

export default DesignBoard;
