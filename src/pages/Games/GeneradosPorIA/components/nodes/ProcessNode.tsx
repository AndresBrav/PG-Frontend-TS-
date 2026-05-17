import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface CustomNodeProps {
  selectedNodeId: string | null;
  onDeleteNode: (id: string) => void;
}

function ProcessNode({ data, selected, id, selectedNodeId, onDeleteNode }: NodeProps & CustomNodeProps) {
  const isSelected = selected || selectedNodeId === id;

  return (
    <div className={`node-wrapper ${isSelected ? 'selected' : ''}`}>
      <div className="node-shape process">
        {data.label as string}
      </div>
      {isSelected && (
        <button
          className="node-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(id);
          }}
          aria-label="Eliminar nodo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      )}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
    </div>
  );
}

export default memo(ProcessNode);
