import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';

const SUFFIX = 'Daniel Martín López';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: `${SUFFIX} · Desarrollador Full Stack Java`,
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./pages/projects/projects').then((m) => m.ProjectsPage),
    title: `Proyectos · ${SUFFIX}`,
  },
  {
    path: 'proyectos/:slug',
    loadComponent: () => import('./pages/project/project').then((m) => m.ProjectPage),
  },
  {
    path: 'cv',
    loadComponent: () => import('./pages/cv/cv').then((m) => m.CvPage),
    title: `Currículum · ${SUFFIX}`,
  },
  {
    path: 'stack',
    loadComponent: () => import('./pages/stack/stack').then((m) => m.StackPage),
    title: `Stack · ${SUFFIX}`,
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
    title: `Contacto · ${SUFFIX}`,
  },
  { path: '**', redirectTo: '' },
];
