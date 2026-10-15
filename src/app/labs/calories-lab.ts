import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Icon } from '../shared/icon';
import { calorias, metCardio, metEstiramiento, metFuerza } from './engines';

const CALC_URL =
  'https://github.com/danimmll/FitJourneyProject/blob/main/FitJourney/app/src/main/java/es/iesagora/fitjourney/utils/FitnessCalculator.java#L157-L216';
const SESSION_URL =
  'https://github.com/danimmll/FitJourneyProject/blob/main/FitJourney/app/src/main/java/es/iesagora/fitjourney/ui/workout/session/WorkoutSessionFragment.java#L503-L553';

type Tipo = 'fuerza' | 'cardio' | 'estiramiento';

@Component({
  selector: 'app-calories-lab',
  imports: [Icon],
  template: `
    @let r = result();
    <article class="lab">
      <header class="lab-head">
        <h3>Calculadora de calorías</h3>
        <p>
          Al terminar cada entrenamiento, la app estima las calorías de cada ejercicio con su MET
          (equivalente metabólico). Esta es la misma fórmula, con los mismos límites.
        </p>
      </header>

      <div class="lab-body">
        <div>
          <div class="seg" role="group" aria-label="Tipo de ejercicio">
            <button
              type="button"
              [attr.aria-pressed]="tipo() === 'fuerza'"
              (click)="tipo.set('fuerza')"
            >
              Fuerza
            </button>
            <button
              type="button"
              [attr.aria-pressed]="tipo() === 'cardio'"
              (click)="tipo.set('cardio')"
            >
              Cardio
            </button>
            <button
              type="button"
              [attr.aria-pressed]="tipo() === 'estiramiento'"
              (click)="tipo.set('estiramiento')"
            >
              Estiramiento
            </button>
          </div>

          <fieldset class="first">
            <legend>Tú</legend>
            <label class="field">
              <span class="field-label">Peso corporal</span>
              <output>{{ peso() }} kg</output>
              <input
                type="range"
                min="40"
                max="140"
                step="1"
                [value]="peso()"
                (input)="peso.set(+$any($event.target).value)"
              />
            </label>
            <label class="field">
              <span class="field-label">Tiempo en este ejercicio</span>
              <output>{{ minutos() }} min</output>
              <input
                type="range"
                min="5"
                max="90"
                step="1"
                [value]="minutos()"
                (input)="minutos.set(+$any($event.target).value)"
              />
            </label>
          </fieldset>

          @switch (tipo()) {
            @case ('fuerza') {
              <fieldset>
                <legend>El ejercicio</legend>
                <label class="field">
                  <span class="field-label">Peso levantado, media de las series</span>
                  <output>{{ levantado() }} kg</output>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="2.5"
                    [value]="levantado()"
                    (input)="levantado.set(+$any($event.target).value)"
                  />
                </label>
                <label class="field">
                  <span class="field-label">Series</span>
                  <output>{{ series() }}</output>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    [value]="series()"
                    (input)="series.set(+$any($event.target).value)"
                  />
                </label>
                <label class="field">
                  <span class="field-label">Repeticiones por serie</span>
                  <output>{{ reps() }}</output>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    [value]="reps()"
                    (input)="reps.set(+$any($event.target).value)"
                  />
                </label>
                <p class="note">El descanso entre series va fijo a 90 segundos, como en la app.</p>
              </fieldset>
            }
            @case ('cardio') {
              <fieldset>
                <legend>El ejercicio</legend>
                <label class="field">
                  <span class="field-label">Velocidad media</span>
                  <output>{{ num(velocidad(), 1) }} km/h</output>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="0.5"
                    [value]="velocidad()"
                    (input)="velocidad.set(+$any($event.target).value)"
                  />
                </label>
                <p class="note">La app parte de un MET de 8 y no tiene en cuenta la inclinación.</p>
              </fieldset>
            }
            @default {
              <p class="note">
                En la sesión de entrenamiento los estiramientos cuentan como estáticos, de
                intensidad normal y nivel intermedio, así que su MET es fijo.
              </p>
            }
          }
        </div>

        <div class="results" aria-live="polite">
          <p class="result-label">Calorías estimadas</p>
          <p class="big">{{ num(r.kcal, 0) }} <span class="unit">kcal</span></p>

          <dl class="steps">
            @for (f of r.factores; track f.label) {
              <div>
                <dt>{{ f.label }}</dt>
                <dd>{{ num(f.value, 2) }}</dd>
              </div>
            }
            <div class="total">
              <dt>MET</dt>
              <dd>{{ r.formulaMet }} = {{ num(r.met, 1) }}</dd>
            </div>
            <div class="total">
              <dt>Calorías = MET × peso × horas</dt>
              <dd>
                {{ num(r.met, 1) }} × {{ peso() }} × {{ num(minutos() / 60, 2) }} =
                {{ num(r.kcal, 0) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <footer class="lab-foot">
        Misma lógica que
        <a [href]="calcUrl" target="_blank" rel="noopener"
          >FitnessCalculator.java <app-icon name="external"
        /></a>
        <a [href]="sessionUrl" target="_blank" rel="noopener"
          >WorkoutSessionFragment.java <app-icon name="external"
        /></a>
      </footer>
    </article>
  `,
  styleUrls: ['./lab.scss'],
  styles: `
    fieldset.first {
      margin-top: 20px;
    }

    .results {
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--bg-raised);
    }

    .unit {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-2);
      letter-spacing: 0;
    }

    .steps {
      display: grid;
      gap: 10px;
      margin: 20px 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--line);

      div {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: baseline;
        gap: 12px;
      }

      dt {
        font-size: 0.88rem;
        color: var(--text-3);
      }

      dd {
        margin: 0;
        font: 600 0.92rem/1.3 var(--font-mono);
        text-align: right;
      }

      .total {
        grid-template-columns: 1fr;
        gap: 2px;
        padding-top: 10px;
        border-top: 1px dashed var(--line-2);

        dt {
          color: var(--text-2);
        }

        dd {
          text-align: left;
          color: var(--req);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaloriesLab {
  readonly calcUrl = CALC_URL;
  readonly sessionUrl = SESSION_URL;

  readonly tipo = signal<Tipo>('fuerza');
  readonly peso = signal(72);
  readonly minutos = signal(15);
  readonly levantado = signal(40);
  readonly series = signal(4);
  readonly reps = signal(10);
  readonly velocidad = signal(9);

  readonly result = computed(() => {
    const tipo = this.tipo();
    const peso = this.peso();
    let m;
    let formulaMet: string;
    if (tipo === 'fuerza') {
      m = metFuerza(this.levantado(), peso, this.series(), this.reps());
      const [i, v, d] = m.factores.map((f) => this.num(f.value, 2));
      formulaMet = `6 × (1 + ${i}) × (1 + ${v}) × ${d}`;
    } else if (tipo === 'cardio') {
      m = metCardio(this.velocidad());
      const [v, inc] = m.factores.map((f) => this.num(f.value, 2));
      formulaMet = `8 × ${v} × ${inc}`;
    } else {
      m = metEstiramiento();
      formulaMet = '2,5 × 1,2 × 1';
    }
    return { ...m, formulaMet, kcal: calorias(m.met, peso, this.minutos()) };
  });

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
}
