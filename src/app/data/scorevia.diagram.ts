import { Diagram } from '../diagram/diagram.model';
import { SNIPPETS as S } from './snippets';

/**
 * Arquitectura real de ScoreVia (github.com/danimmll/Scorevia). Cada paso cita el código
 * tal y como está en el repositorio; las peticiones HTTP son ejemplos con la forma real.
 */
export const SCOREVIA_DIAGRAM: Diagram = {
  title: 'Arquitectura de ScoreVia',
  repo: 'https://github.com/danimmll/Scorevia',
  size: { d: [1000, 524], m: [360, 474] },
  nodes: [
    {
      id: 'nav',
      label: 'Navegador',
      sub: 'Angular 21 con SSR',
      subM: 'Angular',
      kind: 'browser',
      d: { x: 24, y: 240, w: 168, h: 60 },
      m: { x: 8, y: 40, w: 104, h: 50 },
      info: {
        what: 'La web en Angular 21 con renderizado en servidor. Guarda el access token solo en memoria y renueva la sesión con la cookie cuando caduca.',
        tech: ['Angular 21', 'SSR', 'Signals', 'RxJS'],
        points: [
          'Un interceptor añade el Bearer y, ante un 401, renueva la sesión y repite la petición.',
          'Un único refresh compartido entre todas las peticiones que lo necesiten a la vez.',
        ],
        path: 'scorevia-frontend',
      },
    },
    {
      id: 'gw',
      label: 'API Gateway',
      sub: 'Spring Cloud Gateway',
      subM: 'Spring Cloud',
      kind: 'gateway',
      d: { x: 252, y: 240, w: 180, h: 60 },
      m: { x: 8, y: 174, w: 104, h: 50 },
      info: {
        what: 'La única puerta de entrada. Enruta cada prefijo a su microservicio, limita peticiones por IP y firma el tráfico interno.',
        tech: ['Spring Cloud Gateway', 'Resilience4j', 'Eureka'],
        points: [
          '20 peticiones por minuto e IP en /auth y 300 en el resto.',
          'Circuit breaker por ruta con un 503 limpio si el servicio no responde.',
          'Machaca la cabecera X-Internal-Secret que pudiera traer el cliente.',
        ],
        path: 'scorevia-backend/Gateway',
      },
    },
    {
      id: 'eureka',
      label: 'Eureka',
      sub: 'registro de servicios',
      subM: 'registro',
      kind: 'registry',
      d: { x: 252, y: 84, w: 180, h: 60 },
      m: { x: 8, y: 314, w: 104, h: 50 },
      info: {
        what: 'Cada microservicio se registra al arrancar. El Gateway resuelve las rutas lb:// contra este registro.',
        tech: ['Spring Cloud Netflix Eureka'],
        path: 'scorevia-backend/EurekaServer',
      },
    },
    {
      id: 'usr',
      label: 'usuarios-roles',
      sub: 'cuentas, JWT, OAuth',
      subM: 'JWT y OAuth',
      kind: 'service',
      d: { x: 500, y: 40, w: 190, h: 60 },
      m: { x: 128, y: 40, w: 108, h: 50 },
      info: {
        what: 'Cuentas, roles y sesiones. Emite los JWT y gestiona el login con contraseña y con Google.',
        tech: ['Spring Boot', 'Spring Security', 'JJWT', 'Google API Client'],
        points: [
          'Access token de 15 minutos y refresh de 7 días en cookie HttpOnly.',
          'Rotación del refresh con detección de reuso.',
          'Bloqueo de la cuenta tras 5 intentos fallidos.',
        ],
        path: 'scorevia-backend/Microservicio-usuarios-roles',
      },
    },
    {
      id: 'pred',
      label: 'predicciones',
      sub: 'Poisson y Dixon-Coles',
      subM: 'Dixon-Coles',
      kind: 'engine',
      d: { x: 500, y: 170, w: 190, h: 60 },
      m: { x: 128, y: 154, w: 108, h: 50 },
      info: {
        what: 'Calcula las probabilidades de cada resultado antes y durante el partido.',
        tech: ['Spring Boot', 'OpenFeign', 'Resilience4j', 'Caffeine'],
        points: [
          'Solo para usuarios PREMIUM o ADMIN.',
          'El contexto en directo se cachea 15 segundos.',
        ],
        path: 'scorevia-backend/Microservicio-predicciones',
      },
    },
    {
      id: 'est',
      label: 'estadísticas',
      sub: 'ingesta y consultas',
      subM: 'ingesta',
      kind: 'service',
      d: { x: 500, y: 310, w: 190, h: 60 },
      m: { x: 128, y: 274, w: 108, h: 50 },
      info: {
        what: 'El servicio de datos: partidos, equipos, jugadores, entrenadores, árbitros y clasificaciones, más la ingesta desde API-Football.',
        tech: ['Spring Boot', 'Spring Data JPA', 'Resilience4j', '@Scheduled'],
        points: [
          '1,5 millones de partidos y 8,7 millones de eventos desde 2008.',
          'Una reserva de cuota diaria que la ingesta nunca toca.',
        ],
        path: 'scorevia-backend/Microservicio-estadisticas',
      },
    },
    {
      id: 'inc',
      label: 'incidencias',
      sub: 'errores y reportes',
      subM: 'errores',
      kind: 'service',
      d: { x: 500, y: 440, w: 190, h: 60 },
      m: { x: 128, y: 404, w: 108, h: 50 },
      info: {
        what: 'Recoge las excepciones del resto de servicios y los reportes de los usuarios para el panel de administración.',
        tech: ['Spring Boot', 'OpenFeign'],
        path: 'scorevia-backend/Microservicio-incidencias',
      },
    },
    {
      id: 'google',
      label: 'Google',
      sub: 'Identity Services',
      subM: 'Identity',
      kind: 'external',
      d: { x: 784, y: 40, w: 192, h: 60 },
      m: { x: 252, y: 40, w: 100, h: 50 },
      info: {
        what: 'El navegador obtiene de Google un ID token firmado. El backend lo verifica con las claves públicas de Google.',
        tech: ['OAuth 2.0', 'OpenID Connect'],
      },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'esquema por servicio',
      subM: 'esquemas',
      kind: 'db',
      d: { x: 784, y: 240, w: 192, h: 60 },
      m: { x: 252, y: 194, w: 100, h: 50 },
      info: {
        what: 'Una base de datos con un esquema y un usuario por microservicio: cada servicio solo puede tocar sus propias tablas.',
        tech: ['PostgreSQL', 'Esquemas separados', 'Índices únicos por clave natural'],
        path: 'scorevia-backend/postgres-init/init.sql',
      },
    },
    {
      id: 'af',
      label: 'API-Football',
      sub: 'proveedor de datos',
      subM: 'datos',
      kind: 'external',
      d: { x: 784, y: 340, w: 192, h: 60 },
      m: { x: 252, y: 314, w: 100, h: 50 },
      info: {
        what: 'El proveedor de datos de fútbol, de pago, con un plan de 150.000 peticiones al día.',
        tech: ['REST', 'API key'],
      },
    },
  ],
  edges: [
    { id: 'nav-gw', from: 'nav', to: 'gw' },
    { id: 'gw-eureka', from: 'gw', to: 'eureka' },
    { id: 'gw-usr', from: 'gw', to: 'usr', elbow: { d: 466, m: 120 } },
    { id: 'gw-pred', from: 'gw', to: 'pred', elbow: { d: 466, m: 120 } },
    { id: 'gw-est', from: 'gw', to: 'est', elbow: { d: 466, m: 120 } },
    { id: 'gw-inc', from: 'gw', to: 'inc', elbow: { d: 466, m: 120 } },
    { id: 'usr-google', from: 'usr', to: 'google' },
    { id: 'usr-db', from: 'usr', to: 'db', elbow: { d: 737, m: 244 } },
    { id: 'pred-est', from: 'pred', to: 'est' },
    { id: 'est-db', from: 'est', to: 'db', elbow: { d: 737, m: 244 } },
    { id: 'est-af', from: 'est', to: 'af' },
    { id: 'est-inc', from: 'est', to: 'inc' },
    { id: 'inc-db', from: 'inc', to: 'db', elbow: { d: 737, m: 244 } },
  ],
  scenarios: [
    {
      id: 'login-google',
      name: 'Login con Google',
      summary:
        'Del botón de Google a una sesión con JWT, sin que el backend se fíe de nada que no pueda comprobar por su cuenta.',
      steps: [
        {
          title: 'El navegador manda el token de Google',
          text: 'Google identifica al usuario en el navegador y devuelve un ID token firmado. Angular se lo envía al backend tal cual.',
          why: 'La app nunca ve la contraseña de Google: solo un token que el servidor puede comprobar por su cuenta.',
          msgs: [{ from: 'nav', to: 'gw', label: 'POST /auth/google' }],
          code: S.svFrontGoogle,
          http: `POST /api/v1/auth/google HTTP/1.1
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6…"
}`,
        },
        {
          title: 'El Gateway busca usuarios-roles',
          text: 'La ruta /api/v1/auth/** apunta a lb://MICROSERVICIO-USUARIOS-ROLES. El Gateway pregunta a Eureka qué instancias hay vivas y elige una.',
          why: 'Ningún servicio tiene direcciones escritas a mano: se pueden mover o escalar sin tocar el Gateway.',
          msgs: [
            { from: 'gw', to: 'eureka', label: '¿usuarios-roles?' },
            { from: 'eureka', to: 'gw', label: 'instancias vivas', kind: 'res' },
          ],
          code: S.svGwRouteAuth,
        },
        {
          title: 'Filtra la petición y la reenvía',
          text: 'Aplica el límite de 20 peticiones por minuto e IP de las rutas de login y escribe la cabecera X-Internal-Secret, machacando la que pudiera traer el cliente.',
          why: 'Cada microservicio rechaza lo que no venga del Gateway, así que conocer su puerto no basta para saltárselo.',
          msgs: [
            { from: 'gw', to: 'gw', label: 'límite 20/min por IP' },
            { from: 'gw', to: 'usr', label: '+ X-Internal-Secret' },
          ],
          code: S.svGwRelay,
        },
        {
          title: 'Comprueba el token con Google',
          text: 'GoogleIdTokenVerifier valida la firma con las claves públicas de Google, que el token sea para ScoreVia y que no haya caducado. Después exige que el correo esté verificado.',
          why: 'Una firma válida no basta: sin mirar email_verified, una cuenta con un correo sin verificar podría entrar en la cuenta de otra persona.',
          msgs: [
            { from: 'usr', to: 'google', label: 'claves públicas' },
            { from: 'google', to: 'usr', label: 'certificados', kind: 'res' },
            { from: 'usr', to: 'usr', label: 'verify() + email_verified' },
          ],
          code: S.svUsrVerify,
        },
        {
          title: 'Busca o crea la cuenta',
          text: 'Si el correo ya existe, entra con esa cuenta, salvo que esté desactivada. Si no, crea una nueva con el correo ya verificado y el rol FREE.',
          msgs: [
            { from: 'usr', to: 'db', label: 'findByCorreoUsuario' },
            { from: 'db', to: 'usr', label: 'usuario o vacío', kind: 'res' },
            { from: 'usr', to: 'db', label: 'alta con rol FREE' },
          ],
          code: S.svUsrFind,
        },
        {
          title: 'Devuelve la sesión',
          text: 'La respuesta lleva un access token JWT de 15 minutos en el cuerpo y un refresh token de 7 días en una cookie HttpOnly.',
          why: 'El access token vive solo en memoria y el refresh no se puede leer desde JavaScript. Además, el refresh se rota en cada uso y se revoca al cerrar sesión.',
          msgs: [
            { from: 'usr', to: 'gw', label: '200 + JWT + cookie', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200 OK', kind: 'res' },
          ],
          code: S.svUsrSession,
          http: `HTTP/1.1 200 OK
Set-Cookie: refreshToken=eyJhbGciOi…; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax
Content-Type: application/json

{
  "message": "¡Has iniciado sesión con Google con éxito!",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9…",
  "usuario": {
    "idUsuario": 42,
    "nickname": "GoogleUser_3f9a1",
    "roles": ["ROLE_FREE"]
  }
}`,
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
          title: 'Angular pide la predicción',
          text: 'Manda el minuto de juego y el access token en la cabecera Authorization. El marcador no viaja: lo pone el servidor.',
          msgs: [{ from: 'nav', to: 'gw', label: 'GET /predicciones/{id}/en-vivo' }],
          code: S.svFrontPred,
          http: `GET /api/v1/predicciones/1208021/en-vivo?minuto=63 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…`,
        },
        {
          title: 'El Gateway la enruta',
          text: 'Pasa el límite general de 300 peticiones por minuto e IP y el circuit breaker de la ruta, y llega a predicciones con el secreto interno.',
          msgs: [
            { from: 'gw', to: 'eureka', label: '¿predicciones?' },
            { from: 'eureka', to: 'gw', label: 'instancia', kind: 'res' },
            { from: 'gw', to: 'pred', label: '+ X-Internal-Secret' },
          ],
          code: S.svGwRoutePred,
        },
        {
          title: 'Comprueba quién pide',
          text: 'JwtValidationFilter valida firma, caducidad y que sea un access token y no un refresh. Después el servicio exige el rol PREMIUM o ADMIN.',
          why: 'La regla de negocio vive en el servicio y no solo en el Gateway, para no depender de una única barrera.',
          msgs: [{ from: 'pred', to: 'pred', label: 'JWT + rol PREMIUM' }],
          code: S.svPredAccess,
        },
        {
          title: 'Pide el contexto a estadísticas',
          text: 'Con OpenFeign trae la forma reciente, la clasificación, el cara a cara, las bajas y los eventos del partido.',
          why: 'Va detrás de un circuit breaker y de una caché de 15 segundos con sync = true: cien usuarios mirando el mismo partido provocan una sola llamada.',
          msgs: [{ from: 'pred', to: 'est', label: 'GET /internal/contexto' }],
          code: S.svPredFeign,
        },
        {
          title: 'estadísticas responde',
          text: 'Las rutas /internal solo aceptan el secreto compartido, comparado en tiempo constante. Las consultas usan @EntityGraph para no caer en N+1.',
          msgs: [
            { from: 'est', to: 'est', label: 'secreto en tiempo constante' },
            { from: 'est', to: 'db', label: 'consultas' },
            { from: 'db', to: 'est', label: 'filas', kind: 'res' },
            { from: 'est', to: 'pred', label: 'FormaPrediccionDTO', kind: 'res' },
          ],
          code: S.svEstSecret,
        },
        {
          title: 'Calcula con Dixon-Coles',
          text: 'Un Poisson por equipo con fuerza de ataque y defensa. En directo, los goles esperados se reducen con el minuto y las expulsiones los castigan; la corrección de Dixon-Coles ajusta los marcadores bajos.',
          why: 'El marcador se lee del servidor y el cliente solo manda el minuto, así que nadie puede falsear su propia predicción.',
          msgs: [{ from: 'pred', to: 'pred', label: 'Poisson + Dixon-Coles' }],
          code: S.svPredDixon,
        },
        {
          title: 'Devuelve las probabilidades',
          text: 'Victoria local, empate y victoria visitante, con los goles esperados que le quedan a cada equipo y el marcador con el que se ha calculado.',
          msgs: [
            { from: 'pred', to: 'gw', label: '200 LivePredictionDTO', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200 OK', kind: 'res' },
          ],
          code: S.svPredLive,
          http: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "idPartido": 1208021,
  "minutoActual": 63,
  "golesLocalActuales": 1,
  "golesVisitanteActuales": 0,
  "probabilidades": {
    "victoriaLocal": 71.84,
    "empate": 20.12,
    "victoriaVisitante": 8.04
  },
  "lambdaLocalRestante": 0.52,
  "lambdaVisitanteRestante": 0.31
}`,
        },
      ],
    },
    {
      id: 'sesion-caducada',
      name: 'Sesión caducada',
      tone: 'error',
      summary:
        'El access token dura 15 minutos. Cuando caduca a mitad de uso, la web lo renueva sola y repite la petición sin que el usuario se entere.',
      steps: [
        {
          title: 'Una petición con el token caducado',
          text: 'El usuario lleva más de 15 minutos en la web y Angular pide una predicción con el access token viejo.',
          msgs: [
            { from: 'nav', to: 'gw', label: 'GET /predicciones/… (token viejo)' },
            { from: 'gw', to: 'pred', label: 'reenvía' },
          ],
        },
        {
          title: '401: token expirado',
          text: 'JwtValidationFilter detecta la caducidad y responde 401 con un código de error propio, token-expired, para que el cliente sepa qué ha pasado.',
          msgs: [
            { from: 'pred', to: 'pred', label: 'ExpiredJwtException' },
            { from: 'pred', to: 'gw', label: '401 token-expired', kind: 'err' },
            { from: 'gw', to: 'nav', label: '401', kind: 'err' },
          ],
          code: S.svPredJwtCatch,
        },
        {
          title: 'El interceptor toma el control',
          text: 'authInterceptor captura el 401 y pide un único refresh. Si llegan varios 401 a la vez, todos esperan a ese mismo refresh.',
          why: 'El backend detecta el reuso de un refresh token: dos refresh en paralelo con el mismo token cerrarían todas las sesiones. Compartir la petición con shareReplay lo evita.',
          msgs: [{ from: 'nav', to: 'nav', label: 'un refresh compartido' }],
          code: S.svFrontInterceptor,
        },
        {
          title: 'Pide un token nuevo',
          text: 'La cookie HttpOnly con el refresh token viaja sola: es la única petición de la web que lleva credenciales.',
          msgs: [
            { from: 'nav', to: 'gw', label: 'POST /auth/refresh' },
            { from: 'gw', to: 'usr', label: 'cookie refreshToken' },
          ],
          code: S.svFrontRefresh,
          http: `POST /api/v1/auth/refresh HTTP/1.1
Cookie: refreshToken=eyJhbGciOi…`,
        },
        {
          title: 'Valida y rota el refresh',
          text: 'Comprueba que sea un token de tipo REFRESH y revoca su jti en una sola consulta. Si ya estaba revocado, alguien lo está reutilizando.',
          why: 'Ante un reuso se revocan todas las sesiones del usuario: un refresh robado deja de servir en cuanto su dueño lo vuelve a usar.',
          msgs: [
            { from: 'usr', to: 'db', label: 'revocarSiActivo(jti)' },
            { from: 'db', to: 'usr', label: '1 fila', kind: 'res' },
            { from: 'usr', to: 'usr', label: 'access y refresh nuevos' },
          ],
          code: S.svUsrRotate,
        },
        {
          title: 'Sesión renovada',
          text: 'Devuelve un access token nuevo en el cuerpo y un refresh nuevo en la cookie. El anterior ya no sirve.',
          msgs: [
            { from: 'usr', to: 'gw', label: '200 + cookie nueva', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200', kind: 'res' },
          ],
          code: S.svUsrRefresh,
          http: `HTTP/1.1 200 OK
Set-Cookie: refreshToken=eyJhbGciOi…; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9…"
}`,
        },
        {
          title: 'Repite la petición original',
          text: 'El interceptor reintenta una sola vez con el token nuevo y el usuario recibe su predicción. Si el refresh hubiera fallado, se limpia la sesión y se vuelve al login.',
          msgs: [
            { from: 'nav', to: 'gw', label: 'GET … (token nuevo)' },
            { from: 'gw', to: 'pred', label: 'reenvía' },
            { from: 'pred', to: 'gw', label: '200', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200 OK', kind: 'res' },
          ],
        },
      ],
    },
    {
      id: 'ingesta',
      name: 'Ingesta automática',
      summary:
        'Los datos se mantienen al día solos: tareas programadas contra un proveedor de pago con una cuota diaria que no se puede agotar.',
      steps: [
        {
          title: 'Salta la tarea del directo',
          text: 'Cada 30 segundos, IngestaScheduler revisa los partidos en juego. Si la cuota de API-Football ha bajado a la reserva intocable, se salta el ciclo.',
          msgs: [
            { from: 'est', to: 'est', label: '@Scheduled cada 30 s' },
            { from: 'est', to: 'est', label: '¿queda cuota?' },
          ],
          code: S.svEstSched,
        },
        {
          title: 'Una petición para todo el directo',
          text: 'Pide de una vez todos los partidos en juego. Cada llamada pasa por un rate limiter y un circuit breaker de Resilience4j, y los fallos transitorios (429 y 5xx) se reintentan.',
          why: 'Una sola petición por ciclo cubre todos los partidos: el directo gasta unas 2.900 peticiones al día de las 150.000 del plan.',
          msgs: [
            { from: 'est', to: 'af', label: 'GET /fixtures?live=all' },
            { from: 'af', to: 'est', label: 'partidos en juego', kind: 'res' },
          ],
          code: S.svEstClient,
        },
        {
          title: 'Guarda solo lo que ha cambiado',
          text: 'Actualiza minuto y marcador. Cada partido tiene una huella: los eventos solo se vuelven a pedir si cambia, y al pitido final el partido entra en la cola post-partido.',
          msgs: [
            { from: 'est', to: 'est', label: 'huella del partido' },
            { from: 'est', to: 'db', label: 'marcador y eventos' },
          ],
          code: S.svEstHuella,
        },
        {
          title: 'Completa los partidos terminados',
          text: 'Unos minutos después del final, la cola pide las estadísticas, las alineaciones y los eventos completos: tres peticiones por partido.',
          msgs: [
            { from: 'est', to: 'af', label: 'stats, alineaciones, eventos' },
            { from: 'af', to: 'est', label: 'datos finales', kind: 'res' },
          ],
          code: S.svEstLive,
        },
        {
          title: 'Guarda sin duplicar',
          text: 'Escribe las estadísticas de equipo y de jugador. Traspasos y trofeos no tienen id propio en la API, así que se deduplican por clave natural.',
          why: 'El código ya filtra duplicados dentro de cada lote; los índices únicos son la garantía de que no vuelven a colarse. Llegó a haber 26.000 traspasos repetidos.',
          msgs: [{ from: 'est', to: 'db', label: 'INSERT por clave natural' }],
          code: S.svSqlUnique,
        },
        {
          title: 'Si algo falla, queda registrado',
          text: 'Un aspecto de AOP captura las excepciones de controladores y servicios y las manda a incidencias por Feign. Los errores de validación rutinarios no cuentan.',
          why: 'La lógica de negocio no se llena de try-catch para avisar de errores: el aspecto lo hace en un solo sitio.',
          msgs: [
            { from: 'est', to: 'est', label: '@AfterThrowing' },
            { from: 'est', to: 'inc', label: 'POST incidencia' },
            { from: 'inc', to: 'db', label: 'INSERT incidencia' },
          ],
          code: S.svEstAspect,
        },
      ],
    },
    {
      id: 'servicio-caido',
      name: 'Servicio caído',
      tone: 'error',
      summary:
        'Si un microservicio no responde, el Gateway corta por lo sano y el usuario recibe un error claro en vez de quedarse esperando.',
      steps: [
        {
          title: 'Llega una petición',
          text: 'Un usuario pide una predicción justo cuando el servicio de predicciones está caído o va muy lento.',
          msgs: [{ from: 'nav', to: 'gw', label: 'GET /predicciones/{id}' }],
        },
        {
          title: 'El servicio no contesta',
          text: 'El Gateway intenta reenviarla, pero la llamada falla o supera el tiempo límite. Resilience4j apunta cada fallo.',
          msgs: [
            { from: 'gw', to: 'pred', label: 'reenvía' },
            { from: 'pred', to: 'gw', label: 'timeout', kind: 'err' },
          ],
          code: S.svGwRoutePred,
        },
        {
          title: 'El circuito se abre',
          text: 'Cuando los fallos superan el umbral, el circuit breaker se abre: las siguientes peticiones ya no intentan llegar al servicio y van directas al fallback.',
          why: 'Sin esto, cada usuario esperaría el timeout completo y el servicio caído recibiría todavía más carga mientras intenta recuperarse.',
          msgs: [
            { from: 'gw', to: 'gw', label: 'circuito abierto' },
            { from: 'gw', to: 'gw', label: 'forward:/fallback' },
          ],
        },
        {
          title: 'Un 503 limpio',
          text: 'FallbackController responde un 503 con formato ProblemDetail en lugar de una excepción de conexión. Pasado un tiempo, el circuito deja pasar peticiones de prueba y se cierra si van bien.',
          msgs: [{ from: 'gw', to: 'nav', label: '503 ProblemDetail', kind: 'err' }],
          code: S.svGwFallback,
          http: `HTTP/1.1 503 Service Unavailable
Content-Type: application/problem+json

{
  "type": "about:blank",
  "title": "Service Unavailable",
  "status": 503,
  "detail": "The requested service is temporarily unavailable. Please try again later."
}`,
        },
      ],
    },
  ],
};
