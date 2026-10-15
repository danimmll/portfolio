import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { PROFILE } from './data/profile';
import { Icon } from './shared/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly profile = PROFILE;
  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);

  readonly nav = [
    { path: '/', label: 'Inicio', exact: true },
    { path: '/proyectos', label: 'Proyectos', exact: false },
    { path: '/cv', label: 'CV', exact: true },
    { path: '/stack', label: 'Stack', exact: true },
    { path: '/contacto', label: 'Contacto', exact: true },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
