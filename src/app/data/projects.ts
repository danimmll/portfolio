import { Diagram } from '../diagram/diagram.model';
import { FITJOURNEY_DIAGRAM } from './fitjourney.diagram';
import { SCOREVIA_DIAGRAM } from './scorevia.diagram';

export interface Project {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  description: string;
  metrics: { value: string; label: string }[];
  stack: string[];
  decisions: { title: string; text: string }[];
  facts: { label: string; value: string }[];
  repo: string;
  extraLink?: { label: string; href: string };
  diagram: Diagram;
  /** Demos interactivas con la lógica real del proyecto. */
  labs: ('prediction' | 'ratelimit' | 'calories')[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'scorevia',
    name: 'ScoreVia',
    kind: 'Proyecto personal, en desarrollo',
    tagline: 'Plataforma de datos de fútbol con microservicios.',
    description:
      'Resultados en directo, estadísticas de equipos, jugadores, entrenadores y árbitros, y predicción de resultados. Cuatro microservicios en Spring Boot detrás de un API Gateway, frontend en Angular con SSR y PostgreSQL con un esquema por servicio.',
    metrics: [
      { value: '4', label: 'microservicios detrás de un Gateway' },
      { value: '1,5 M', label: 'partidos desde 2008' },
      { value: '8,7 M', label: 'eventos de partido' },
      { value: '150.000', label: 'peticiones al día de cuota' },
    ],
    stack: [
      'Java 21',
      'Spring Boot 4',
      'Spring Cloud',
      'Resilience4j',
      'Angular 21',
      'PostgreSQL',
      'Docker',
    ],
    decisions: [
      {
        title: 'Seguridad en dos capas',
        text: 'El Gateway limita peticiones por IP e inyecta un secreto interno; cada servicio lo compara en tiempo constante y vuelve a comprobar el JWT y el rol.',
      },
      {
        title: 'Una base, varios dueños',
        text: 'PostgreSQL con un esquema y un usuario por microservicio: cada servicio solo puede tocar sus propias tablas.',
      },
      {
        title: 'Datos de un proveedor de pago',
        text: 'La ingesta pasa por un rate limiter y un circuit breaker, reintenta los fallos transitorios y deja siempre una reserva de cuota intocable.',
      },
      {
        title: 'Sesiones difíciles de robar',
        text: 'Access token de 15 minutos solo en memoria y refresh token en cookie HttpOnly que se rota en cada uso; si alguien reutiliza uno viejo, se cierran todas las sesiones.',
      },
      {
        title: 'Fallar rápido y con claridad',
        text: 'Circuit breakers en el Gateway y en las llamadas entre servicios: si algo cae, el usuario recibe un 503 limpio en vez de esperar un timeout.',
      },
      {
        title: 'Errores en un solo sitio',
        text: 'Un aspecto de AOP manda las excepciones reales a incidencias, que las guarda para el panel de administración.',
      },
    ],
    facts: [
      { label: 'Tipo', value: 'Proyecto personal' },
      { label: 'Estado', value: 'En desarrollo' },
      { label: 'Backend', value: 'Java 21, Spring Boot 4, Spring Cloud' },
      { label: 'Frontend', value: 'Angular 21 con SSR' },
      { label: 'Datos', value: 'PostgreSQL, un esquema por servicio' },
      { label: 'Infraestructura', value: 'Docker Compose, Jenkins, GitHub Actions' },
    ],
    repo: 'https://github.com/danimmll/Scorevia',
    diagram: SCOREVIA_DIAGRAM,
    labs: ['prediction', 'ratelimit'],
  },
  {
    slug: 'fitjourney',
    name: 'FitJourney',
    kind: 'Proyecto final del CFGS de DAM',
    tagline: 'App Android de entrenamiento con su propia API REST.',
    description:
      'Rutinas a medida, catálogo de ejercicios, registro de cada serie durante el entrenamiento e historial con métricas. App nativa en Java con MVVM y una API en Node.js con Prisma sobre PostgreSQL.',
    metrics: [
      { value: '24', label: 'endpoints REST documentados' },
      { value: 'MVVM', label: 'arquitectura de la app' },
      { value: '3', label: 'flujos explicados paso a paso' },
    ],
    stack: ['Java', 'Android', 'Retrofit', 'Node.js', 'Express 5', 'Prisma', 'PostgreSQL'],
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
        text: 'Un entrenamiento y todas sus series se guardan con una sola operación anidada de Prisma: o se guarda todo o nada.',
      },
      {
        title: 'Calorías en el móvil',
        text: 'El cálculo por MET se hace en la app, con el tipo de ejercicio, el peso del usuario y la duración, y la API solo guarda el resultado.',
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
    labs: ['calories'],
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
