import { Box } from './diagram.model';

export interface Pt {
  x: number;
  y: number;
}

export interface EdgeGeometry {
  pts: Pt[];
  d: string;
  length: number;
  /** Centro del tramo más largo: ahí se aparcan las etiquetas de los mensajes. */
  labelAt: Pt;
}

export const center = (b: Box): Pt => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/**
 * Traza una conexión en ángulo recto entre dos cajas: recta si están alineadas, con un
 * codo si no. `elbow` fija la x del codo cuando el automático cae encima de otra línea.
 */
export function route(a: Box, b: Box, elbow?: number): EdgeGeometry {
  const ca = center(a);
  const cb = center(b);
  const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  let pts: Pt[];

  if (xOverlap > 0) {
    const x = (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2;
    const down = cb.y > ca.y;
    pts = [
      { x, y: down ? a.y + a.h : a.y },
      { x, y: down ? b.y : b.y + b.h },
    ];
  } else {
    const right = cb.x > ca.x;
    const sx = right ? a.x + a.w : a.x;
    const tx = right ? b.x : b.x + b.w;
    const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (yOverlap > 0) {
      const y = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2;
      pts = [
        { x: sx, y },
        { x: tx, y },
      ];
    } else {
      const mx = elbow ?? (sx + tx) / 2;
      pts = [
        { x: sx, y: ca.y },
        { x: mx, y: ca.y },
        { x: mx, y: cb.y },
        { x: tx, y: cb.y },
      ];
    }
  }

  let length = 0;
  let longest = 0;
  let labelAt = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    length += seg;
    if (seg > longest) {
      longest = seg;
      labelAt = { x: (pts[i].x + pts[i - 1].x) / 2, y: (pts[i].y + pts[i - 1].y) / 2 };
    }
  }

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)} ${round(p.y)}`).join(' ');
  return { pts, d, length, labelAt };
}

/** Punto a una fracción `t` (0–1) del recorrido. */
export function pointAt(geo: EdgeGeometry, t: number): Pt {
  let remaining = Math.min(Math.max(t, 0), 1) * geo.length;
  for (let i = 1; i < geo.pts.length; i++) {
    const a = geo.pts[i - 1];
    const b = geo.pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= seg || i === geo.pts.length - 1) {
      const k = seg === 0 ? 0 : Math.min(remaining / seg, 1);
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    remaining -= seg;
  }
  return geo.pts[geo.pts.length - 1];
}

export const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

const round = (n: number) => Math.round(n * 10) / 10;
