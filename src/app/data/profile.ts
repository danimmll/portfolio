export const PROFILE = {
  name: 'Daniel Martín López',
  role: 'Desarrollador Full Stack Java',
  status: 'Disponible para trabajar ya',
  intro:
    'Me centro en el backend: Java, Spring Boot y microservicios. En el front trabajo con Angular y Android. Terminé DAM en 2026, hice las prácticas en VIEWNEXT y ahora estudio Ingeniería Informática en la Universidad de Extremadura mientras busco trabajo como desarrollador.',
  email: 'danielmartinlopez7@gmail.com',
  github: 'https://github.com/danimmll',
  linkedin: 'https://www.linkedin.com/in/daniel-martin-lopez-380996337',
  cv: '/cv-daniel-martin-lopez.pdf',
  photo: '/daniel-martin-lopez.webp',
  photoFallback: '/daniel-martin-lopez.jpg',
  location: 'Cáceres, España',
  facts: [
    { label: 'Ubicación', value: 'Cáceres, España' },
    { label: 'Disponibilidad', value: 'Inmediata' },
    { label: 'Modalidad', value: 'Presencial, híbrida o en remoto' },
    { label: 'Idiomas', value: 'Español nativo, inglés B2' },
  ],
};

export interface Experience {
  company: string;
  role: string;
  period: string;
  place: string;
  points: string[];
  tags: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    company: 'VIEWNEXT',
    role: 'Desarrollador Java en prácticas',
    period: 'Feb. – jun. 2026',
    place: 'Cáceres, presencial',
    points: [
      'Proyecto de AXA: resolución de incidencias y mantenimiento evolutivo de aplicaciones del sector asegurador.',
      'Procesamiento de ficheros con Spring Batch y depuración de consultas en Oracle SQL.',
      'Trabajo en equipo con metodología ágil, control de versiones con Git y los estándares de calidad del cliente.',
    ],
    tags: ['Java', 'Spring Batch', 'Oracle SQL', 'Git', 'Metodología ágil'],
  },
  {
    company: 'VIEWNEXT',
    role: 'Formación en desarrollo Java',
    period: 'May. 2025',
    place: 'En remoto',
    points: [],
    tags: ['Java'],
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
];

export const COURSES = [
  { title: 'Spring Framework & Spring Boot desde cero a experto', center: 'Udemy', period: '2026' },
  { title: 'Lambdas y Streams en Java', center: 'Udemy', period: '2026' },
];

export const LANGUAGES = [
  { name: 'Español', level: 'Nativo' },
  { name: 'Inglés', level: 'B2, Escuela Oficial de Idiomas' },
];

/** Un sitio donde he usado una tecnología. Si lleva escenario, abre el diagrama en ese paso. */
export interface Usage {
  text: string;
  link: string;
  scenario?: string;
  step?: number;
  external?: boolean;
}

export interface Tech {
  name: string;
  uses: Usage[];
}

const SV = '/proyectos/scorevia';
const FJ = '/proyectos/fitjourney';

