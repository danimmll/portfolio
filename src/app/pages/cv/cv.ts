import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES, EDUCATION, EXPERIENCE, LANGUAGES, PROFILE } from '../../data/profile';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-cv',
  imports: [RouterLink, Icon],
  templateUrl: './cv.html',
  styleUrl: './cv.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvPage {
  readonly profile = PROFILE;
  readonly facts = PROFILE.facts.filter((f) => f.label !== 'Idiomas');
  readonly experience = EXPERIENCE;
  readonly education = EDUCATION;
  readonly courses = COURSES;
  readonly languages = LANGUAGES;
}
