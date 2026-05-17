import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function StartEndNode({ data, selected }: NodeProps) {
  return (
    <div className={`node-wrapper ${selected ? 'selected' : ''}`}>
      <div className="node-shape start-end">
        {data.label as string}
      </div>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}

export default memo(StartEndNode);
