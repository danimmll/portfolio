import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Icon } from '../shared/icon';
import { Cuenta, LIMITE_LOGIN, MAX_INTENTOS_LOGIN, VENTANA_SEGUNDOS, Ventana } from './engines';

const GW_URL =
  'https://github.com/danimmll/Scorevia/blob/main/scorevia-backend/Gateway/src/main/java/gateway/filter/VentanaRateLimiter.java';
const LOCK_URL =
  'https://github.com/danimmll/Scorevia/blob/main/scorevia-backend/Microservicio-usuarios-roles/src/main/java/usuariosroles/security/filter/JwtAuthenticationFilter.java#L197-L208';

type Modo = 'una' | 'muchas';

interface Linea {
  n: number;
  correo: string;
  status: 400 | 429;
  texto: string;
}

@Component({
  selector: 'app-ratelimit-lab',
  imports: [Icon],
  template: `
    <article class="lab">
      <header class="lab-head">
        <h3>Intenta reventar el login</h3>
        <p>
          El login es el blanco típico de la fuerza bruta. ScoreVia tiene dos barreras: el Gateway
          corta por IP y usuarios-roles bloquea la cuenta. Lanza intentos con una contraseña mala y
          mira cuál salta antes.
        </p>
      </header>

      <div class="controls">
        <div class="seg" role="group" aria-label="Tipo de ataque">
          <button type="button" [attr.aria-pressed]="modo() === 'una'" (click)="setModo('una')">
            Contra una cuenta
          </button>
          <button
            type="button"
            [attr.aria-pressed]="modo() === 'muchas'"
            (click)="setModo('muchas')"
          >
            Contra muchas cuentas
          </button>
        </div>
        <div class="actions">
          <button type="button" class="btn btn--primary btn--small" (click)="enviar()">
            Enviar un intento
          </button>
          <button type="button" class="btn btn--small" (click)="rafaga()" [disabled]="enRafaga()">
            Ráfaga de 10
          </button>
        </div>
      </div>

      <div class="layers">
        <section class="layer" [class.is-tripped]="cortadasVentana() > 0">
          <p class="layer-name">API Gateway</p>
          <p class="layer-rule">{{ limite }} peticiones por minuto e IP en /auth</p>
          <div class="meter" aria-hidden="true">
            @for (c of celdasGw(); track $index) {
              <span class="cell" [class.is-on]="c === 1" [class.is-over]="c === 2"></span>
            }
          </div>
          <p class="layer-state">
            @if (usadasVentana() === 0) {
              Ventana vacía.
            } @else {
              {{ dentroVentana() }} de {{ limite }} en esta ventana{{
                cortadasVentana() ? ', ' + cortadasVentana() + ' cortadas' : ''
              }}. Se reinicia en {{ restanteVentana() }} s.
            }
          </p>
        </section>

        <section class="layer" [class.is-tripped]="bloqueada()">
          <p class="layer-name">usuarios-roles</p>
          <p class="layer-rule">{{ maxIntentos }} fallos seguidos bloquean la cuenta 15 minutos</p>
          @if (modo() === 'una') {
            <div class="meter meter--small" aria-hidden="true">
              @for (c of celdasCuenta(); track $index) {
                <span class="cell" [class.is-on]="c" [class.is-over]="bloqueada()"></span>
              }
            </div>
            <p class="layer-state">
              @if (bloqueada()) {
                Cuenta bloqueada: quedan {{ restanteBloqueo() }}.
              } @else {
                Fallos seguidos: {{ intentosCuenta() }} de {{ maxIntentos }}.
              }
            </p>
          } @else {
            <p class="layer-state">
              {{ cuentasDistintas() }} cuentas distintas, una prueba en cada una: ninguna llega a 5
              fallos. Aquí solo protege el límite por IP.
            </p>
          }
        </section>
      </div>

      <div class="log-wrap">
        <div class="log-head">
          <p>
            Llegan al servicio: <strong>{{ llegan() }}</strong
            >. Cortadas por el Gateway: <strong>{{ cortadas() }}</strong
            >.
          </p>
          <div class="clock">
            <button type="button" class="text-btn" (click)="adelantar(60)">
              Adelantar 1 minuto
            </button>
            <button type="button" class="text-btn" (click)="adelantar(900)">
              Adelantar 15 minutos
            </button>
            <button type="button" class="text-btn" (click)="reiniciar()">Reiniciar</button>
          </div>
        </div>
        @if (log().length) {
          <ol class="log" aria-live="polite">
            @for (l of log(); track l.n) {
              <li class="line" [class.is-429]="l.status === 429">
                <span class="line-n">#{{ l.n }}</span>
                <span class="line-mail">{{ l.correo }}</span>
                <span class="line-status">{{ l.status }}</span>
                <span class="line-text">{{ l.texto }}</span>
              </li>
            }
          </ol>
        } @else {
          <p class="empty">Todavía no has lanzado ningún intento.</p>
        }
      </div>

      <footer class="lab-foot">
        Misma lógica que
        <a [href]="gwUrl" target="_blank" rel="noopener"
          >VentanaRateLimiter.java <app-icon name="external"
        /></a>
        <a [href]="lockUrl" target="_blank" rel="noopener"
          >JwtAuthenticationFilter.java <app-icon name="external"
        /></a>
      </footer>
    </article>
  `,
  styleUrls: ['./lab.scss'],
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px 0;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: default;
    }

    .layers {
      display: grid;
      gap: 12px;
      padding: 18px 24px 0;

      @media (min-width: 760px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .layer {
      padding: 16px 18px;
      border: 1px solid var(--line-2);
      border-radius: 14px;
      background: var(--bg-raised);
      transition: border-color 0.2s;

      &.is-tripped {
        border-color: var(--err-line);
      }
    }

    .layer-name {
      margin: 0;
      font: 650 1.05rem/1.2 var(--font-display);
    }

    .layer-rule {
      margin: 2px 0 12px;
      font-size: 0.88rem;
      color: var(--text-3);
    }

    .layer-state {
      margin: 10px 0 0;
      font-size: 0.9rem;
      color: var(--text-2);
    }

    .meter {
      display: grid;
      grid-template-columns: repeat(20, 1fr);
      gap: 3px;
    }

    .meter--small {
      grid-template-columns: repeat(5, 1fr);
      max-width: 200px;
    }

    .cell {
      height: 14px;
      border-radius: 3px;
      background: var(--surface-3);
      transition: background-color 0.15s;

      &.is-on {
        background: var(--req);
      }

      &.is-over {
        background: var(--err);
      }
    }

    .log-wrap {
      padding: 18px 24px 22px;
    }

    .log-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;

      p {
        margin: 0;
        color: var(--text-2);
      }

      strong {
        color: var(--text);
      }
    }

    .clock {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
    }

    .text-btn {
      min-height: 32px;
      padding: 0;
      border: 0;
      background: none;
      color: var(--req);
      font: 600 0.88rem/1 var(--font-body);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .log {
      display: grid;
      gap: 4px;
      max-height: 260px;
      margin: 12px 0 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;
    }

    .line {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 11rem) 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      background: var(--bg-raised);
      font-size: 0.86rem;
      animation: line-in 0.2s ease both;

      @media (max-width: 560px) {
        grid-template-columns: 2.6rem 2.6rem minmax(0, 1fr);

        .line-mail {
          display: none;
        }
      }
    }

    @keyframes line-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    .line-n {
      color: var(--text-3);
      font-family: var(--font-mono);
    }

    .line-mail {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-2);
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }

    .line-status {
      font: 650 0.9rem/1 var(--font-mono);
      color: var(--req);
    }

    .line.is-429 .line-status {
      color: var(--err);
    }

    .line-text {
      color: var(--text-2);
    }

    .empty {
      margin: 12px 0 0;
      color: var(--text-3);
    }

    @media (prefers-reduced-motion: reduce) {
      .line {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatelimitLab {
  readonly gwUrl = GW_URL;
  readonly lockUrl = LOCK_URL;
  readonly limite = LIMITE_LOGIN;
  readonly maxIntentos = MAX_INTENTOS_LOGIN;

  readonly modo = signal<Modo>('una');
  readonly log = signal<Linea[]>([]);
  readonly llegan = signal(0);
  readonly cortadas = signal(0);
  readonly enRafaga = signal(false);
  readonly cuentasDistintas = signal(0);

  /** Reloj simulado en segundos: el real más lo que se adelante con los botones. */
  private readonly ahora = signal(0);
  private offset = 0;
  private t0 = 0;
  private ventana = new Ventana();
  private cuenta = new Cuenta();
  private n = 0;
  private tick: ReturnType<typeof setInterval> | undefined;
  private burst: ReturnType<typeof setInterval> | undefined;
  /** Versión del estado mutable, para que los computed se recalculen. */
  private readonly rev = signal(0);

  readonly usadasVentana = computed(() => {
    this.rev();
    const t = this.ahora();
    const v = this.ventana;
    if (v.inicio === null || t - v.inicio >= VENTANA_SEGUNDOS) return 0;
    return v.contador;
  });

  readonly dentroVentana = computed(() => Math.min(this.usadasVentana(), LIMITE_LOGIN));

  readonly cortadasVentana = computed(() => Math.max(0, this.usadasVentana() - LIMITE_LOGIN));

  readonly restanteVentana = computed(() => {
    this.rev();
    const v = this.ventana;
    if (v.inicio === null) return VENTANA_SEGUNDOS;
    return Math.max(0, Math.ceil(VENTANA_SEGUNDOS - (this.ahora() - v.inicio)));
  });

  /** 0 vacía, 1 dentro del cupo, 2 cortada (se marca la última celda). */
  readonly celdasGw = computed(() => {
    const usadas = this.usadasVentana();
    return Array.from({ length: LIMITE_LOGIN }, (_, i) =>
      usadas > LIMITE_LOGIN && i === LIMITE_LOGIN - 1 ? 2 : i < usadas ? 1 : 0,
    );
  });

  readonly bloqueada = computed(() => {
    this.rev();
    return this.modo() === 'una' && this.cuenta.bloqueadaHasta > this.ahora();
  });

  readonly intentosCuenta = computed(() => {
    this.rev();
    return this.cuenta.intentos;
  });

  readonly celdasCuenta = computed(() => {
    const k = this.bloqueada() ? MAX_INTENTOS_LOGIN : this.intentosCuenta();
    return Array.from({ length: MAX_INTENTOS_LOGIN }, (_, i) => i < k);
  });

  readonly restanteBloqueo = computed(() => {
    this.rev();
    const s = Math.max(0, Math.ceil(this.cuenta.bloqueadaHasta - this.ahora()));
    const m = Math.floor(s / 60);
    return `${m} min ${String(s % 60).padStart(2, '0')} s`;
  });

  constructor() {
    afterNextRender(() => {
      this.t0 = performance.now();
      this.tick = setInterval(() => this.ahora.set(this.reloj()), 500);
    });
    inject(DestroyRef).onDestroy(() => {
      clearInterval(this.tick);
      clearInterval(this.burst);
    });
  }

  setModo(m: Modo): void {
    if (m === this.modo()) return;
    this.modo.set(m);
    this.reiniciar();
  }

  enviar(): void {
    const t = this.reloj();
    this.ahora.set(t);
    this.n++;
    const correo = this.modo() === 'una' ? 'ana@ejemplo.com' : `usuario${this.n}@ejemplo.com`;
    if (this.modo() === 'muchas') this.cuentasDistintas.update((c) => c + 1);

    let linea: Linea;
    if (!this.ventana.permitir(t)) {
      this.cortadas.update((c) => c + 1);
      linea = {
        n: this.n,
        correo,
        status: 429,
        texto: 'Too Many Requests: el Gateway corta sin llegar al servicio',
      };
    } else {
      this.llegan.update((c) => c + 1);
      const cuenta = this.modo() === 'una' ? this.cuenta : new Cuenta();
      linea = { n: this.n, correo, status: 400, texto: cuenta.loginFallido(t) };
    }
    this.log.update((l) => [linea, ...l].slice(0, 40));
    this.rev.update((v) => v + 1);
  }

  rafaga(): void {
    if (this.enRafaga()) return;
    this.enRafaga.set(true);
    let k = 0;
    this.burst = setInterval(() => {
      this.enviar();
      if (++k >= 10) {
        clearInterval(this.burst);
        this.enRafaga.set(false);
      }
    }, 110);
  }

  adelantar(segundos: number): void {
    this.offset += segundos;
    this.ahora.set(this.reloj());
    this.rev.update((v) => v + 1);
  }

  reiniciar(): void {
    clearInterval(this.burst);
    this.enRafaga.set(false);
    this.ventana = new Ventana();
    this.cuenta = new Cuenta();
    this.n = 0;
    this.log.set([]);
    this.llegan.set(0);
    this.cortadas.set(0);
    this.cuentasDistintas.set(0);
    this.rev.update((v) => v + 1);
  }

  private reloj(): number {
    return (performance.now() - this.t0) / 1000 + this.offset;
  }
}
