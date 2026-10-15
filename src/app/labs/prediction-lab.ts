import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../shared/icon';
import { Roja, predecirEnVivo } from './engines';

const ENGINE_URL =
  'https://github.com/danimmll/Scorevia/blob/main/scorevia-backend/Microservicio-predicciones/src/main/java/predicciones/services/predictionengine/PredictionEngineServiceImpl.java';
const SERVICE_URL =
  'https://github.com/danimmll/Scorevia/blob/main/scorevia-backend/Microservicio-predicciones/src/main/java/predicciones/services/prediction/PredictionServiceImpl.java#L52-L89';

@Component({
  selector: 'app-prediction-lab',
  imports: [Icon],
  template: `
    @let r = result();
    <article class="lab">
      <header class="lab-head">
        <h3>Simulador de predicción en directo</h3>
        <p>
          El mismo cálculo que hace el microservicio de predicciones, traducido a TypeScript y
          ejecutándose en tu navegador. Mueve el minuto, cambia el marcador o saca una roja.
        </p>
      </header>

      <div class="lab-body">
        <div>
          <fieldset>
            <legend>Fuerza de cada equipo</legend>
            <label class="field">
              <span class="field-label">Local, goles esperados antes del partido</span>
              <output>{{ num(lambdaLocal(), 2) }}</output>
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.05"
                [value]="lambdaLocal()"
                (input)="lambdaLocal.set(+$any($event.target).value)"
              />
            </label>
            <label class="field">
              <span class="field-label">Visitante, goles esperados antes del partido</span>
              <output>{{ num(lambdaVisitante(), 2) }}</output>
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.05"
                [value]="lambdaVisitante()"
                (input)="lambdaVisitante.set(+$any($event.target).value)"
              />
            </label>
            <p class="note">
              En ScoreVia salen de la forma de cada equipo y del cara a cara. Aquí los eliges tú.
            </p>
          </fieldset>

          <fieldset>
            <legend>El partido</legend>
            <label class="field">
              <span class="field-label">Minuto</span>
              <output>{{ minuto() }}'</output>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                [value]="minuto()"
                (input)="minuto.set(+$any($event.target).value)"
              />
            </label>

            <div class="score">
              <div class="team">
                <span class="field-label">Local</span>
                <div class="stepper">
                  <button
                    type="button"
                    (click)="golesLocal.update(dec)"
                    [disabled]="golesLocal() === 0"
                    aria-label="Quitar un gol al local"
                  >
                    −
                  </button>
                  <span class="value" aria-live="polite">{{ golesLocal() }}</span>
                  <button
                    type="button"
                    (click)="golesLocal.update(inc)"
                    [disabled]="golesLocal() === 9"
                    aria-label="Sumar un gol al local"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="team">
                <span class="field-label">Visitante</span>
                <div class="stepper">
                  <button
                    type="button"
                    (click)="golesVisitante.update(dec)"
                    [disabled]="golesVisitante() === 0"
                    aria-label="Quitar un gol al visitante"
                  >
                    −
                  </button>
                  <span class="value" aria-live="polite">{{ golesVisitante() }}</span>
                  <button
                    type="button"
                    (click)="golesVisitante.update(inc)"
                    [disabled]="golesVisitante() === 9"
                    aria-label="Sumar un gol al visitante"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div class="cards">
              <button type="button" class="card-btn" (click)="roja('local')">
                <span class="red" aria-hidden="true"></span>Roja al local
              </button>
              <button type="button" class="card-btn" (click)="roja('visitante')">
                <span class="red" aria-hidden="true"></span>Roja al visitante
              </button>
            </div>
            @if (rojas().length) {
              <ul class="chips red-list">
                @for (c of rojas(); track $index; let i = $index) {
                  <li class="chip" [class.is-future]="c.minuto > minuto()">
                    <span class="red" aria-hidden="true"></span>
                    {{ c.equipo === 'local' ? 'Local' : 'Visitante' }}, {{ c.minuto }}'
                    <button
                      type="button"
                      (click)="quitarRoja(i)"
                      [attr.aria-label]="'Quitar la roja del minuto ' + c.minuto"
                    >
                      <app-icon name="close" />
                    </button>
                  </li>
                }
              </ul>
            }
          </fieldset>
        </div>

        <div class="results" aria-live="polite">
          <p class="result-label">Probabilidad del resultado final</p>
          <ul class="bars">
            <li>
              <span class="bar-name">Gana el local</span>
              <span class="bar-value">{{ num(r.local, 1) }} %</span>
              <span class="bar"><span class="fill fill--l" [style.width.%]="r.local"></span></span>
            </li>
            <li>
              <span class="bar-name">Empate</span>
              <span class="bar-value">{{ num(r.empate, 1) }} %</span>
              <span class="bar"><span class="fill fill--e" [style.width.%]="r.empate"></span></span>
            </li>
            <li>
              <span class="bar-name">Gana el visitante</span>
              <span class="bar-value">{{ num(r.visitante, 1) }} %</span>
              <span class="bar"
                ><span class="fill fill--v" [style.width.%]="r.visitante"></span
              ></span>
            </li>
          </ul>

          <dl class="facts">
            <div>
              <dt>Goles esperados que quedan</dt>
              <dd>{{ num(r.lambdaLocal, 2) }} y {{ num(r.lambdaVisitante, 2) }}</dd>
            </div>
            <div>
              <dt>Marcadores finales más probables</dt>
              <dd>
                @for (m of r.marcadores; track $index) {
                  <span class="score-chip"
                    >{{ m.local }}–{{ m.visitante }} <small>{{ num(m.p, 0) }} %</small></span
                  >
                }
              </dd>
            </div>
          </dl>

          <p class="note">
            Poisson por equipo con la corrección de Dixon-Coles (ρ = −0,15). Lo que queda de partido
            pesa 1 − (minuto ÷ 90)^1,25, y cada roja quita hasta un 30 % de goles esperados a quien
            la recibe y le da la mitad al rival.
          </p>
        </div>
      </div>

      <footer class="lab-foot">
        Misma lógica que
        <a [href]="engineUrl" target="_blank" rel="noopener"
          >PredictionEngineServiceImpl.java <app-icon name="external"
        /></a>
        <a [href]="serviceUrl" target="_blank" rel="noopener"
          >PredictionServiceImpl.java <app-icon name="external"
        /></a>
      </footer>
    </article>
  `,
  styleUrls: ['./lab.scss'],
  styles: `
    .score {
      display: flex;
      flex-wrap: wrap;
      gap: 14px 28px;
      margin-top: 16px;
    }

    .team {
      display: grid;
      gap: 6px;
    }

    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .card-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 38px;
      padding: 0 14px;
      border: 1px solid var(--line-2);
      border-radius: 10px;
      background: var(--surface-2);
      color: var(--text);
      font: 500 0.9rem/1 var(--font-body);
      cursor: pointer;

      &:hover {
        border-color: var(--err-line);
      }
    }

    .red {
      display: inline-block;
      width: 10px;
      height: 14px;
      border-radius: 2px;
      background: var(--err);
    }

    .red-list {
      margin-top: 12px;

      .chip {
        gap: 7px;
        padding-right: 4px;
      }

      .chip.is-future {
        opacity: 0.45;
      }

      button {
        display: inline-grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--text-3);
        cursor: pointer;

        &:hover {
          color: var(--text);
        }
      }
    }

    .results {
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--bg-raised);
    }

    .bars {
      display: grid;
      gap: 14px;
      margin: 8px 0 0;
      padding: 0;
      list-style: none;

      li {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 6px;
      }
    }

    .bar-name {
      color: var(--text-2);
    }

    .bar-value {
      font: 650 1.15rem/1 var(--font-display);
    }

    .bar {
      grid-column: 1 / -1;
      height: 10px;
      border-radius: 999px;
      background: var(--surface-3);
      overflow: hidden;
    }

    .fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      transition: width 0.25s ease;
    }

    .fill--l {
      background: var(--req);
    }

    .fill--e {
      background: var(--text-3);
    }

    .fill--v {
      background: var(--res);
    }

    .facts {
      display: grid;
      gap: 12px;
      margin: 20px 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--line);

      dt {
        font-size: 0.88rem;
        color: var(--text-3);
      }

      dd {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 4px 0 0;
        font: 600 1rem/1.3 var(--font-mono);
      }
    }

    .score-chip {
      padding: 4px 10px;
      border: 1px solid var(--line-2);
      border-radius: 8px;
      background: var(--surface-2);

      small {
        color: var(--text-3);
        font-size: 0.8rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fill {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionLab {
  readonly engineUrl = ENGINE_URL;
  readonly serviceUrl = SERVICE_URL;

  readonly lambdaLocal = signal(1.6);
  readonly lambdaVisitante = signal(1.1);
  readonly minuto = signal(0);
  readonly golesLocal = signal(0);
  readonly golesVisitante = signal(0);
  readonly rojas = signal<Roja[]>([]);

  readonly result = computed(() =>
    predecirEnVivo(
      this.lambdaLocal(),
      this.lambdaVisitante(),
      this.minuto(),
      this.golesLocal(),
      this.golesVisitante(),
      this.rojas(),
    ),
  );

  readonly inc = (n: number) => Math.min(9, n + 1);
  readonly dec = (n: number) => Math.max(0, n - 1);

  private readonly fmt = new Map<number, Intl.NumberFormat>();

  num(n: number, digits: number): string {
    let f = this.fmt.get(digits);
    if (!f) {
      f = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      this.fmt.set(digits, f);
    }
    return f.format(n);
  }

  roja(equipo: Roja['equipo']): void {
    this.rojas.update((r) => [...r, { equipo, minuto: this.minuto() }]);
  }

  quitarRoja(i: number): void {
    this.rojas.update((r) => r.filter((_, j) => j !== i));
  }
}
