import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Location, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { Icon } from '../shared/icon';
import { ICONS } from '../shared/icons';
import { Diagram, DiagramNode, Layout, Msg, MsgKind, NodeKind, msgKind } from './diagram.model';
import { EdgeGeometry, ease, pointAt, route } from './geometry';
import { Tok, highlight } from './highlight';

/** Lo que tarda un mensaje en recorrer una conexión, y un trabajo interno en una pieza. */
const EDGE_MS = 950;
const SELF_MS = 850;

export type View = 'arch' | 'seq';
type Tab = 'code' | 'http';

interface Timed {
  msg: Msg;
  kind: MsgKind;
  edgeId?: string;
  reverse: boolean;
  start: number;
  dur: number;
}

interface Pill {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  kind: MsgKind;
  moving: boolean;
}

interface Packet {
  key: string;
  x: number;
  y: number;
  kind: MsgKind;
}

interface Pulse {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  kind: MsgKind;
}

interface Overlay {
  pills: Pill[];
  packets: Packet[];
  pulses: Pulse[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

const PILL = {
  d: { cw: 6.3, h: 20, font: 10.5 },
  m: { cw: 5.75, h: 17, font: 9.5 },
};

@Component({
  selector: 'app-diagram',
  imports: [NgTemplateOutlet, Icon],
  templateUrl: './diagram.html',
  styleUrl: './diagram.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKey($event)' },
})
export class DiagramComponent {
  readonly diagram = input.required<Diagram>();
  /** Prefijo para los ids del SVG, único en la página. */
  readonly uid = input.required<string>();
  /** Estado inicial que llega en la URL: ?escenario=…&paso=…&vista=secuencia */
  readonly startScenario = input<string | undefined>();
  readonly startStep = input<string | undefined>();
  readonly startView = input<string | undefined>();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly location = inject(Location);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly layouts: Layout[] = ['d', 'm'];
  readonly scenarioIndex = signal(0);
  readonly stepIndex = signal(0);
  readonly view = signal<View>('arch');
  readonly playing = signal(false);
  readonly selectedId = signal<string | null>(null);
  private readonly tabPref = signal<Tab>('code');
  /** El código de cada paso va plegado; si lo abres, se queda abierto al cambiar de paso. */
  readonly showCode = signal(false);
  private lastFlow = 0;
  /** Milisegundos desde que empezó el paso. Infinito: recorrido terminado (estado estático). */
  private readonly elapsed = signal(Number.POSITIVE_INFINITY);
  private seen = false;

  readonly scenario = computed(() => this.diagram().scenarios[this.scenarioIndex()]);
  readonly steps = computed(() => this.scenario().steps);
  readonly step = computed(() => this.steps()[this.stepIndex()]);
  readonly isFirst = computed(() => this.stepIndex() === 0);
  readonly isLast = computed(() => this.stepIndex() === this.steps().length - 1);

  readonly nodeById = computed(() => new Map(this.diagram().nodes.map((n) => [n.id, n])));
  readonly selected = computed(() => {
    const id = this.selectedId();
    return id ? (this.nodeById().get(id) ?? null) : null;
  });