export const STACK: { group: string; items: Tech[] }[] = [
  {
    group: 'Lenguajes',
    items: [
      {
        name: 'Java',
        uses: [
          { text: 'Los cuatro microservicios, el Gateway y Eureka de ScoreVia', link: SV },
          { text: 'La app Android de FitJourney, con MVVM', link: FJ },
          { text: 'Prácticas en VIEWNEXT, en el proyecto de AXA', link: '/cv' },
        ],
      },
      {
        name: 'TypeScript',
        uses: [
          {
            text: 'El frontend de ScoreVia en Angular',
            link: SV,
            scenario: 'prediccion-directo',
            step: 1,
          },
          {
            text: 'Esta web, con diagramas generados desde datos',
            link: 'https://github.com/danimmll/portfolio',
            external: true,
          },
        ],
      },
      {
        name: 'JavaScript',
        uses: [
          { text: 'La API de FitJourney en Node.js', link: FJ, scenario: 'entrenamiento', step: 4 },
        ],
      },
      {
        name: 'SQL',
        uses: [
          {
            text: 'Índices únicos por clave natural en ScoreVia',
            link: SV,
            scenario: 'ingesta',
            step: 5,
          },
          { text: 'Depuración de consultas en Oracle durante las prácticas', link: '/cv' },
        ],
      },
    ],
  },
  {
    group: 'Backend',
    items: [
      {
        name: 'Spring Boot',
        uses: [
          { text: 'Cada microservicio de ScoreVia', link: SV },
          { text: 'Prácticas en VIEWNEXT', link: '/cv' },
        ],
      },
      {
        name: 'Spring Cloud Gateway',
        uses: [
          {
            text: 'Límite por IP y secreto interno en cada petición',
            link: SV,
            scenario: 'login-google',
            step: 3,
          },
          { text: 'Circuit breaker por ruta con respuesta 503', link: SV },
        ],
      },
      {
        name: 'Eureka',
        uses: [
          {
            text: 'El Gateway resuelve los servicios por nombre',
            link: SV,
            scenario: 'login-google',
            step: 2,
          },
        ],
      },
      {
        name: 'OpenFeign',
        uses: [
          {
            text: 'predicciones pide el contexto a estadísticas',
            link: SV,
            scenario: 'prediccion-directo',
            step: 4,
          },
          {
            text: 'Los servicios mandan sus errores a incidencias',
            link: SV,
            scenario: 'ingesta',
            step: 6,
          },
        ],
      },
      {
        name: 'Spring Security y JWT',
        uses: [
          {
            text: 'Validación del token y del rol en cada servicio',
            link: SV,
            scenario: 'prediccion-directo',
            step: 3,
          },
          {
            text: 'Refresh token rotado con detección de reuso',
            link: SV,
            scenario: 'login-google',
            step: 6,
          },
          {
            text: 'Login con Google verificando el ID token',
            link: SV,
            scenario: 'login-google',
            step: 4,
          },
        ],
      },
      {
        name: 'Resilience4j',
        uses: [
          {
            text: 'Rate limiter y circuit breaker contra API-Football',
            link: SV,
            scenario: 'ingesta',
            step: 2,
          },
          { text: 'El circuito del Gateway se abre si un servicio cae', link: SV },
        ],
      },
      {
        name: 'Caffeine',
        uses: [
          {
            text: 'Caché de 15 s del contexto en directo',
            link: SV,
            scenario: 'prediccion-directo',
            step: 4,
          },
        ],
      },
      {
        name: 'Spring Batch',
        uses: [{ text: 'Procesamiento de ficheros en las prácticas de VIEWNEXT', link: '/cv' }],
      },
      {
        name: 'Node.js y Express',
        uses: [
          {
            text: 'API REST de FitJourney con middleware JWT',
            link: FJ,
            scenario: 'entrenamiento',
            step: 4,
          },
        ],
      },
      {
        name: 'Prisma',
        uses: [
          {
            text: 'Escritura anidada de un entrenamiento con sus series',
            link: FJ,
            scenario: 'entrenamiento',
            step: 5,
          },
        ],
      },
    ],
  },
  {
    group: 'Frontend y móvil',
    items: [
      {
        name: 'Angular',
        uses: [
          { text: 'Interceptor que renueva la sesión sin que se note', link: SV },
          {
            text: 'Esta web, prerenderizada y sin servidor',
            link: 'https://github.com/danimmll/portfolio',
            external: true,
          },
        ],
      },
      {
        name: 'Android',
        uses: [
          {
            text: 'FitJourney: Fragments, ViewModel y LiveData',
            link: FJ,
            scenario: 'login',
            step: 1,
          },
        ],
      },
      {
        name: 'Retrofit y OkHttp',
        uses: [
          {
            text: 'Interceptor que añade el token a cada llamada',
            link: FJ,
            scenario: 'entrenamiento',
            step: 3,
          },
        ],
      },
    ],
  },
  {
    group: 'Datos',
    items: [
      {
        name: 'PostgreSQL',
        uses: [
          {
            text: 'ScoreVia: un esquema y un usuario por microservicio',
            link: SV,
            scenario: 'ingesta',
            step: 5,
          },
          { text: 'FitJourney, en Supabase', link: FJ, scenario: 'entrenamiento', step: 5 },
        ],
      },
      {
        name: 'Oracle',
        uses: [{ text: 'Depuración de consultas en el proyecto de AXA', link: '/cv' }],
      },
      {
        name: 'MySQL',
        uses: [{ text: 'Proyectos del ciclo de DAM', link: '/cv' }],
      },
    ],
  },
  {
    group: 'Entrega',
    items: [
      {
        name: 'Docker',
        uses: [
          {
            text: 'ScoreVia entero con Docker Compose',
            link: 'https://github.com/danimmll/Scorevia',
            external: true,
          },
        ],
      },
      {
        name: 'GitHub Actions',
        uses: [
          {
            text: 'Integración continua de ScoreVia',
            link: 'https://github.com/danimmll/Scorevia',
            external: true,
          },
        ],
      },
      {
        name: 'Jenkins',
        uses: [
          {
            text: 'Pipeline de ScoreVia',
            link: 'https://github.com/danimmll/Scorevia',
            external: true,
          },
        ],
      },
      {
        name: 'Git',
        uses: [
          { text: 'Todos mis proyectos', link: 'https://github.com/danimmll', external: true },
          { text: 'Trabajo en equipo en VIEWNEXT', link: '/cv' },
        ],
      },
      {
        name: 'OpenAPI y Swagger',
        uses: [{ text: 'Los 24 endpoints de la API de FitJourney', link: FJ }],
      },
      {
        name: 'Vercel y Render',
        uses: [
          {
            text: 'Esta web, en Vercel',
            link: 'https://github.com/danimmll/portfolio',
            external: true,
          },
          { text: 'La API de FitJourney, en Render', link: FJ },
        ],
      },
    ],
  },
];
