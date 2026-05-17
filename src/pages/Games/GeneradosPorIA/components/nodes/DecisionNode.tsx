import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function DecisionNode({ data, selected }: NodeProps) {
  return (
    <div className={`node-wrapper decision-wrapper ${selected ? 'selected' : ''}`}>
      <div className="node-shape decision">
        <span className="node-label">{data.label as string}</span>
      </div>
      <span className="decision-label no-label">NO</span>
      <span className="decision-label yes-label">SI</span>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
    </div>
  );
}

export default memo(DecisionNode);