  /** Geometría de cada conexión en los dos planos. */
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
  readonly timeline = computed(() => {
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

  /** Piezas y conexiones que toca el escenario: el resto se atenúa. */
  readonly scenarioParts = computed(() => {
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

  /** Conexiones encendidas en este instante, con el tipo del último mensaje que pasó. */
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

  /** Vista de secuencia: una línea de vida por pieza, en el orden en que aparecen. */
  readonly seq = computed(() => {
    const sc = this.scenario();
    const byId = this.nodeById();
    const ids: string[] = [];
    for (const s of sc.steps)
      for (const m of s.msgs) for (const id of [m.from, m.to]) if (!ids.includes(id)) ids.push(id);

    const colW = Math.round(Math.min(172, Math.max(118, 1040 / ids.length)));
    const padL = 56;
    const headY = 14;
    const headH = 46;
    const x = (id: string) => padL + ids.indexOf(id) * colW + colW / 2;

    let y = headY + headH + 40;
    const rows: {
      key: string;
      step: number;
      order: number;
      d: string;
      lx: number;
      ly: number;
      anchor: 'start' | 'middle';
      text: string;
      kind: MsgKind;
    }[] = [];
    const marks: { step: number; y: number; y2: number }[] = [];

    sc.steps.forEach((s, si) => {
      const first = y;
      s.msgs.forEach((m, mi) => {
        const kind = msgKind(m);
        const x1 = x(m.from);
        const x2 = x(m.to);
        if (kind === 'self') {
          rows.push({
            key: `${si}-${mi}`,
            step: si,
            order: mi,
            d: `M${x1 + 5} ${y - 8} h28 v16 h-24`,
            lx: x1 + 40,
            ly: y + 4,
            anchor: 'start',
            text: m.label,
            kind,
          });
        } else {
          const dir = x2 > x1 ? 1 : -1;
          rows.push({
            key: `${si}-${mi}`,
            step: si,
            order: mi,
            d: `M${x1 + dir * 5} ${y} H${x2 - dir * 7}`,
            lx: (x1 + x2) / 2,
            ly: y - 8,
            anchor: 'middle',
            text: m.label,
            kind,
          });
        }
        y += 38;
      });
      marks.push({ step: si, y: first, y2: y - 38 });
      y += 16;
    });

    return {
      heads: ids.map((id) => ({ id, x: x(id), node: byId.get(id)! })),
      rows,
      marks,
      colW,
      headY,
      headH,
      width: padL + ids.length * colW + 8,
      height: y + 4,
    };
  });

  readonly stepNodesSeq = computed(() => {
    const on = new Set<string>();
    for (const m of this.step().msgs) {
      on.add(m.from);
      on.add(m.to);
    }
    return on;
  });

  readonly tabs = computed(() => {
    const s = this.step();
    const tabs: Tab[] = [];
    if (s.code) tabs.push('code');
    if (s.http) tabs.push('http');
    return tabs;
  });

  readonly tab = computed<Tab | undefined>(() => {
    const pref = this.tabPref();
    const tabs = this.tabs();
    return tabs.includes(pref) ? pref : tabs[0];
  });

  /** Flujos normales (pestañas) y fallos provocados (interruptores), con su índice real. */
  readonly flows = computed(() =>
    this.diagram()
      .scenarios.map((s, i) => ({ s, i }))
      .filter((x) => !x.s.fault),
  );

  readonly faults = computed(() =>
    this.diagram()
      .scenarios.map((s, i) => ({ s, i }))
      .filter((x) => !!x.s.fault),
  );

  readonly isFault = computed(() => !!this.scenario().fault);

  readonly codeLines = computed(() => {
    const c = this.step().code;
    return c ? highlight(c.code, c.lang) : [];
  });

  readonly httpLines = computed(() => {
    const h = this.step().http;
    return h ? highlight(h, 'http') : [];
  });

  private raf = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly seqScroll = viewChild<ElementRef<HTMLElement>>('seqScroll');

  constructor() {
    // Estado inicial desde la URL.
    effect(() => {
      const dg = this.diagram();
      const sid = this.startScenario();
      const pstep = this.startStep();
      const v = this.startView();
      untracked(() => {
        const si = Math.max(
          0,
          dg.scenarios.findIndex((s) => s.id === sid),
        );
        this.scenarioIndex.set(si);
        const n = Number(pstep);
        const max = dg.scenarios[si].steps.length;
        this.stepIndex.set(Number.isInteger(n) && n >= 1 && n <= max ? n - 1 : 0);
        this.view.set(v === 'secuencia' ? 'seq' : 'arch');
      });
    });

    // Cada paso nuevo arranca su recorrido (si el diagrama ya se ha visto).
    effect(() => {
      this.step();
      untracked(() => {
        if (this.seen) this.travel();
      });
    });

    // Reproducción automática.
    effect(() => {
      const playing = this.playing();
      const { total } = this.timeline();
      const s = this.step();
      clearTimeout(this.timer);
      if (!playing || !this.isBrowser) return;
      const reading = Math.max(3800, (s.text.length + (s.why?.length ?? 0)) * 28);
      this.timer = setTimeout(() => {
        if (this.isLast()) this.playing.set(false);
        else this.stepIndex.update((i) => i + 1);
      }, total + reading);
    });

    // En la vista de secuencia, desplaza el scroll horizontal hasta las filas del paso actual.
    afterRenderEffect(() => {
      this.stepIndex();
      this.scenarioIndex();
      const el = this.seqScroll()?.nativeElement;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      const rows = el.querySelectorAll<SVGGElement>('.row.is-current .row-line');
      if (!rows.length) return;
      let left = Number.POSITIVE_INFINITY;
      let right = 0;
      rows.forEach((r) => {
        const b = r.getBoundingClientRect();
        left = Math.min(left, b.left);
        right = Math.max(right, b.right);
      });
      const box = el.getBoundingClientRect();
      if (left >= box.left + 8 && right <= box.right - 8) return;
      el.scrollTo({
        left: el.scrollLeft + (left - box.left) - 48,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
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

  // ——— Acciones ———

  selectScenario(index: number): void {
    if (index === this.scenarioIndex()) return;
    if (!this.diagram().scenarios[index].fault) this.lastFlow = index;
    this.scenarioIndex.set(index);
    this.stepIndex.set(0);
    this.playing.set(false);
    this.syncUrl();
  }

  /** Activa un fallo y lo reproduce; si ya estaba activo, vuelve al último flujo normal. */
  toggleFault(index: number): void {
    if (index === this.scenarioIndex()) {
      this.selectScenario(this.lastFlow);
      return;
    }
    this.selectScenario(index);
    this.seen = true;
    this.travel();
    this.playing.set(true);
  }

  toggleCode(): void {
    this.showCode.update((v) => !v);
  }

  onKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[role="tablist"], [role="switch"], input')) return;
    if (event.key === 'Escape' && this.selectedId()) {
      this.selectedId.set(null);
      return;
    }
    if (event.key === 'ArrowRight' && !target.closest('pre')) {
      event.preventDefault();
      this.next();
    }
    if (event.key === 'ArrowLeft' && !target.closest('pre')) {
      event.preventDefault();
      this.previous();
    }
  }

  goTo(index: number): void {
    if (index === this.stepIndex()) {
      this.travel();
      return;
    }
    this.stepIndex.set(index);
    this.syncUrl();
  }

  previous(): void {
    if (this.isFirst()) return;
    this.stepIndex.update((i) => i - 1);
    this.syncUrl();
  }

  next(): void {
    if (this.isLast()) return;
    this.stepIndex.update((i) => i + 1);
    this.syncUrl();
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

  setView(v: View): void {
    if (v === this.view()) return;
    this.view.set(v);
    this.selectedId.set(null);
    this.syncUrl();
  }

  setTab(t: Tab): void {
    this.tabPref.set(t);
  }

  toggleNode(id: string): void {
    this.selectedId.update((cur) => (cur === id ? null : id));
  }

  // ——— Ayudas para la plantilla ———

  asLayout(l: unknown): Layout {
    return l === 'm' ? 'm' : 'd';
  }

  iconOf(kind: NodeKind | string): string {
    return (ICONS as Record<string, string>)[kind === 'external' ? 'cloud' : kind] ?? ICONS.service;
  }

  repoLink(path: string): string {
    const kind = /\.[a-z]+$/i.test(path) ? 'blob' : 'tree';
    return `${this.diagram().repo}/${kind}/main/${path}`;
  }

  nodeName(id: string): string {
    return this.nodeById().get(id)?.label ?? id;
  }

  tabLabel(t: Tab): string {
    return t === 'code' ? (this.step().code?.file ?? 'Código') : 'HTTP de ejemplo';
  }

  trackTok(_: number, tok: Tok): string {
    return tok.t;
  }

  kindLabel(kind: MsgKind): string {
    return { req: 'Petición', res: 'Respuesta', err: 'Error', self: 'Trabajo interno' }[kind];
  }

  msgKindOf(m: Msg): MsgKind {
    return msgKind(m);
  }

  nodeAria(n: DiagramNode): string {
    return `${n.label}. Ver qué hace esta pieza.`;
  }

  // ——— Animación ———

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

  private buildOverlay(l: Layout, t: number): Overlay {
    const dg = this.diagram();
    const geo = this.geometry()[l];
    const [W, H] = dg.size[l];
    const { cw, h } = PILL[l];
    const byId = this.nodeById();
    const pills: Pill[] = [];
    const packets: Packet[] = [];
    const pulses: Pulse[] = [];
    // Las etiquetas aparcadas no pueden tapar piezas ni otras etiquetas.
    const obstacles: Rect[] = dg.nodes.map((n) => n[l]);

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
      const base = { w, h, text: it.msg.label, kind: it.kind };

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
        pills.push({ key: `s${i}`, ...pos, moving: !done, ...base });
        if (!done) pulses.push({ key: `p${i}`, x: b.x, y: b.y, w: b.w, h: b.h, p, kind: it.kind });
        return;
      }

      if (!it.edgeId) return;
      const g = geo.get(it.edgeId)!;
      if (!done) {
        const pt = pointAt(g, it.reverse ? 1 - p : p);
        packets.push({ key: `k${i}`, x: pt.x, y: pt.y, kind: it.kind });
        pills.push({ key: `e${i}`, ...fit(pt.x, pt.y - h / 2 - 10, w), moving: true, ...base });
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
          if (horizontal) {
            cands.push({ x, y: y - h / 2 - 5 }, { x, y: y + h / 2 + 5 });
          } else {
            cands.push({ x, y }, { x: x + w / 2 + 7, y }, { x: x - w / 2 - 7, y });
          }
        }
      }
      const mid = g.labelAt.x;
      cands.push(
        { x: mid, y: Math.min(a.y, b.y) - h / 2 - 6 },
        { x: mid, y: Math.max(a.y + a.h, b.y + b.h) + h / 2 + 6 },
      );
      pills.push({ key: `e${i}`, ...place(cands, w), moving: false, ...base });
    });

    return { pills, packets, pulses };
  }

  private syncUrl(): void {
    if (!this.isBrowser) return;
    const params = new URLSearchParams();
    params.set('escenario', this.scenario().id);
    params.set('paso', String(this.stepIndex() + 1));
    if (this.view() === 'seq') params.set('vista', 'secuencia');
    const path = this.location.path().split('?')[0].split('#')[0];
    this.location.replaceState(path, params.toString());
  }
}

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
