import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { Icon } from '../shared/icon';
import { ICONS } from '../shared/icons';
import { Diagram, Layout, Msg, MsgKind, msgKind } from './diagram.model';
import { EdgeGeometry, ease, pointAt, route } from './geometry';

/** Lo que tarda un mensaje en recorrer una conexión, y un trabajo interno en una pieza. */
const EDGE_MS = 950;
const SELF_MS = 850;

interface Timed {
  msg: Msg;
  kind: MsgKind;
  edgeId?: string;
  reverse: boolean;
  start: number;
  dur: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Pill extends Rect {
  key: string;
  text: string;
  kind: MsgKind;
}

interface Overlay {
  pills: Pill[];
  packets: { key: string; x: number; y: number; kind: MsgKind }[];
  pulses: (Rect & { key: string; p: number })[];
}

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

const PILL = { d: { cw: 6.3, h: 20 }, m: { cw: 5.75, h: 17 } };

@Component({
  selector: 'app-diagram',
  imports: [NgTemplateOutlet, Icon],
  templateUrl: './diagram.html',
  styleUrl: './diagram.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent {
  readonly diagram = input.required<Diagram>();
  /** Prefijo para los ids del SVG, único en la página. */
  readonly uid = input.required<string>();
  /** Estado inicial que llega en la URL: ?escenario=…&paso=… */
  readonly startScenario = input<string | undefined>();
  readonly startStep = input<string | undefined>();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly layouts: Layout[] = ['d', 'm'];
  readonly scenarioIndex = signal(0);
  readonly stepIndex = signal(0);
  readonly playing = signal(false);
  /** Milisegundos desde que empezó el paso. Infinito: recorrido terminado. */
  private readonly elapsed = signal(Number.POSITIVE_INFINITY);
  private seen = false;
  private raf = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly scenario = computed(() => this.diagram().scenarios[this.scenarioIndex()]);
  readonly steps = computed(() => this.scenario().steps);
  readonly step = computed(() => this.steps()[this.stepIndex()]);
  readonly isFirst = computed(() => this.stepIndex() === 0);
  readonly isLast = computed(() => this.stepIndex() === this.steps().length - 1);

  private readonly nodeById = computed(() => new Map(this.diagram().nodes.map((n) => [n.id, n])));

  readonly geometry = computed(() => {
    const dg = this.diagram();
    const byId = this.nodeById();
    const out: Record<Layout, Map<string, EdgeGeometry>> = { d: new Map(), m: new Map() };
    for (const l of this.layouts) {
      for (const e of dg.edges) {
        out[l].set(e.id, route(byId.get(e.from)![l], byId.get(e.to)![l], e.elbow?.[l]));
      }
    }
    return out;
  });

  /** Mensajes del paso con su conexión y su hueco en el tiempo. */
  private readonly timeline = computed(() => {
    const dg = this.diagram();
    let t = 0;
    const items: Timed[] = this.step().msgs.map((msg) => {
      const kind = msgKind(msg);
      let edgeId: string | undefined;
      let reverse = false;
      if (kind !== 'self') {
        const fwd = dg.edges.find((e) => e.from === msg.from && e.to === msg.to);
        const back = fwd ? undefined : dg.edges.find((e) => e.from === msg.to && e.to === msg.from);
        edgeId = (fwd ?? back)?.id;
        reverse = !fwd && !!back;
      }
      const dur = kind === 'self' ? SELF_MS : EDGE_MS;
      const item = { msg, kind, edgeId, reverse, start: t, dur };
      t += dur;
      return item;
    });
    return { items, total: t };
  });

  /** Piezas y conexiones que usa el flujo elegido: el resto se atenúa. */
  readonly parts = computed(() => {
    const dg = this.diagram();
    const nodes = new Set<string>();
    const edges = new Set<string>();
    for (const s of this.steps()) {
      for (const m of s.msgs) {
        nodes.add(m.from);
        nodes.add(m.to);
        const e = dg.edges.find(
          (x) => (x.from === m.from && x.to === m.to) || (x.from === m.to && x.to === m.from),
        );
        if (e) edges.add(e.id);
      }
    }
    return { nodes, edges };
  });

  readonly litEdges = computed(() => {
    const t = this.elapsed();
    const lit = new Map<string, MsgKind>();
    for (const it of this.timeline().items)
      if (it.edgeId && t >= it.start) lit.set(it.edgeId, it.kind);
    return lit;
  });

  readonly activeNodes = computed(() => {
    const t = this.elapsed();
    const on = new Set<string>();
    for (const it of this.timeline().items) {
      if (t >= it.start) {
        on.add(it.msg.from);
        on.add(it.msg.to);
      }
    }
    return on;
  });

  readonly overlay = computed<Record<Layout, Overlay>>(() => {
    const t = this.elapsed();
    return { d: this.buildOverlay('d', t), m: this.buildOverlay('m', t) };
  });

  constructor() {
    // Estado inicial desde la URL.
    effect(() => {
      const dg = this.diagram();
      const sid = this.startScenario();
      const n = Number(this.startStep());
      untracked(() => {
        const si = Math.max(
          0,
          dg.scenarios.findIndex((s) => s.id === sid),
        );
        this.scenarioIndex.set(si);
        const max = dg.scenarios[si].steps.length;
        this.stepIndex.set(Number.isInteger(n) && n >= 1 && n <= max ? n - 1 : 0);
      });
    });

    // Cada paso nuevo arranca su recorrido, si el diagrama ya se ha visto.
    effect(() => {
      this.step();
      untracked(() => {
        if (this.seen) this.travel();
      });
    });

    // Reproducción automática: espera al recorrido y deja tiempo para leer la frase.
    effect(() => {
      const playing = this.playing();
      const { total } = this.timeline();
      clearTimeout(this.timer);
      if (!playing || !this.isBrowser) return;
      this.timer = setTimeout(() => {
        if (this.isLast()) this.playing.set(false);
        else this.stepIndex.update((i) => i + 1);
      }, total + 2600);
    });

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.seen = true;
            this.travel();
            io.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => io.disconnect());
    });

