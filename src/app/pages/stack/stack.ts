import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { STACK, Tech } from '../../data/profile';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-stack',
  imports: [RouterLink, NgTemplateOutlet, Icon],
  template: `
    <div class="page wrap">
      <header class="page-head">
        <h1>Con qué trabajo</h1>
        <p>
          Pulsa una tecnología para ver dónde la he usado. Muchas te llevan directamente al paso del
          diagrama en el que aparece, con su código.
        </p>
      </header>

      <div class="layout">
        <div class="groups">
          @for (g of stack; track g.group) {
            <section class="group" [attr.aria-labelledby]="'g-' + $index">
              <h2 class="group-title" [id]="'g-' + $index">
                {{ g.group }}
                <span class="count">{{ g.items.length }}</span>
              </h2>
              <ul class="techs">
                @for (t of g.items; track t.name) {
                  <li>
                    <button
                      type="button"
                      class="tech"
                      [attr.aria-pressed]="t.name === selectedName()"
                      [attr.aria-controls]="'uses'"
                      (click)="select(t)"
                    >
                      {{ t.name }}
                    </button>
                  </li>
                }
              </ul>
              @if (selectedGroup() === g.group) {
                <div class="inline">
                  <ng-container *ngTemplateOutlet="panel" />
                </div>
              }
            </section>
          }
        </div>

        <aside class="side" id="uses" aria-live="polite">
          <ng-container *ngTemplateOutlet="panel" />
        </aside>
      </div>
    </div>

    <ng-template #panel>
      @let t = selected();
      <div class="uses">
        <p class="uses-label">Dónde lo he usado</p>
        <h3 class="uses-name">{{ t.name }}</h3>
        <ul class="uses-list">
          @for (u of t.uses; track u.text) {
            <li>
              @if (u.external) {
                <a [href]="u.link" target="_blank" rel="noopener">
                  <span>{{ u.text }}</span>
                  <app-icon name="external" />
                </a>
              } @else {
                <a
                  [routerLink]="u.link"
                  [queryParams]="u.scenario ? { escenario: u.scenario, paso: u.step } : null"
                >
                  <span>{{ u.text }}</span>
                  @if (u.scenario) {
                    <span class="go">Ver el paso {{ u.step }}</span>
                  }
                </a>
              }
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  styles: `
    .layout {
      display: grid;
      gap: 40px;

      @media (min-width: 980px) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
        gap: 56px;
        align-items: start;
      }
    }

    .groups {
      display: grid;
      gap: 36px;
    }

    .group-title {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin: 0 0 14px;
      font-size: 1.35rem;
    }

    .count {
      font: 500 0.85rem/1 var(--font-body);
      color: var(--text-3);
    }

    .techs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .tech {
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid var(--line-2);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      font: 500 0.95rem/1 var(--font-body);
      cursor: pointer;
      transition:
        border-color 0.15s,
        background-color 0.15s,
        color 0.15s;

      &:hover {
        border-color: var(--text-3);
      }

      &[aria-pressed='true'] {
        border-color: var(--req);
        background: var(--req);
        color: #1a1206;
      }
    }

    .inline {
      margin-top: 14px;

      @media (min-width: 980px) {
        display: none;
      }
    }

    .side {
      display: none;

      @media (min-width: 980px) {
        display: block;
        position: sticky;
        top: calc(var(--header-h) + 24px);
      }
    }

    .uses {
      padding: 22px 24px;
      border: 1px solid var(--line-2);
      border-radius: 18px;
      background: var(--surface);
    }

    .uses-label {
      margin: 0;
      font-size: 0.88rem;
      color: var(--text-3);
    }

    .uses-name {
      margin: 4px 0 16px;
      font-size: var(--step-2);
    }

    .uses-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;

      a {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px 12px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--surface-2);
        color: var(--text);
        text-decoration: none;
        transition: border-color 0.15s;
      }

      a:hover {
        border-color: var(--req-line);
      }

      app-icon {
        color: var(--text-3);
      }
    }

    .go {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--req);
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackPage {
  readonly stack = STACK;
  readonly selectedName = signal(STACK[0].items[0].name);

  readonly selected = computed<Tech>(() => {
    const name = this.selectedName();
    for (const g of STACK) for (const t of g.items) if (t.name === name) return t;
    return STACK[0].items[0];
  });

  readonly selectedGroup = computed(
    () => STACK.find((g) => g.items.some((t) => t.name === this.selectedName()))?.group,
  );

  select(t: Tech): void {
    this.selectedName.set(t.name);
  }
}
