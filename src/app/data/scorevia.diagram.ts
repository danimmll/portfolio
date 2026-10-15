import { Diagram } from '../diagram/diagram.model';

/** Arquitectura real de ScoreVia (github.com/danimmll/Scorevia) y tres de sus flujos. */
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
    },
    {
      id: 'gw',
      label: 'API Gateway',
      sub: 'Spring Cloud Gateway',
      subM: 'Spring Cloud',
      kind: 'gateway',
      d: { x: 252, y: 240, w: 180, h: 60 },
      m: { x: 8, y: 174, w: 104, h: 50 },
    },
    {
      id: 'eureka',
      label: 'Eureka',
      sub: 'registro de servicios',
      subM: 'registro',
      kind: 'registry',
      d: { x: 252, y: 84, w: 180, h: 60 },
      m: { x: 8, y: 314, w: 104, h: 50 },
    },
    {
      id: 'usr',
      label: 'usuarios-roles',
      sub: 'cuentas, JWT, OAuth',
      subM: 'JWT y OAuth',
      kind: 'service',
      d: { x: 500, y: 40, w: 190, h: 60 },
      m: { x: 128, y: 40, w: 108, h: 50 },
    },
    {
      id: 'pred',
      label: 'predicciones',
      sub: 'Poisson y Dixon-Coles',
      subM: 'Dixon-Coles',
      kind: 'engine',
      d: { x: 500, y: 170, w: 190, h: 60 },
      m: { x: 128, y: 154, w: 108, h: 50 },
    },
    {
      id: 'est',
      label: 'estadísticas',
      sub: 'ingesta y consultas',
      subM: 'ingesta',
      kind: 'service',
      d: { x: 500, y: 310, w: 190, h: 60 },
      m: { x: 128, y: 274, w: 108, h: 50 },
    },
    {
      id: 'inc',
      label: 'incidencias',
      sub: 'errores y reportes',
      subM: 'errores',
      kind: 'service',
      d: { x: 500, y: 440, w: 190, h: 60 },
      m: { x: 128, y: 404, w: 108, h: 50 },
    },
    {
      id: 'google',
      label: 'Google',
      sub: 'Identity Services',
      subM: 'Identity',
      kind: 'external',
      d: { x: 784, y: 40, w: 192, h: 60 },
      m: { x: 252, y: 40, w: 100, h: 50 },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'esquema por servicio',
      subM: 'esquemas',
      kind: 'db',
      d: { x: 784, y: 240, w: 192, h: 60 },
      m: { x: 252, y: 194, w: 100, h: 50 },
    },
    {
      id: 'af',
      label: 'API-Football',
      sub: 'proveedor de datos',
      subM: 'datos',
      kind: 'external',
      d: { x: 784, y: 340, w: 192, h: 60 },
      m: { x: 252, y: 314, w: 100, h: 50 },
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
      steps: [
        {
          text: 'El navegador manda a ScoreVia el token que le ha dado Google.',
          msgs: [{ from: 'nav', to: 'gw', label: 'POST /auth/google' }],
        },
        {
          text: 'El Gateway pregunta a Eureka dónde está el servicio de usuarios.',
          msgs: [
            { from: 'gw', to: 'eureka', label: '¿usuarios-roles?' },
            { from: 'eureka', to: 'gw', label: 'instancias vivas', kind: 'res' },
          ],
        },
        {
          text: 'Limita los intentos por IP y reenvía la petición con un secreto interno.',
          msgs: [
            { from: 'gw', to: 'gw', label: 'límite 20/min por IP' },
            { from: 'gw', to: 'usr', label: '+ X-Internal-Secret' },
          ],
        },
        {
          text: 'usuarios-roles comprueba con Google que el token es auténtico.',
          msgs: [
            { from: 'usr', to: 'google', label: 'claves públicas' },
            { from: 'google', to: 'usr', label: 'certificados', kind: 'res' },
            { from: 'usr', to: 'usr', label: 'verify() + email_verified' },
          ],
        },
        {
          text: 'Busca la cuenta por el correo y, si no existe, la crea.',
          msgs: [
            { from: 'usr', to: 'db', label: 'findByCorreoUsuario' },
            { from: 'db', to: 'usr', label: 'usuario o vacío', kind: 'res' },
            { from: 'usr', to: 'db', label: 'alta con rol FREE' },
          ],
        },
        {
          text: 'Devuelve un JWT de 15 minutos y una cookie segura para renovarlo.',
          msgs: [
            { from: 'usr', to: 'gw', label: '200 + JWT + cookie', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200 OK', kind: 'res' },
          ],
        },
      ],
    },
    {
      id: 'prediccion-directo',
      name: 'Predicción en directo',
      steps: [
        {
          text: 'Angular pide la predicción del partido con el minuto de juego.',
          msgs: [{ from: 'nav', to: 'gw', label: 'GET /predicciones/{id}/en-vivo' }],
        },
        {
          text: 'El Gateway la reenvía al servicio de predicciones.',
          msgs: [
            { from: 'gw', to: 'eureka', label: '¿predicciones?' },
            { from: 'eureka', to: 'gw', label: 'instancia', kind: 'res' },
            { from: 'gw', to: 'pred', label: '+ X-Internal-Secret' },
          ],
        },
        {
          text: 'Comprueba el token y que el usuario sea Premium.',
          msgs: [{ from: 'pred', to: 'pred', label: 'JWT + rol PREMIUM' }],
        },
        {
          text: 'Pide a estadísticas los datos del partido.',
          msgs: [{ from: 'pred', to: 'est', label: 'GET /internal/contexto' }],
        },
        {
          text: 'estadísticas los lee de PostgreSQL y se los devuelve.',
          msgs: [
            { from: 'est', to: 'db', label: 'consultas' },
            { from: 'db', to: 'est', label: 'filas', kind: 'res' },
            { from: 'est', to: 'pred', label: 'datos del partido', kind: 'res' },
          ],
        },
        {
          text: 'Calcula las probabilidades con un modelo de Poisson y Dixon-Coles.',
          msgs: [{ from: 'pred', to: 'pred', label: 'Poisson + Dixon-Coles' }],
        },
        {
          text: 'Devuelve la probabilidad de victoria local, empate y victoria visitante.',
          msgs: [
            { from: 'pred', to: 'gw', label: '200 probabilidades', kind: 'res' },
            { from: 'gw', to: 'nav', label: '200 OK', kind: 'res' },
          ],
        },
      ],
    },
    {
      id: 'ingesta',
      name: 'Datos en directo',
      steps: [
        {
          text: 'Cada 30 segundos salta una tarea programada, siempre que quede cuota.',
          msgs: [{ from: 'est', to: 'est', label: '@Scheduled cada 30 s' }],
        },
        {
          text: 'Pide a API-Football todos los partidos en juego de una sola vez.',
          msgs: [
            { from: 'est', to: 'af', label: 'GET /fixtures?live=all' },
            { from: 'af', to: 'est', label: 'partidos en juego', kind: 'res' },
          ],
        },
        {
          text: 'Guarda solo lo que ha cambiado: minuto, marcador y eventos.',
          msgs: [{ from: 'est', to: 'db', label: 'marcador y eventos' }],
        },
        {
          text: 'Cuando un partido acaba, pide sus estadísticas completas.',
          msgs: [
            { from: 'est', to: 'af', label: 'estadísticas finales' },
            { from: 'af', to: 'est', label: 'datos', kind: 'res' },
          ],
        },
        {
          text: 'Lo guarda todo sin duplicados.',
          msgs: [{ from: 'est', to: 'db', label: 'INSERT sin duplicados' }],
        },
        {
          text: 'Si algo falla, el error queda registrado en incidencias.',
          msgs: [
            { from: 'est', to: 'inc', label: 'incidencia' },
            { from: 'inc', to: 'db', label: 'INSERT' },
          ],
        },
      ],
    },
  ],
};
