import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Diagram } from './diagram.model';
import { route } from './geometry';

/** Miniatura estática del plano, para las fichas de la portada. */
@Component({
  selector: 'app-diagram-preview',
  template: `
    @let dg = diagram();
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
        />
      }
      @for (p of paths(); track $index) {
        <path class="edge" [attr.d]="p" />
      }
      @for (n of dg.nodes; track n.id) {
        <g class="node">
          <rect
            [attr.x]="n.d.x"
            [attr.y]="n.d.y"
            [attr.width]="n.d.w"
            [attr.height]="n.d.h"
            rx="2"
          />
          <text [attr.x]="n.d.x + n.d.w / 2" [attr.y]="n.d.y + n.d.h * 0.6">{{ n.label }}</text>
        </g>
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
      stroke: var(--ink-2);
      stroke-width: 1.2;
      stroke-dasharray: 6 4;
    }
    .edge {
      fill: none;
      stroke: var(--ink-2);
      stroke-width: 1.8;
    }
    .node rect {
      fill: var(--sheet);
      stroke: var(--ink);
      stroke-width: 2;
    }
    .node text {
      font: 600 19px var(--font-display);
      fill: var(--ink);
      text-anchor: middle;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramPreviewComponent {
  readonly diagram = input.required<Diagram>();

  readonly paths = computed(() => {
    const dg = this.diagram();
    const byId = new Map(dg.nodes.map((n) => [n.id, n]));
    return dg.edges.map((e) => route(byId.get(e.from)!.d, byId.get(e.to)!.d, e.elbow?.d).d);
  });
}