    this.destroyRef.onDestroy(() => {
      if (!this.isBrowser) return;
      cancelAnimationFrame(this.raf);
      clearTimeout(this.timer);
    });
  }

  selectScenario(index: number): void {
    if (index === this.scenarioIndex()) return;
    this.scenarioIndex.set(index);
    this.stepIndex.set(0);
    this.playing.set(false);
  }

  goTo(index: number): void {
    if (index === this.stepIndex()) this.travel();
    else this.stepIndex.set(index);
  }

  previous(): void {
    if (!this.isFirst()) this.stepIndex.update((i) => i - 1);
  }

  next(): void {
    if (!this.isLast()) this.stepIndex.update((i) => i + 1);
  }

  togglePlay(): void {
    if (this.playing()) {
      this.playing.set(false);
      return;
    }
    this.seen = true;
    if (this.isLast()) this.stepIndex.set(0);
    else this.travel();
    this.playing.set(true);
  }

  asLayout(l: unknown): Layout {
    return l === 'm' ? 'm' : 'd';
  }

  iconOf(kind: string): string {
    return (ICONS as Record<string, string>)[kind === 'external' ? 'cloud' : kind] ?? ICONS.service;
  }

  private travel(): void {
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.raf);
    const total = this.timeline().total;
    if (total === 0 || prefersReducedMotion()) {
      this.elapsed.set(Number.POSITIVE_INFINITY);
      return;
    }
    this.elapsed.set(0);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = now - t0;
      if (t >= total) {
        this.elapsed.set(Number.POSITIVE_INFINITY);
        return;
      }
      this.elapsed.set(t);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  /** Paquetes en marcha y etiquetas aparcadas sin tapar piezas ni otras etiquetas. */
  private buildOverlay(l: Layout, t: number): Overlay {
    const dg = this.diagram();
    const geo = this.geometry()[l];
    const [W, H] = dg.size[l];
    const { cw, h } = PILL[l];
    const byId = this.nodeById();
    const out: Overlay = { pills: [], packets: [], pulses: [] };
    // Las piezas y los títulos de los grupos no se tapan.
    const obstacles: Rect[] = [
      ...dg.nodes.map((n) => n[l]),
      ...(dg.groups ?? []).map((g) => ({
        x: g[l].x + 8,
        y: g[l].y + 6,
        w: g.label.length * 6.6 + 12,
        h: 22,
      })),
    ];

    const fit = (x: number, y: number, w: number) => ({
      x: Math.min(Math.max(x, w / 2 + 2), W - w / 2 - 2),
      y: Math.min(Math.max(y, h / 2 + 2), H - h / 2 - 2),
    });

    const place = (cands: { x: number; y: number }[], w: number) => {
      let best = fit(cands[0].x, cands[0].y, w);
      let bestScore = Number.POSITIVE_INFINITY;
      for (const c of cands) {
        const pos = fit(c.x, c.y, w);
        const r = { x: pos.x - w / 2 - 3, y: pos.y - h / 2 - 3, w: w + 6, h: h + 6 };
        let score = 0;
        for (const o of obstacles) score += overlap(r, o);
        if (score < bestScore) {
          best = pos;
          bestScore = score;
          if (score === 0) break;
        }
      }
      obstacles.push({ x: best.x - w / 2, y: best.y - h / 2, w, h });
      return best;
    };

    this.timeline().items.forEach((it, i) => {
      if (t < it.start) return;
      const done = t >= it.start + it.dur;
      const p = done ? 1 : ease((t - it.start) / it.dur);
      const w = it.msg.label.length * cw + 16;
      const toPill = (pos: { x: number; y: number }): Pill => ({
        key: `l${i}`,
        x: pos.x - w / 2,
        y: pos.y - h / 2,
        w,
        h,
        text: it.msg.label,
        kind: it.kind,
      });

      if (it.kind === 'self') {
        const b = byId.get(it.msg.from)![l];
        const cx = b.x + b.w / 2;
        const above = b.y - h / 2 - 6;
        const below = b.y + b.h + h / 2 + 6;
        const pos = place(
          [
            { x: cx, y: above },
            { x: cx, y: below },
            { x: cx, y: above - h - 4 },
            { x: cx, y: below + h + 4 },
            { x: b.x + b.w + w / 2 + 8, y: b.y + b.h / 2 },
            { x: b.x - w / 2 - 8, y: b.y + b.h / 2 },
          ],
          w,
        );
        out.pills.push(toPill(pos));
        if (!done) out.pulses.push({ key: `p${i}`, x: b.x, y: b.y, w: b.w, h: b.h, p });
        return;
      }

      if (!it.edgeId) return;
      const g = geo.get(it.edgeId)!;
      if (!done) {
        const pt = pointAt(g, it.reverse ? 1 - p : p);
        out.packets.push({ key: `k${i}`, x: pt.x, y: pt.y, kind: it.kind });
        out.pills.push(toPill(fit(pt.x, pt.y - h / 2 - 10, w)));
        return;
      }

      const edge = dg.edges.find((e) => e.id === it.edgeId)!;
      const a = byId.get(edge.from)![l];
      const b = byId.get(edge.to)![l];
      const cands: { x: number; y: number }[] = [];
      const segs = g.pts
        .slice(1)
        .map((q, j) => ({ a: g.pts[j], b: q, len: Math.hypot(q.x - g.pts[j].x, q.y - g.pts[j].y) }))
        .sort((s1, s2) => s2.len - s1.len);
      for (const sg of segs) {
        const horizontal = sg.a.y === sg.b.y;
        for (const f of [0.5, 0.3, 0.7]) {
          const x = sg.a.x + (sg.b.x - sg.a.x) * f;
          const y = sg.a.y + (sg.b.y - sg.a.y) * f;
          if (horizontal) cands.push({ x, y: y - h / 2 - 5 }, { x, y: y + h / 2 + 5 });
          else cands.push({ x, y }, { x: x + w / 2 + 7, y }, { x: x - w / 2 - 7, y });
        }
      }
      cands.push(
        { x: g.labelAt.x, y: Math.min(a.y, b.y) - h / 2 - 6 },
        { x: g.labelAt.x, y: Math.max(a.y + a.h, b.y + b.h) + h / 2 + 6 },
      );
      out.pills.push(toPill(place(cands, w)));
    });

    return out;
  }
}

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
