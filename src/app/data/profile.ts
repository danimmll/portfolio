export const PROFILE = {
  name: 'Daniel Martín López',
  role: 'Desarrollador Full Stack Java',
  intro:
    'Me centro en el backend: Java, Spring Boot y microservicios. En el front trabajo con Angular y Android. Terminé DAM en 2026, hice las prácticas en VIEWNEXT y ahora estudio Ingeniería Informática en la Universidad de Extremadura mientras busco trabajo como desarrollador.',
  email: 'danielmartinlopez7@gmail.com',
  github: 'https://github.com/danimmll',
  linkedin: 'https://www.linkedin.com/in/daniel-martin-lopez-380996337',
  cv: '/cv-daniel-martin-lopez.pdf',
  photo: '/daniel-martin-lopez.webp',
  photoFallback: '/daniel-martin-lopez.jpg',
  facts: [
    { label: 'Ubicación', value: 'Cáceres, España' },
    { label: 'Disponibilidad', value: 'Inmediata' },
    { label: 'Modalidad', value: 'Presencial, híbrida o en remoto' },
    { label: 'Idiomas', value: 'Español nativo, inglés B2' },
  ],
};

export const EXPERIENCE = [
  {
    company: 'VIEWNEXT',
    role: 'Desarrollador Java en prácticas',
    period: 'Feb. 2026 – Jun. 2026',
    place: 'Cáceres, presencial',
    points: [
      'Proyecto de AXA: resolución de incidencias y mantenimiento evolutivo de aplicaciones del sector asegurador.',
      'Procesamiento de ficheros con Spring Batch y depuración de consultas en Oracle SQL.',
      'Trabajo en equipo con metodología ágil, control de versiones con Git y los estándares de calidad del cliente.',
    ],
  },
  {
    company: 'VIEWNEXT',
    role: 'Formación en desarrollo Java',
    period: 'May. 2025',
    place: 'En remoto',
    points: [],
  },
];

export const EDUCATION = [
  {
    title: 'Grado en Ingeniería Informática',
    center: 'Universidad de Extremadura, Escuela Politécnica de Cáceres',
    period: '2026 – actualidad',
  },
  {
    title: 'CFGS en Desarrollo de Aplicaciones Multiplataforma',
    center: 'IES Ágora, Cáceres',
    period: '2024 – 2026',
  },
  {
    title: 'Certificado de inglés B2',
    center: 'Escuela Oficial de Idiomas',
    period: '2024',
  },
  {
    title: 'Spring Framework & Spring Boot desde cero a experto',
    center: 'Udemy',
    period: '2026',
  },
  {
    title: 'Lambdas y Streams en Java',
    center: 'Udemy',
    period: '2026',
  },
];

/** Cada tecnología con el sitio donde la he usado de verdad. */
export const STACK = [
  {
    area: 'Backend',
    items: [
      { tech: 'Java 21 y Spring Boot', where: 'ScoreVia, prácticas en VIEWNEXT' },
      { tech: 'Spring Cloud: Gateway, Eureka, OpenFeign', where: 'ScoreVia' },
      { tech: 'Spring Security y JWT', where: 'ScoreVia' },
      { tech: 'Spring Batch', where: 'Prácticas en VIEWNEXT' },
      { tech: 'Resilience4j: circuit breaker y rate limiter', where: 'ScoreVia' },
      { tech: 'Node.js, Express y Prisma', where: 'FitJourney' },
    ],
  },
  {
    area: 'Frontend y móvil',
    items: [
      { tech: 'Angular con signals y SSR', where: 'ScoreVia, este portfolio' },
      { tech: 'Android en Java con MVVM y Retrofit', where: 'FitJourney' },
      { tech: 'TypeScript, HTML y CSS', where: 'ScoreVia, este portfolio' },
    ],
  },
  {
    area: 'Datos',
    items: [
      { tech: 'PostgreSQL', where: 'ScoreVia, FitJourney' },
      { tech: 'Oracle SQL', where: 'Prácticas en VIEWNEXT' },
      { tech: 'MySQL', where: 'CFGS DAM' },
    ],
  },
  {
    area: 'Entrega',
    items: [
      { tech: 'Docker Compose', where: 'ScoreVia' },
      { tech: 'Jenkins y SonarQube', where: 'ScoreVia' },
      { tech: 'GitHub Actions', where: 'ScoreVia' },
      { tech: 'Git', where: 'Todos los proyectos' },
      { tech: 'Render y Vercel', where: 'FitJourney, este portfolio' },
    ],
  },
];
