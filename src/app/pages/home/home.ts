import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EDUCATION, EXPERIENCE, PROFILE, STACK } from '../../data/profile';
import { PROJECTS } from '../../data/projects';
import { DiagramPreviewComponent } from '../../diagram/diagram-preview';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DiagramPreviewComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly profile = PROFILE;
  readonly projects = PROJECTS;
  readonly experience = EXPERIENCE;
  readonly education = EDUCATION;
  readonly stack = STACK;
}
