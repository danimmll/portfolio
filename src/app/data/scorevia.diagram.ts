import { Diagram } from '../diagram/diagram.model';

/**
 * Arquitectura real de ScoreVia (github.com/danimmll/Scorevia). Los pasos citan los
 * endpoints y clases tal como están en el código.
 */
export const SCOREVIA_DIAGRAM: Diagram = {
  title: 'Arquitectura de ScoreVia',
  size: { d: [960, 490], m: [360, 430] },
  nodes: [
    {
      id: 'nav',
      label: 'Navegador',
      sub: 'Angular 21 con SSR',
      subM: 'Angular',
      d: { x: 20, y: 228, w: 150, h: 56 },
      m: { x: 8, y: 10, w: 100, h: 50 },
    },
    {
      id: 'gw',
      label: 'API Gateway',
      sub: 'Spring Cloud Gateway',
      subM: 'Spring Cloud',
      d: { x: 230, y: 228, w: 170, h: 56 },
      m: { x: 8, y: 130, w: 100, h: 50 },
    },
    {
      id: 'eureka',
      label: 'Eureka',
      sub: 'registro de servicios',
      subM: 'registro',
      d: { x: 230, y: 70, w: 170, h: 56 },
      m: { x: 8, y: 250, w: 100, h: 50 },
    },
    {
      id: 'usr',
      label: 'usuarios-roles',
      sub: 'cuentas, JWT, OAuth',
      subM: 'JWT y OAuth',
      d: { x: 470, y: 40, w: 180, h: 56 },
      m: { x: 128, y: 40, w: 112, h: 50 },
    },
    {
      id: 'pred',
      label: 'predicciones',
      sub: 'Dixon-Coles',
      subM: 'Dixon-Coles',
      d: { x: 470, y: 165, w: 180, h: 56 },
      m: { x: 128, y: 150, w: 112, h: 50 },
    },
    {
      id: 'est',
      label: 'estadísticas',
      sub: 'ingesta y consultas',
      subM: 'ingesta',
      d: { x: 470, y: 290, w: 180, h: 56 },
      m: { x: 128, y: 260, w: 112, h: 50 },
    },
    {
      id: 'inc',
      label: 'incidencias',
      sub: 'errores y reportes',
      subM: 'errores',
      d: { x: 470, y: 415, w: 180, h: 56 },
      m: { x: 128, y: 370, w: 112, h: 50 },
    },
    {
      id: 'google',
      label: 'Google',
      sub: 'Identity',
      subM: 'Identity',
      d: { x: 740, y: 40, w: 190, h: 56 },
      m: { x: 262, y: 40, w: 90, h: 50 },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'un esquema por servicio',
      subM: 'esquemas',
      d: { x: 740, y: 228, w: 190, h: 56 },
      m: { x: 262, y: 190, w: 90, h: 50 },
    },
    {
      id: 'af',
      label: 'API-Football',
      sub: 'proveedor de datos',
      subM: 'datos',
      d: { x: 740, y: 330, w: 190, h: 56 },
      m: { x: 262, y: 300, w: 90, h: 50 },
    },
  ],
  edges: [
    { id: 'nav-gw', from: 'nav', to: 'gw', label: 'HTTPS' },
    { id: 'gw-eureka', from: 'gw', to: 'eureka' },
    { id: 'gw-usr', from: 'gw', to: 'usr' },
    { id: 'gw-pred', from: 'gw', to: 'pred' },
    { id: 'gw-est', from: 'gw', to: 'est' },
    { id: 'gw-inc', from: 'gw', to: 'inc' },
    { id: 'usr-google', from: 'usr', to: 'google' },
    { id: 'usr-db', from: 'usr', to: 'db' },
    { id: 'pred-est', from: 'pred', to: 'est', label: 'Feign' },
    { id: 'est-db', from: 'est', to: 'db' },
    { id: 'est-af', from: 'est', to: 'af', elbow: { d: 715, m: 246 } },
    { id: 'est-inc', from: 'est', to: 'inc', label: 'Feign' },
    { id: 'inc-db', from: 'inc', to: 'db' },
  ],
  scenarios: [
    {
      id: 'login-google',
      name: 'Iniciar sesión con Google',
      summary:
        'Del botón de Google a una sesión con JWT, sin que el backend tenga que fiarse de lo que le manda el navegador.',
      steps: [
        {
          title: 'El navegador manda el token de Google',
          text: 'Google identifica al usuario en el navegador y devuelve un ID token firmado. Angular se lo envía al backend.',
          why: 'La app nunca ve la contraseña de Google: solo recibe un token que el servidor puede comprobar por su cuenta.',
          code: ['POST /api/v1/auth/google'],
          edges: [{ id: 'nav-gw' }],
        },
        {
          title: 'El Gateway busca dónde está usuarios-roles',
          text: 'La ruta apunta a lb://MICROSERVICIO-USUARIOS-ROLES. El Gateway le pide a Eureka las instancias vivas y elige una.',
          why: 'Ningún servicio tiene direcciones escritas a mano: se pueden mover o escalar sin tocar el Gateway.',
          edges: [{ id: 'gw-eureka' }],
        },
        {
          title: 'Filtra la petición y la reenvía',
          text: 'Antes de pasarla aplica el límite de 20 peticiones por minuto e IP de las rutas de login, y escribe la cabecera X-Internal-Secret machacando la que pudiera traer el cliente.',
          why: 'Cada microservicio rechaza lo que no venga del Gateway, así que no basta con conocer su puerto para saltárselo.',
          code: ['AuthRateLimiterFilter', 'InternalSecretRelayFilter'],
          edges: [{ id: 'gw-usr' }],
        },
        {
          title: 'usuarios-roles verifica el token con Google',
          text: 'GoogleIdTokenVerifier comprueba la firma, que el token sea para el client ID de ScoreVia y que no haya caducado.',
          why: 'El correo se toma del token verificado, nunca de un campo que pueda manipular el cliente.',
          code: ['GoogleIdTokenVerifier'],
          edges: [{ id: 'usr-google' }],
        },
        {
          title: 'Busca o crea la cuenta',
          text: 'Si el correo ya existe, inicia sesión con esa cuenta. Si no, la crea con el correo ya verificado y el rol FREE.',
          edges: [{ id: 'usr-db' }],
        },
        {
          title: 'Devuelve la sesión',
          text: 'La respuesta lleva un access token JWT de 15 minutos en el cuerpo y un refresh token de 7 días en una cookie HttpOnly.',
          why: 'El access token vive solo en memoria (un signal de Angular) y el refresh token no es legible desde JavaScript. Además se rota en cada uso y se revoca al cerrar sesión.',
          code: ['Set-Cookie: refreshToken; HttpOnly'],
          edges: [
            { id: 'gw-usr', back: true },
            { id: 'nav-gw', back: true },
          ],
        },
      ],
    },
    {
      id: 'prediccion-directo',
      name: 'Predicción en directo',
      summary:
        'Un usuario Premium abre un partido que se está jugando y ve cómo cambian las probabilidades con el marcador real.',
      steps: [
        {
          title: 'El navegador pide la predicción',
          text: 'Angular llama al endpoint con el minuto de juego y el access token en la cabecera Authorization.',
          code: ['GET /api/v1/predicciones/{id}/en-vivo?minuto=63'],
          edges: [{ id: 'nav-gw' }],
        },
        {
          title: 'El Gateway la manda a predicciones',
          text: 'Pasa por el límite general de 300 peticiones por minuto e IP y por un circuit breaker por ruta, y llega con el secreto interno.',
          edges: [{ id: 'gw-pred' }],
        },
        {
          title: 'Comprueba quién pide',
          text: 'El filtro JWT valida la firma y la caducidad, y el servicio comprueba el rol: solo PREMIUM o ADMIN.',
          why: 'La regla de negocio vive en el servicio y no solo en el Gateway, para que no dependa de una única barrera.',
          code: ['403 Forbidden si el rol es FREE'],
          nodes: ['pred'],
        },
        {
          title: 'Pide el contexto del partido a estadísticas',
          text: 'Con OpenFeign trae forma reciente, clasificación, cara a cara, bajas, estadísticas de jugadores y los eventos del partido.',
          why: 'Va detrás de un circuit breaker de Resilience4j con 5 s de límite, y el contexto en directo se cachea 15 s con Caffeine: muchos usuarios mirando el mismo partido no multiplican las llamadas.',
          code: ['GET /internal/contexto-prediccion', 'GET /internal/partidos/{id}/eventos'],
          edges: [{ id: 'pred-est' }],
        },
        {
          title: 'estadísticas lee de PostgreSQL',
          text: 'Las rutas /internal solo aceptan peticiones con el secreto compartido, comparado en tiempo constante. Las consultas usan @EntityGraph para no caer en N+1.',
          code: ['MessageDigest.isEqual', '@EntityGraph'],
          edges: [{ id: 'est-db' }, { id: 'pred-est', back: true }],
        },
        {
          title: 'Calcula con Dixon-Coles',
          text: 'Poisson por equipo con fuerza de ataque y defensa y ventaja de local, más la corrección de Dixon-Coles para marcadores bajos. En directo reduce los goles esperados según el minuto y castiga las expulsiones.',
          why: 'El marcador se lee siempre del servidor: el cliente solo manda el minuto, así que no puede falsear su propia predicción.',
          code: ['PredictionEngineServiceImpl'],
          nodes: ['pred'],
        },
        {
          title: 'Responde con las probabilidades',
          text: 'Victoria local, empate y victoria visitante, con los goles esperados que le quedan a cada equipo y el marcador con el que se ha calculado.',
          edges: [
            { id: 'gw-pred', back: true },
            { id: 'nav-gw', back: true },
          ],
        },
      ],
    },
    {
      id: 'ingesta',
      name: 'Ingesta automática',
      summary:
        'Así se mantienen al día los datos sin que nadie lance un script: tareas programadas contra un proveedor de pago con cuota diaria.',
      steps: [
        {
          title: 'Salta una tarea programada',
          text: 'Cada 30 segundos IngestaScheduler revisa los partidos en juego. Si la cuota de API-Football baja de la reserva mínima, se salta el ciclo.',
          code: ['@Scheduled(fixedRate = 30000)'],
          nodes: ['est'],
        },
        {
          title: 'Una petición para todo el directo',
          text: 'Pide de una vez todos los partidos en juego. El cliente pasa por un RateLimiter de Resilience4j y reintenta los fallos transitorios.',
          why: 'Una petición por ciclo cubre todos los partidos: el directo cuesta unas 2.900 peticiones al día de las 150.000 del plan.',
          code: ['GET /fixtures?live=all', '@RateLimiter("apiFootballRateLimiter")'],
          edges: [{ id: 'est-af' }, { id: 'est-af', back: true }],
        },
        {
          title: 'Actualiza marcador y eventos',
          text: 'Guarda minuto, marcador y eventos. Los partidos que acaban de terminar entran en una cola post-partido.',
          edges: [{ id: 'est-db' }],
        },
        {
          title: 'Completa los partidos terminados',
          text: 'La cola pide estadísticas, alineaciones y eventos completos de cada partido acabado: tres peticiones por partido.',
          edges: [{ id: 'est-af' }, { id: 'est-af', back: true }],
        },
        {
          title: 'Guarda sin duplicar',
          text: 'Escribe estadísticas de equipo y de jugador. Traspasos y trofeos no tienen id propio en la API, así que se deduplican por clave natural con índices únicos.',
          why: 'El código ya filtra duplicados dentro de cada lote; el índice único es la garantía de que no pueden volver a colarse.',
          edges: [{ id: 'est-db' }],
        },
        {
          title: 'Si algo falla, queda registrado',
          text: 'Un aspecto de AOP captura la excepción y la manda a incidencias por Feign, que la guarda para el panel de administración.',
          why: 'La lógica de negocio no se llena de try-catch para avisar de errores: el aspecto lo hace en un solo sitio.',
          code: ['IncidenciaAspect'],
          edges: [{ id: 'est-inc' }, { id: 'inc-db' }],
        },
      ],
    },
  ],
};
