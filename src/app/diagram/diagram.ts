import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { Diagram, Layout, Step } from './diagram.model';
import { EdgeGeometry, Pt, pointAt, route } from './geometry';

/** Lo que tarda el punto rojo en recorrer un tramo. */
const SEGMENT_MS = 850;

interface Token {
  key: string;
  d: Pt;
  m: Pt;
}

@Component({
  selector: 'app-diagram',
  imports: [NgTemplateOutlet],
  templateUrl: './diagram.html',
  styleUrl: './diagram.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent {
  readonly diagram = input.required<Diagram>();
  /** Prefijo para los ids del SVG (marcadores), único en la página. */
  readonly uid = input.required<string>();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);

  readonly layouts: Layout[] = ['d', 'm'];
  readonly scenarioIndex = signal(0);
  readonly stepIndex = signal(0);
  readonly playing = signal(false);
  private readonly elapsed = signal(0);

  readonly scenario = computed(() => this.diagram().scenarios[this.scenarioIndex()]);
  readonly steps = computed(() => this.scenario().steps);
  readonly step = computed<Step>(() => this.steps()[this.stepIndex()]);
  readonly isFirst = computed(() => this.stepIndex() === 0);
  readonly isLast = computed(() => this.stepIndex() === this.steps().length - 1);

  /** Geometría de cada conexión en los dos planos, calculada una vez por diagrama. */
  readonly geometry = computed(() => {
    const dg = this.diagram();
    const byId = new Map(dg.nodes.map((n) => [n.id, n]));
    const out: Record<Layout, Map<string, EdgeGeometry>> = { d: new Map(), m: new Map() };
    for (const l of this.layouts) {
      for (const e of dg.edges) {
        const a = byId.get(e.from)!;
        const b = byId.get(e.to)!;
        out[l].set(e.id, route(a[l], b[l], e.elbow?.[l]));
      }
    }
    return out;
  });

  readonly activeEdges = computed(() => new Set((this.step().edges ?? []).map((e) => e.id)));

  readonly activeNodes = computed(() => {
    const dg = this.diagram();
    const step = this.step();
    const ids = new Set(step.nodes ?? []);
    for (const se of step.edges ?? []) {
      const edge = dg.edges.find((e) => e.id === se.id);
      if (edge) {
        ids.add(edge.from);
        ids.add(edge.to);
      }
    }
    return ids;
  });

  /** Piezas y conexiones que toca el escenario elegido; el resto se atenúa. */
  readonly scenarioParts = computed(() => {
    const dg = this.diagram();
    const edges = new Set<string>();
    const nodes = new Set<string>();
    for (const s of this.steps()) {
      for (const n of s.nodes ?? []) nodes.add(n);
      for (const se of s.edges ?? []) {
        edges.add(se.id);
        const edge = dg.edges.find((e) => e.id === se.id);
        if (edge) {
          nodes.add(edge.from);
          nodes.add(edge.to);
        }
      }
    }
    return { edges, nodes };
  });

  /** El punto rojo que recorre los tramos del paso actual, en los dos planos. */
  readonly tokens = computed<Token[]>(() => {
    const t = this.elapsed();
    const stepEdges = this.step().edges ?? [];
    if (!this.isBrowser || t <= 0 || stepEdges.length === 0) return [];
    const geo = this.geometry();
    const last = stepEdges.length - 1;
    const tokens: Token[] = [];
    stepEdges.forEach((se, i) => {
      const start = i * SEGMENT_MS;
      const end = start + SEGMENT_MS;
      if (t < start || (t > end && i !== last)) return;
      const p = ease(Math.min((t - start) / SEGMENT_MS, 1));
      const f = se.back ? 1 - p : p;
      tokens.push({
        key: `${i}`,
        d: pointAt(geo.d.get(se.id)!, f),
        m: pointAt(geo.m.get(se.id)!, f),
      });
    });
    return tokens;
  });

  private raf = 0;
  private autoplayTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Cada cambio de paso arranca de nuevo la animación del recorrido.
    effect(() => {
      this.step();
      this.startTravel();
    });

    // Reproducción automática: espera a que acabe el recorrido y deja tiempo para leer.
    effect(() => {
      const playing = this.playing();
      const step = this.step();
      clearTimeout(this.autoplayTimer);
      if (!playing || !this.isBrowser) return;
      const travel = (step.edges?.length ?? 0) * SEGMENT_MS;
      const reading = Math.max(4000, (step.text.length + (step.why?.length ?? 0)) * 32);
      this.autoplayTimer = setTimeout(() => {
        if (this.isLast()) {
          this.playing.set(false);
        } else {
          this.stepIndex.update((i) => i + 1);
        }
      }, travel + reading);
    });

    this.destroyRef.onDestroy(() => {
      if (!this.isBrowser) return;
      cancelAnimationFrame(this.raf);
      clearTimeout(this.autoplayTimer);
    });
  }

  selectScenario(index: number): void {
    if (index === this.scenarioIndex()) return;
    this.scenarioIndex.set(index);
    this.stepIndex.set(0);
    this.playing.set(false);
  }

  onTabKey(event: KeyboardEvent): void {
    const count = this.diagram().scenarios.length;
    let next = -1;
    if (event.key === 'ArrowRight') next = (this.scenarioIndex() + 1) % count;
    if (event.key === 'ArrowLeft') next = (this.scenarioIndex() - 1 + count) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next < 0) return;
    event.preventDefault();
    this.selectScenario(next);
    const tab = (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[
      next
    ];
    tab?.focus();
  }

  goTo(index: number): void {
    this.stepIndex.set(index);
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
    if (this.isLast()) this.stepIndex.set(0);
    this.playing.set(true);
  }

  asLayout(l: unknown): Layout {
    return l === 'm' ? 'm' : 'd';
  }

  nodeLabelY(_l: Layout, h: number, y: number, hasSub: boolean): number {
    return hasSub ? y + h * 0.44 : y + h * 0.58;
  }

  private startTravel(): void {
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.raf);
    const edges = this.step().edges?.length ?? 0;
    if (edges === 0 || prefersReducedMotion()) {
      this.elapsed.set(0);
      return;
    }
    const total = edges * SEGMENT_MS;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.max(now - t0, 1);
      this.elapsed.set(t);
      if (t < total) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
