import { Diagram } from '../diagram/diagram.model';
import { FITJOURNEY_DIAGRAM } from './fitjourney.diagram';
import { SCOREVIA_DIAGRAM } from './scorevia.diagram';

export interface Project {
  slug: string;
  sheet: string;
  name: string;
  tagline: string;
  description: string;
  decisions: { title: string; text: string }[];
  facts: { label: string; value: string }[];
  repo: string;
  extraLink?: { label: string; href: string };
  diagram: Diagram;
}

export const PROJECTS: Project[] = [
  {
    slug: 'scorevia',
    sheet: 'Hoja 1 de 2',
    name: 'ScoreVia',
    tagline: 'Plataforma de datos de fútbol con microservicios.',
    description:
      'Resultados en directo, estadísticas de equipos, jugadores, entrenadores y árbitros, y predicción de resultados. Cuatro microservicios en Spring Boot detrás de un API Gateway, frontend en Angular con SSR y PostgreSQL con un esquema por servicio.',
    decisions: [
      {
        title: 'Seguridad en dos capas',
        text: 'El Gateway limita peticiones por IP e inyecta un secreto interno; cada servicio lo valida en tiempo constante y vuelve a comprobar el JWT y el rol.',
      },
      {
        title: 'Una base, varios dueños',
        text: 'PostgreSQL con un esquema y un rol por microservicio: cada servicio solo puede tocar sus propias tablas.',
      },
      {
        title: 'Datos de un proveedor de pago',
        text: 'La ingesta pasa por un rate limiter, reintenta los fallos transitorios y deja siempre una reserva de cuota diaria intocable.',
      },
      {
        title: 'Errores en un solo sitio',
        text: 'Un aspecto de AOP manda cualquier excepción a incidencias, que la guarda para el panel de administración.',
      },
    ],
    facts: [
      { label: 'Tipo', value: 'Proyecto personal' },
      { label: 'Estado', value: 'En desarrollo' },
      { label: 'Backend', value: 'Java 21, Spring Boot 4, Spring Cloud' },
      { label: 'Frontend', value: 'Angular 21 con SSR' },
      {
        label: 'Volumen',
        value: '1,5 millones de partidos, 470.000 jugadores y 8,7 millones de eventos desde 2008',
      },
      { label: 'Infraestructura', value: 'Docker Compose, Jenkins, GitHub Actions' },
    ],
    repo: 'https://github.com/danimmll/Scorevia',
    diagram: SCOREVIA_DIAGRAM,
  },
  {
    slug: 'fitjourney',
    sheet: 'Hoja 2 de 2',
    name: 'FitJourney',
    tagline: 'App Android de entrenamiento con su propia API REST.',
    description:
      'Rutinas a medida, catálogo de ejercicios, registro de cada serie durante el entrenamiento e historial con métricas. App nativa en Java con MVVM y una API en Node.js con Prisma sobre PostgreSQL. Proyecto final del CFGS de DAM.',
    decisions: [
      {
        title: 'La vista solo pinta',
        text: 'Las pantallas observan LiveData; los ViewModel sobreviven a los giros y los repositorios son la única puerta a los datos.',
      },
      {
        title: 'Autenticación en un único sitio',
        text: 'Un interceptor de OkHttp pone el token en todas las llamadas y, si la API responde 401 o 403, cierra la sesión y vuelve al login.',
      },
      {
        title: 'Escrituras completas',
        text: 'Un entrenamiento y todas sus series se guardan con una sola operación anidada de Prisma.',
      },
    ],
    facts: [
      { label: 'Tipo', value: 'Proyecto final del CFGS de DAM' },
      { label: 'Año', value: '2026' },
      { label: 'App', value: 'Java, Android SDK 36, MVVM' },
      { label: 'API', value: 'Node.js, Express 5, Prisma' },
      { label: 'Documentación', value: '24 endpoints REST en Swagger' },
      { label: 'Datos', value: 'PostgreSQL en Supabase' },
    ],
    repo: 'https://github.com/danimmll/FitJourneyProject',
    extraLink: {
      label: 'Descargar el APK',
      href: 'https://github.com/danimmll/FitJourneyProject/raw/main/FitJourney/app/release/app-release.apk',
    },
    diagram: FITJOURNEY_DIAGRAM,
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
