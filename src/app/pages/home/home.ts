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
}
