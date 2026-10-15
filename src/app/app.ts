import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PROFILE } from './data/profile';
import { Icon } from './shared/icon';
import { IconName } from './shared/icons';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  exact: boolean;
}

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

  readonly nav: NavItem[] = [
    { path: '/', label: 'Inicio', icon: 'home', exact: true },
    { path: '/proyectos', label: 'Proyectos', icon: 'projects', exact: false },
    { path: '/cv', label: 'CV', icon: 'file', exact: true },
    { path: '/stack', label: 'Stack', icon: 'code', exact: true },
    { path: '/contacto', label: 'Contacto', icon: 'mail', exact: true },
  ];
}
