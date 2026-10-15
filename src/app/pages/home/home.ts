import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXPERIENCE, PROFILE } from '../../data/profile';
import { PROJECTS } from '../../data/projects';
import { Icon } from '../../shared/icon';
import { ProjectCard } from '../../shared/project-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, ProjectCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly profile = PROFILE;
  readonly projects = PROJECTS;
  readonly job = EXPERIENCE[0];

  readonly sections = [
    {
      path: '/cv',
      title: 'Currículum',
      text: 'Prácticas en VIEWNEXT, formación y el CV completo en PDF.',
      icon: 'file' as const,
    },
    {
      path: '/stack',
      title: 'Stack',
      text: 'Cada tecnología y el sitio exacto donde la he usado.',
      icon: 'code' as const,
    },
    {
      path: '/contacto',
      title: 'Contacto',
      text: 'Correo, LinkedIn y GitHub, a un clic.',
      icon: 'mail' as const,
    },
  ];
}
