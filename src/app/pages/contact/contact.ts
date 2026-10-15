import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PROFILE } from '../../data/profile';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-contact',
  imports: [Icon],
  template: `
    <div class="page wrap">
      <header class="page-head">
        <h1>Contacto</h1>
        <p>
          Busco trabajo como desarrollador backend Java o full stack. Puedo empezar ya, en Cáceres,
          en híbrido o en remoto. Si tienes una oferta o quieres comentar alguno de los proyectos,
          escríbeme.
        </p>
      </header>

      <div class="mail">
        <p class="mail-label">Correo</p>
        <a class="mail-address" [href]="'mailto:' + profile.email">{{ profile.email }}</a>
        <div class="mail-actions">
          <a class="btn btn--primary" [href]="'mailto:' + profile.email">
            <app-icon name="mail" />
            Escribir un correo
          </a>
          <button type="button" class="btn" (click)="copy()">
            <app-icon [name]="copied() ? 'check' : 'copy'" />
            {{ copied() ? 'Copiado' : 'Copiar dirección' }}
          </button>
          <span class="visually-hidden" aria-live="polite">{{
            copied() ? 'Dirección copiada' : ''
          }}</span>
        </div>
      </div>

      <ul class="links">
        <li>
          <a [href]="profile.linkedin" target="_blank" rel="noopener">
            <span class="ic"><app-icon name="person" /></span>
            <span class="t">LinkedIn</span>
            <span class="d">Experiencia, formación y publicaciones.</span>
          </a>
        </li>
        <li>
          <a [href]="profile.github" target="_blank" rel="noopener">
            <span class="ic"><app-icon name="code" /></span>
            <span class="t">GitHub</span>
            <span class="d">El código de ScoreVia, FitJourney y esta web.</span>
          </a>
        </li>
        <li>
          <a [href]="profile.cv" download>
            <span class="ic"><app-icon name="download" /></span>
            <span class="t">CV en PDF</span>
            <span class="d">El currículum completo para descargar.</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: `
    .mail {
      padding: 28px;
      border: 1px solid var(--line-2);
      border-radius: 22px;
      background: var(--surface);

      @media (min-width: 720px) {
        padding: 40px;
      }
    }

    .mail-label {
      margin: 0;
      color: var(--text-3);
    }

    .mail-address {
      display: inline-block;
      margin-top: 6px;
      font: 650 clamp(1.35rem, 0.9rem + 2.6vw, 2.6rem) / 1.15 var(--font-display);
      letter-spacing: -0.025em;
      color: var(--text);
      text-decoration: none;
      overflow-wrap: anywhere;

      &:hover {
        color: var(--req);
      }
    }

    .mail-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 26px;
    }

    .links {
      display: grid;
      gap: 12px;
      margin: 14px 0 0;
      padding: 0;
      list-style: none;

      @media (min-width: 760px) {
        grid-template-columns: repeat(3, 1fr);
      }

      a {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2px 14px;
        height: 100%;
        padding: 20px;
        border: 1px solid var(--line-2);
        border-radius: 16px;
        background: var(--surface);
        color: var(--text);
        text-decoration: none;
        transition: border-color 0.15s;
      }

      a:hover {
        border-color: var(--req-line);
      }
    }

    .ic {
      grid-row: span 2;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--surface-3);
      color: var(--req);
      font-size: 1.15rem;
    }

    .t {
      font: 650 1.1rem/1.3 var(--font-display);
    }

    .d {
      font-size: 0.92rem;
      color: var(--text-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  readonly profile = PROFILE;
  readonly copied = signal(false);

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profile.email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2200);
    } catch {
      window.location.href = `mailto:${this.profile.email}`;
    }
  }
}
