import type { Node, Edge } from '@xyflow/react';
import type { FlowExport } from '../types/flow';

interface ToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onClear: () => void;
}

function Toolbar({ nodes, edges, onClear }: ToolbarProps) {
  const handleExport = () => {
    const exportData: FlowExport = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type || '',
        position: node.position,
        data: node.data as FlowExport['nodes'][0]['data'],
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        label: edge.label as string | undefined,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="toolbar">
      <h2>Flowchart Editor</h2>
      <div className="toolbar-actions">
        <button className="btn btn-export" onClick={handleExport}>
          Exportar JSON
        </button>
        <button className="btn btn-clear" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
