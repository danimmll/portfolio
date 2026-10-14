/** Caja en coordenadas del viewBox. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Cada pieza se coloca dos veces: en el plano ancho (d) y en el estrecho para móvil (m). */
export interface Placed {
  d: Box;
  m: Box;
}

export interface DiagramNode extends Placed {
  id: string;
  label: string;
  sub?: string;
  /** Subtítulo corto para el plano estrecho, donde la caja es más pequeña. */
  subM?: string;
}

export interface DiagramGroup extends Placed {
  id: string;
  label: string;
}

/**
 * Conexión entre dos piezas. Se traza en ángulo recto; `elbow` fija dónde va el codo
 * cuando el automático se montaría encima de otra línea.
 */
export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  elbow?: { d?: number; m?: number };
}

export interface StepEdge {
  id: string;
  /** El dato vuelve: el punto rojo recorre la línea al revés. */
  back?: boolean;
}

export interface Step {
  title: string;
  text: string;
  why?: string;
  code?: string[];
  /** Tramos que recorre el dato en este paso, en orden. */
  edges?: StepEdge[];
  /** Piezas que trabajan en este paso sin mover datos (procesan, deciden, guardan). */
  nodes?: string[];
}

export interface Scenario {
  id: string;
  name: string;
  summary: string;
  steps: Step[];
}

export interface Diagram {
  title: string;
  size: { d: [number, number]; m: [number, number] };
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  scenarios: Scenario[];
}

export type Layout = 'd' | 'm';
