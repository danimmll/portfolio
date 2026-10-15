import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { PROJECTS, projectBySlug } from '../../data/projects';
import { PROFILE } from '../../data/profile';
import { DiagramComponent } from '../../diagram/diagram';
import { Icon } from '../../shared/icon';
import { CaloriesLab } from '../../labs/calories-lab';
import { PredictionLab } from '../../labs/prediction-lab';

@Component({
  selector: 'app-project',
  imports: [RouterLink, DiagramComponent, Icon, PredictionLab, CaloriesLab],
  templateUrl: './project.html',
  styleUrl: './project.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  /** Parámetros de ruta y de consulta, gracias a withComponentInputBinding. */
  readonly slug = input.required<string>();
  readonly escenario = input<string>();
  readonly paso = input<string>();

  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly project = computed(() => projectBySlug(this.slug()));

  readonly nextProject = computed(() => {
    const i = PROJECTS.findIndex((p) => p.slug === this.slug());
    return PROJECTS[(i + 1) % PROJECTS.length];
  });

  constructor() {
    effect(() => {
      const p = this.project();
      if (!p) {
        this.router.navigateByUrl('/proyectos');
        return;
      }
      this.title.setTitle(`${p.name} · ${PROFILE.name}`);
      this.meta.updateTag({ name: 'description', content: `${p.tagline} ${p.description}` });
      this.meta.updateTag({ property: 'og:title', content: `${p.name} · ${PROFILE.name}` });
      this.meta.updateTag({ property: 'og:description', content: p.tagline });
    });
  }
}
