import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROJECTS } from '../../data/projects';
import { ProjectCard } from '../../shared/project-card';

@Component({
  selector: 'app-projects',
  imports: [ProjectCard],
  template: `
    <div class="page wrap">
      <header class="page-head">
        <h1>Proyectos</h1>
        <p>
          Cada proyecto tiene un diagrama interactivo de cómo funciona por dentro. Elige un flujo y
          avanza paso a paso: verás qué pieza trabaja, qué viaja entre ellas, el código real de ese
          momento y por qué está hecho así.
        </p>
      </header>
      <div class="list">
        @for (p of projects; track p.slug) {
          <app-project-card [project]="p" [full]="true" />
        }
      </div>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  readonly projects = PROJECTS;
}
