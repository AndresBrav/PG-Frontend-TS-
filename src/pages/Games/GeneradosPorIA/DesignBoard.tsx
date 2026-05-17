import { useCallback, useState, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { NodeType } from './types/flow';
import Sidebar from './components/Sidebar';
import FlowEditor, { type FlowEditorRef } from './components/FlowEditor';
import Toolbar from './components/Toolbar';
import './App.css';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

function DesignBoard() {
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
