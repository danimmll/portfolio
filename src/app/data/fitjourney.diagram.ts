import { Diagram } from '../diagram/diagram.model';

/** Arquitectura real de FitJourney (github.com/danimmll/FitJourneyProject) y dos de sus flujos. */
export const FITJOURNEY_DIAGRAM: Diagram = {
  title: 'Arquitectura de FitJourney',
  repo: 'https://github.com/danimmll/FitJourneyProject',
  size: { d: [1040, 392], m: [360, 572] },
  groups: [
    {
      id: 'app',
      label: 'App Android (Java)',
      d: { x: 16, y: 16, w: 600, h: 360 },
      m: { x: 8, y: 8, w: 344, h: 270 },
    },
    {
      id: 'api',
      label: 'API REST en Render',
      d: { x: 640, y: 16, w: 216, h: 360 },
      m: { x: 178, y: 300, w: 174, h: 264 },
    },
  ],
  nodes: [
    {
      id: 'ui',
      label: 'Fragment',
      sub: 'pantallas',
      subM: 'pantalla',
      kind: 'screen',
      d: { x: 40, y: 64, w: 172, h: 60 },
      m: { x: 20, y: 36, w: 150, h: 50 },
    },
    {
      id: 'vm',
      label: 'ViewModel',
      sub: 'estado en LiveData',
      subM: 'LiveData',
      kind: 'state',
      d: { x: 236, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 36, w: 150, h: 50 },
    },
    {
      id: 'repo',
      label: 'Repository',
      sub: 'acceso a los datos',
      subM: 'datos',
      kind: 'repo',
      d: { x: 432, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 122, w: 150, h: 50 },
    },
    {
      id: 'prefs',
      label: 'Preferencias',
      sub: 'token, rol e id',
      subM: 'sesión',
      kind: 'key',
      d: { x: 236, y: 280, w: 172, h: 60 },
      m: { x: 20, y: 122, w: 150, h: 50 },
    },
    {
      id: 'http',
      label: 'Retrofit + OkHttp',
      sub: 'AuthInterceptor',
      subM: 'interceptor',
      kind: 'network',
      d: { x: 432, y: 280, w: 172, h: 60 },
      m: { x: 190, y: 208, w: 150, h: 50 },
    },
    {
      id: 'api',
      label: 'Express',
      sub: 'rutas y JWT',
      subM: 'rutas',
      kind: 'server',
      d: { x: 664, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 326, w: 150, h: 50 },
    },
    {
      id: 'ctrl',
      label: 'Controladores',
      sub: 'lógica por recurso',
      subM: 'lógica',
      kind: 'route',
      d: { x: 664, y: 172, w: 172, h: 60 },
      m: { x: 190, y: 412, w: 150, h: 50 },
    },
    {
      id: 'prisma',
      label: 'Prisma',
      sub: 'ORM tipado',
      subM: 'ORM',
      kind: 'orm',
      d: { x: 664, y: 280, w: 172, h: 60 },
      m: { x: 190, y: 498, w: 150, h: 50 },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'en Supabase',
      subM: 'Supabase',
      kind: 'db',
      d: { x: 884, y: 280, w: 140, h: 60 },
      m: { x: 20, y: 498, w: 150, h: 50 },
    },
  ],
  edges: [
    { id: 'ui-vm', from: 'ui', to: 'vm' },
    { id: 'vm-repo', from: 'vm', to: 'repo' },
    { id: 'repo-http', from: 'repo', to: 'http' },
    { id: 'vm-prefs', from: 'vm', to: 'prefs', elbow: { m: 180 } },
    { id: 'prefs-http', from: 'prefs', to: 'http', elbow: { m: 180 } },
    { id: 'http-api', from: 'http', to: 'api', elbow: { d: 628 } },
    { id: 'api-ctrl', from: 'api', to: 'ctrl' },
    { id: 'ctrl-prisma', from: 'ctrl', to: 'prisma' },
    { id: 'prisma-db', from: 'prisma', to: 'db' },
  ],
  scenarios: [
    {
      id: 'login',
      name: 'Iniciar sesión',
      steps: [
        {
          text: 'La pantalla pasa el correo y la contraseña al ViewModel.',
          msgs: [{ from: 'ui', to: 'vm', label: 'login(email, pass)' }],
        },
        {
          text: 'El ViewModel muestra que está cargando y llama al repositorio.',
          msgs: [
            { from: 'vm', to: 'vm', label: 'Resource.loading()' },
            { from: 'vm', to: 'repo', label: 'login()' },
          ],
        },
        {
          text: 'El repositorio lanza la petición con Retrofit.',
          msgs: [{ from: 'repo', to: 'http', label: 'loginUser()' }],
        },
        {
          text: 'La petición llega a la API en Node.js.',
          msgs: [
            { from: 'http', to: 'api', label: 'POST /api/auth/login' },
            { from: 'api', to: 'ctrl', label: 'authController.login' },
          ],
        },
        {
          text: 'Busca la cuenta con Prisma y comprueba la contraseña con bcrypt.',
          msgs: [
            { from: 'ctrl', to: 'prisma', label: 'user.findUnique' },
            { from: 'prisma', to: 'db', label: 'SELECT' },
            { from: 'db', to: 'prisma', label: 'fila', kind: 'res' },
            { from: 'prisma', to: 'ctrl', label: 'user', kind: 'res' },
            { from: 'ctrl', to: 'ctrl', label: 'bcrypt.compare' },
          ],
        },
        {
          text: 'Si es correcta, firma un JWT de 24 horas y lo devuelve.',
          msgs: [
            { from: 'ctrl', to: 'ctrl', label: 'jwt.sign (24 h)' },
            { from: 'ctrl', to: 'api', label: '200 + token', kind: 'res' },
            { from: 'api', to: 'http', label: '200 OK', kind: 'res' },
          ],
        },
        {
          text: 'La app guarda el token y entra en la pantalla de inicio.',
          msgs: [
            { from: 'http', to: 'repo', label: 'respuesta', kind: 'res' },
            { from: 'repo', to: 'vm', label: 'Resource.success', kind: 'res' },
            { from: 'vm', to: 'prefs', label: 'setToken()' },
            { from: 'vm', to: 'ui', label: 'LiveData', kind: 'res' },
          ],
        },
      ],
    },
    {
      id: 'entrenamiento',
      name: 'Guardar un entrenamiento',
      steps: [
        {
          text: 'Al terminar, la app calcula las calorías de cada ejercicio.',
          msgs: [
            { from: 'ui', to: 'ui', label: 'MET × peso × horas' },
            { from: 'ui', to: 'vm', label: 'createWorkout()' },
          ],
        },
        {
          text: 'El ViewModel y el repositorio preparan el envío.',
          msgs: [
            { from: 'vm', to: 'repo', label: 'createWorkout()' },
            { from: 'repo', to: 'http', label: 'POST workouts' },
          ],
        },
        {
          text: 'Un interceptor añade el token a la petición.',
          msgs: [
            { from: 'http', to: 'prefs', label: 'getToken()' },
            { from: 'prefs', to: 'http', label: 'JWT', kind: 'res' },
            { from: 'http', to: 'api', label: 'POST /api/workouts' },
          ],
        },
        {
          text: 'La API comprueba que el token es válido.',
          msgs: [
            { from: 'api', to: 'api', label: 'authenticateToken' },
            { from: 'api', to: 'ctrl', label: 'createWorkout' },
          ],
        },
        {
          text: 'Prisma guarda el entrenamiento y todas sus series de una vez.',
          msgs: [
            { from: 'ctrl', to: 'prisma', label: 'workout.create' },
            { from: 'prisma', to: 'db', label: 'INSERT' },
            { from: 'db', to: 'prisma', label: 'OK', kind: 'res' },
          ],
        },
        {
          text: 'La API responde y el historial se actualiza.',
          msgs: [
            { from: 'ctrl', to: 'api', label: '201 Created', kind: 'res' },
            { from: 'api', to: 'http', label: '201', kind: 'res' },
            { from: 'http', to: 'repo', label: 'OK', kind: 'res' },
            { from: 'repo', to: 'vm', label: 'Resource.success', kind: 'res' },
          ],
        },
      ],
    },
  ],
};
