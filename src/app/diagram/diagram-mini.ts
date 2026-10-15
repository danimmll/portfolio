import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ICONS } from '../shared/icons';
import { Diagram, MsgKind, msgKind } from './diagram.model';
import { ease, pointAt, route } from './geometry';

const MSG_MS = 900;

/**
 * Miniatura viva del plano para las tarjetas: un paquete recorre en bucle el primer
 * escenario mientras la tarjeta está a la vista. Es decorativa (aria-hidden).
 */
@Component({
  selector: 'app-diagram-mini',
  template: `
    @let dg = diagram();
    @let cur = current();
    <svg
      [attr.viewBox]="'0 0 ' + dg.size.d[0] + ' ' + dg.size.d[1]"
      aria-hidden="true"
      focusable="false"
    >
      @for (g of dg.groups ?? []; track g.id) {
        <rect
          class="group"
          [attr.x]="g.d.x"
          [attr.y]="g.d.y"
          [attr.width]="g.d.w"
          [attr.height]="g.d.h"
          rx="14"
        />
      }
      @for (e of edges(); track e.id) {
        <path
          [class]="cur?.edge === e.id ? 'edge is-on k-' + cur?.kind : 'edge'"
          [attr.d]="e.geo.d"
        />
      }
      @for (n of dg.nodes; track n.id) {
        <g class="node" [class.is-on]="cur && (cur.from === n.id || cur.to === n.id)">
          <rect
            [attr.x]="n.d.x"
            [attr.y]="n.d.y"
            [attr.width]="n.d.w"
            [attr.height]="n.d.h"
            rx="11"
          />
          <g
            class="icon"
            [attr.transform]="
              'translate(' + (n.d.x + 14) + ' ' + (n.d.y + n.d.h / 2 - 9) + ') scale(0.75)'
            "
          >
            <path [attr.d]="icon(n.kind)" />
          </g>
          <text [attr.x]="n.d.x + 44" [attr.y]="n.d.y + n.d.h / 2 + 5">{{ n.label }}</text>
        </g>
      }
      @if (packet(); as p) {
        <circle
          class="packet"
          [class]="'packet k-' + p.kind"
          [attr.cx]="p.x"
          [attr.cy]="p.y"
          r="8"
        />
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .group {
      fill: none;
      stroke: var(--line-2);
      stroke-width: 1.4;
      stroke-dasharray: 6 6;
    }
    .edge {
      fill: none;
      stroke: var(--edge);
      stroke-width: 2;
      transition: stroke 0.3s;
    }
    .edge.is-on {
      stroke-width: 2.6;
    }
    .edge.k-req {
      stroke: var(--req);
    }
    .edge.k-res {
      stroke: var(--res);
    }
    .edge.k-err {
      stroke: var(--err);
    }
    .node rect {
      fill: var(--surface-2);
      stroke: var(--line-2);
      stroke-width: 1.5;
      transition: stroke 0.3s;
    }
    .node.is-on rect {
      stroke: var(--req);
    }
    .icon path {
      fill: none;
      stroke: var(--text-3);
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .node.is-on .icon path {
      stroke: var(--req);
    }
    text {
      font: 650 15px var(--font-display);
      fill: var(--text-2);
    }
    .packet {
      stroke: var(--board);
      stroke-width: 3;
    }
    .packet.k-req {
      fill: var(--req);
      filter: drop-shadow(0 0 8px var(--req));
    }
    .packet.k-res {
      fill: var(--res);
      filter: drop-shadow(0 0 8px var(--res));
    }
    .packet.k-err {
      fill: var(--err);
      filter: drop-shadow(0 0 8px var(--err));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramMini {
  readonly diagram = input.required<Diagram>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly t = signal(-1);
  private raf = 0;

  readonly edges = computed(() => {
    const dg = this.diagram();
    const byId = new Map(dg.nodes.map((n) => [n.id, n]));
    return dg.edges.map((e) => ({
      id: e.id,
      geo: route(byId.get(e.from)!.d, byId.get(e.to)!.d, e.elbow?.d),
    }));
  });

  /** Mensajes del primer escenario que viajan por una conexión. */
  private readonly loop = computed(() => {
    const dg = this.diagram();
    const out: { from: string; to: string; edge: string; reverse: boolean; kind: MsgKind }[] = [];
    for (const s of dg.scenarios[0].steps) {
      for (const m of s.msgs) {
        const kind = msgKind(m);
        if (kind === 'self') continue;
        const fwd = dg.edges.find((e) => e.from === m.from && e.to === m.to);
        const back = dg.edges.find((e) => e.from === m.to && e.to === m.from);
        const e = fwd ?? back;
        if (e) out.push({ from: m.from, to: m.to, edge: e.id, reverse: !fwd, kind });
      }
    }
    return out;
  });

  readonly current = computed(() => {
    const t = this.t();
    const loop = this.loop();
    if (t < 0 || loop.length === 0) return null;
    return loop[Math.floor(t / MSG_MS) % loop.length];
  });

  readonly packet = computed(() => {
    const cur = this.current();
    if (!cur) return null;
    const p = ease((this.t() % MSG_MS) / MSG_MS);
    const geo = this.edges().find((e) => e.id === cur.edge)!.geo;
    const pt = pointAt(geo, cur.reverse ? 1 - p : p);
    return { ...pt, kind: cur.kind };
  });

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let start = 0;
      let offset = 0;
      const tick = (now: number) => {
        this.t.set(offset + now - start);
        this.raf = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver((entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        cancelAnimationFrame(this.raf);
        if (visible) {
          start = performance.now();
          offset = Math.max(this.t(), 0);
          this.raf = requestAnimationFrame(tick);
        }
      });
      io.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => {
        io.disconnect();
        cancelAnimationFrame(this.raf);
      });
    });
  }

  icon(kind: string): string {
    return (ICONS as Record<string, string>)[kind === 'external' ? 'cloud' : kind] ?? ICONS.service;
  }
}
