import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function ProcessNode({ data, selected }: NodeProps) {
  return (
    <div className={`node-wrapper ${selected ? 'selected' : ''}`}>
      <div className="node-shape process">
        {data.label as string}
      </div>
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
