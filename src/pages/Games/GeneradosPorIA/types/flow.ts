export type NodeType = 'startEnd' | 'process' | 'data' | 'decision';

export interface FlowNodeData {
  label: string;
  type: NodeType;
  [key: string]: unknown;
}

export interface FlowExport {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: FlowNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle: string | null;
    targetHandle: string | null;
    label?: string;
  }>;
}
