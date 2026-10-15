import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../data/projects';
import { DiagramMini } from '../diagram/diagram-mini';
import { Icon } from './icon';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, DiagramMini, Icon],
  template: `
    @let p = project();
    <article class="card" [class.card--full]="full()">
      <a class="board" [routerLink]="['/proyectos', p.slug]" tabindex="-1" aria-hidden="true">
        <app-diagram-mini [diagram]="p.diagram" />
      </a>
      <div class="body">
        <h3 class="name">
          <a [routerLink]="['/proyectos', p.slug]">{{ p.name }}</a>
        </h3>
        <p class="tagline">{{ p.tagline }}</p>
        <p class="kind">{{ p.kind }}</p>

        @if (full()) {
          <p class="desc">{{ p.description }}</p>
        }

        @let metrics = full() ? p.metrics : p.metrics.slice(0, 3);
        <dl class="metrics" [class.metrics--two]="metrics.length === 4">
          @for (m of metrics; track m.label) {
            <div>
              <dt>{{ m.label }}</dt>
              <dd>{{ m.value }}</dd>
            </div>
          }
        </dl>

        <ul class="chips" aria-label="Tecnologías">
          @for (t of p.stack; track t) {
            <li class="chip">{{ t }}</li>
          }
        </ul>

        @if (full()) {
          <div class="flows">
            <h4>Flujos que puedes recorrer</h4>
            <ul>
              @for (s of p.diagram.scenarios; track s.id) {
                <li>
                  <a
                    [routerLink]="['/proyectos', p.slug]"
                    [queryParams]="{ escenario: s.id }"
                    [class.is-error]="s.tone === 'error'"
                  >
                    <span class="dot" aria-hidden="true"></span>{{ s.name }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }

        <div class="actions">
          <a class="btn btn--primary" [routerLink]="['/proyectos', p.slug]">Ver cómo funciona</a>
          <a class="btn" [href]="p.repo" target="_blank" rel="noopener">
            <app-icon name="code" />
            Código
          </a>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }

    .card {
      display: grid;
      overflow: hidden;
      border: 1px solid var(--line-2);
      border-radius: 22px;
      background: var(--surface);

      @media (min-width: 960px) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      }
    }

    .board {
      display: grid;
      place-items: center;
      padding: 22px;
      background-color: var(--board);
      background-image: radial-gradient(circle at 1px 1px, var(--board-dot) 1px, transparent 0);
      background-size: 22px 22px;
      border-bottom: 1px solid var(--line-2);

      @media (min-width: 960px) {
        padding: 36px 32px;
        border-bottom: 0;
        border-right: 1px solid var(--line-2);
      }

      app-diagram-mini {
        width: 100%;
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      padding: 24px 22px 26px;

      @media (min-width: 960px) {
        padding: 36px 34px;
      }
    }

    .name {
      margin: 0;
      font-size: var(--step-3);
      letter-spacing: -0.03em;

      a {
        color: var(--text);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
        text-decoration-thickness: 2px;
      }
    }

    .tagline {
      margin: 8px 0 0;
      font-size: 1.15rem;
      color: var(--text);
    }

    .kind {
      margin: 6px 0 0;
      font-size: 0.9rem;
      color: var(--text-3);
    }

    .desc {
      margin: 16px 0 0;
      color: var(--text-2);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 14px 18px;
      margin: 22px 0;
      padding: 18px 0;
      border-block: 1px solid var(--line);

      div {
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-end;
        gap: 4px;
      }

      dt {
        font-size: 0.82rem;
        line-height: 1.35;
        color: var(--text-3);
      }

      dd {
        margin: 0;
        font: 650 1.6rem/1 var(--font-display);
        letter-spacing: -0.02em;
      }
    }

    .metrics--two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .flows {
      margin-top: 22px;

      h4 {
        margin: 0 0 10px;
        font: 600 0.95rem/1.3 var(--font-body);
        letter-spacing: 0;
        color: var(--text-2);
      }

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid var(--line-2);
        border-radius: 999px;
        color: var(--text);
        font-size: 0.88rem;
        text-decoration: none;
      }

      a:hover {
        border-color: var(--text-3);
      }

      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--req);
      }

      a.is-error .dot {
        background: var(--err);
      }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: auto;
      padding-top: 26px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly full = input(false);
}
