/** Caja en coordenadas del SVG. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Cada pieza tiene dos posiciones: plano ancho (d) y plano estrecho para móvil (m). */
export interface Placed {
  d: Box;
  m: Box;
}

export type Layout = 'd' | 'm';

/** El tipo decide el icono de la pieza. */
export type NodeKind =
  | 'browser'
  | 'gateway'
  | 'registry'
  | 'service'
  | 'engine'
  | 'db'
  | 'external'
  | 'screen'
  | 'state'
  | 'repo'
  | 'key'
  | 'network'
  | 'server'
  | 'route'
  | 'orm';

export interface DiagramNode extends Placed {
  id: string;
  label: string;
  sub?: string;
  /** Versión corta del subtítulo para el plano de móvil. */
  subM?: string;
  kind: NodeKind;
}

export interface DiagramGroup extends Placed {
  id: string;
  label: string;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  /** x del codo en cada plano, cuando el automático cae encima de otra línea. */
  elbow?: { d?: number; m?: number };
}

/**
 * req: petición. res: respuesta. err: error.
 * self: trabajo dentro de la propia pieza (from === to).
 */
export type MsgKind = 'req' | 'res' | 'err' | 'self';

export interface Msg {
  from: string;
  to: string;
  label: string;
  kind?: MsgKind;
}

export interface Step {
  /** Una frase que cuenta lo que pasa en el paso. */
  text: string;
  msgs: Msg[];
}

export interface Scenario {
  id: string;
  name: string;
  steps: Step[];
}

export interface Diagram {
  title: string;
  repo: string;
  size: { d: [number, number]; m: [number, number] };
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  scenarios: Scenario[];
}

export const msgKind = (m: Msg): MsgKind => (m.from === m.to ? 'self' : (m.kind ?? 'req'));
