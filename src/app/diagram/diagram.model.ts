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

/** Lo que cuenta el inspector cuando pulsas una pieza. */
export interface NodeInfo {
  what: string;
  tech: string[];
  points?: string[];
  /** Carpeta o fichero en el repositorio. */
  path?: string;
}

export interface DiagramNode extends Placed {
  id: string;
  label: string;
  sub?: string;
  /** Versión corta del subtítulo para el plano de móvil. */
  subM?: string;
  kind: NodeKind;
  info: NodeInfo;
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
 * req: petición. res: respuesta correcta. err: respuesta de error.
 * self: trabajo dentro de la propia pieza (from === to).
 */
export type MsgKind = 'req' | 'res' | 'err' | 'self';

export interface Msg {
  from: string;
  to: string;
  label: string;
  kind?: MsgKind;
}

export type CodeLang = 'java' | 'ts' | 'js' | 'yaml' | 'sql' | 'http' | 'json';

export interface CodeRef {
  file: string;
  path: string;
  lang: CodeLang;
  /** Primera línea del fragmento en el fichero original. */
  start: number;
  code: string;
  url: string;
}

export interface Step {
  title: string;
  text: string;
  why?: string;
  msgs: Msg[];
  code?: CodeRef;
  /** Petición o respuesta HTTP de ejemplo, tal y como viajaría. */
  http?: string;
}

export interface Scenario {
  id: string;
  name: string;
  summary: string;
  /** Los escenarios de fallo se marcan en rojo. */
  tone?: 'error';
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
