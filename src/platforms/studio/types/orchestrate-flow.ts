export type OrchestrateNodeKind =
  | 'start'
  | 'visionModel'
  | 'multimodalModel'
  | 'processing'
  | 'judgment'
  | 'end';

export type OrchestratePortType =
  | 'image'
  | 'video'
  | 'text'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'detection'
  | 'trackDetection';

export interface OrchestratePortSchema {
  key: string;
  label: string;
  dataType: OrchestratePortType;
  required?: boolean;
  ref?: string;
}

export interface OrchestrateNodeData {
  kind: OrchestrateNodeKind;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  inputs: OrchestratePortSchema[];
  outputs: OrchestratePortSchema[];
  params: Record<string, string | number | boolean>;
  validationErrors?: string[];
}

export interface OrchestratePaletteItem {
  kind: OrchestrateNodeKind;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

export interface OrchestrateTemplateNode {
  id: string;
  type: 'skillNode';
  position: { x: number; y: number };
  data: OrchestrateNodeData;
}

export interface OrchestrateTemplateEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}
