import { Diagram } from '../diagram/diagram.model';
import { SNIPPETS as S } from './snippets';

const APP = 'FitJourney/app/src/main/java/es/iesagora/fitjourney';

/**
 * Arquitectura real de FitJourney (github.com/danimmll/FitJourneyProject): app Android en
 * Java con MVVM y API REST en Node.js. Las peticiones HTTP son ejemplos con la forma real.
 */
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
      info: {
        what: 'Las pantallas solo pintan el estado que les llega del ViewModel y le pasan las acciones del usuario.',
        tech: ['Android', 'Java', 'ViewBinding', 'Navigation'],
        path: `${APP}/ui`,
      },
    },
    {
      id: 'vm',
      label: 'ViewModel',
      sub: 'estado en LiveData',
      subM: 'LiveData',
      kind: 'state',
      d: { x: 236, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 36, w: 150, h: 50 },
      info: {
        what: 'Guarda el estado de cada pantalla en LiveData y sobrevive a los giros del móvil.',
        tech: ['AndroidViewModel', 'LiveData'],
        path: `${APP}/viewmodel`,
      },
    },
    {
      id: 'repo',
      label: 'Repository',
      sub: 'acceso a los datos',
      subM: 'datos',
      kind: 'repo',
      d: { x: 432, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 122, w: 150, h: 50 },
      info: {
        what: 'Llama a la API con Retrofit y envuelve cada resultado en un Resource: cargando, éxito o error.',
        tech: ['Retrofit', 'Callbacks', 'Resource<T>'],
        path: `${APP}/data/repositories`,
      },
    },
    {
      id: 'prefs',
      label: 'Preferencias',
      sub: 'token, rol e id',
      subM: 'sesión',
      kind: 'key',
      d: { x: 236, y: 280, w: 172, h: 60 },
      m: { x: 20, y: 122, w: 150, h: 50 },
      info: {
        what: 'SharedPreferences con el token, el rol y el id del usuario: lo que hace falta para mantener la sesión.',
        tech: ['SharedPreferences'],
        path: `${APP}/data/repositories/PreferencesRepository.java`,
      },
    },
    {
      id: 'http',
      label: 'Retrofit + OkHttp',
      sub: 'AuthInterceptor',
      subM: 'interceptor',
      kind: 'network',
      d: { x: 432, y: 280, w: 172, h: 60 },
      m: { x: 190, y: 208, w: 150, h: 50 },
      info: {
        what: 'El cliente HTTP. Un interceptor añade el Bearer a cada llamada y cierra la sesión si la API responde 401 o 403.',
        tech: ['Retrofit', 'OkHttp', 'Gson'],
        path: `${APP}/data/remote`,
      },
    },
    {
      id: 'api',
      label: 'Express',
      sub: 'rutas y JWT',
      subM: 'rutas',
      kind: 'server',
      d: { x: 664, y: 64, w: 172, h: 60 },
      m: { x: 190, y: 326, w: 150, h: 50 },
      info: {
        what: 'API REST en Node.js desplegada en Render y documentada con Swagger.',
        tech: ['Node.js', 'Express 5', 'Swagger'],
        points: [
          '24 endpoints REST.',
          'Las rutas privadas pasan por el middleware authenticateToken.',
        ],
        path: 'FitJourneyAPI',
      },
    },
    {
      id: 'ctrl',
      label: 'Controladores',
      sub: 'lógica por recurso',
      subM: 'lógica',
      kind: 'route',
      d: { x: 664, y: 172, w: 172, h: 60 },
      m: { x: 190, y: 412, w: 150, h: 50 },
      info: {
        what: 'Auth, usuarios, ejercicios, rutinas y entrenamientos, cada uno con su controlador.',
        tech: ['bcryptjs', 'jsonwebtoken'],
        path: 'FitJourneyAPI/controllers',
      },
    },
    {
      id: 'prisma',
      label: 'Prisma',
      sub: 'ORM tipado',
      subM: 'ORM',
      kind: 'orm',
      d: { x: 664, y: 280, w: 172, h: 60 },
      m: { x: 190, y: 498, w: 150, h: 50 },
      info: {
        what: 'El esquema de la base de datos en un solo fichero, consultas tipadas y escrituras anidadas.',
        tech: ['Prisma'],
        path: 'FitJourneyAPI/prisma',
      },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'en Supabase',
      subM: 'Supabase',
      kind: 'db',
      d: { x: 884, y: 280, w: 140, h: 60 },
      m: { x: 20, y: 498, w: 150, h: 50 },
      info: {
        what: 'PostgreSQL gestionado en Supabase: usuarios, ejercicios, rutinas, entrenamientos y sus series.',
        tech: ['PostgreSQL', 'Supabase'],
      },
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
      summary:
        'Del formulario de acceso a una sesión guardada en el móvil, capa por capa del patrón MVVM.',
      steps: [
        {
          title: 'La pantalla avisa al ViewModel',
          text: 'El Fragment comprueba que los campos no estén vacíos y llama a viewModel.login(). No sabe nada de red ni de tokens.',
          msgs: [{ from: 'ui', to: 'vm', label: 'login(email, pass)' }],
          code: S.fjUiLogin,
        },
        {
          title: 'El ViewModel pide los datos',
          text: 'Publica Resource.loading() para que la pantalla bloquee el botón y muestre el progreso, y delega en el repositorio.',
          msgs: [
            { from: 'vm', to: 'vm', label: 'Resource.loading()' },
            { from: 'vm', to: 'repo', label: 'login()' },
          ],
          code: S.fjVmLogin,
        },
        {
          title: 'El repositorio prepara la llamada',
          text: 'UserRepository es la única clase que sabe de dónde salen los datos. Lanza la petición con Retrofit de forma asíncrona.',
          msgs: [{ from: 'repo', to: 'http', label: 'loginUser()' }],
          code: S.fjRepoLogin,
        },
        {
          title: 'La petición llega a la API',
          text: 'OkHttp la manda a la API en Render. En el login el interceptor no añade token, porque todavía no lo hay.',
          msgs: [
            { from: 'http', to: 'api', label: 'POST /api/auth/login' },
            { from: 'api', to: 'ctrl', label: 'authController.login' },
          ],
          code: S.fjRetrofit,
          http: `POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "••••••••"
}`,
        },
        {
          title: 'Comprueba la cuenta y la contraseña',
          text: 'Busca al usuario por email con Prisma y rechaza la petición si no existe o está desactivado. Después, bcrypt compara la contraseña con el hash guardado.',
          msgs: [
            { from: 'ctrl', to: 'prisma', label: 'user.findUnique' },
            { from: 'prisma', to: 'db', label: 'SELECT' },
            { from: 'db', to: 'prisma', label: 'fila', kind: 'res' },
            { from: 'prisma', to: 'ctrl', label: 'user', kind: 'res' },
            { from: 'ctrl', to: 'ctrl', label: 'bcrypt.compare' },
          ],
          code: S.fjApiLogin,
        },
        {
          title: 'Firma el JWT y responde',
          text: 'Si todo cuadra, firma un JWT de 24 horas con el id y el rol, y devuelve el usuario sin el hash de la contraseña.',
          msgs: [
            { from: 'ctrl', to: 'ctrl', label: 'jwt.sign (24 h)' },
            { from: 'ctrl', to: 'api', label: '200 + token', kind: 'res' },
            { from: 'api', to: 'http', label: '200 OK', kind: 'res' },
          ],
          http: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "user": { "id_user": 12, "name": "Daniel", "role": "user" }
}`,
        },
        {
          title: 'Guarda la sesión y navega',
          text: 'El repositorio devuelve Resource.success, el ViewModel guarda token, rol e id en las preferencias y la pantalla, que observa el LiveData, navega al inicio.',
          msgs: [
            { from: 'http', to: 'repo', label: 'AccessResponse', kind: 'res' },
            { from: 'repo', to: 'vm', label: 'Resource.success', kind: 'res' },
            { from: 'vm', to: 'prefs', label: 'setToken()' },
            { from: 'vm', to: 'ui', label: 'LiveData', kind: 'res' },
          ],
          code: S.fjVmSave,
        },
      ],
    },
    {
      id: 'entrenamiento',
      name: 'Registrar un entrenamiento',
      summary:
        'Al terminar la sesión, la app calcula las calorías y guarda el entrenamiento con todas sus series en una sola operación.',
      steps: [
        {
          title: 'Calcula las calorías',
          text: 'Por cada ejercicio estima el MET según su tipo (fuerza, cardio o estiramiento) y aplica MET × peso × horas.',
          msgs: [
            { from: 'ui', to: 'ui', label: 'MET × peso × horas' },
            { from: 'ui', to: 'vm', label: 'createWorkout()' },
          ],
          code: S.fjUiCalories,
        },
        {
          title: 'ViewModel y repositorio',
          text: 'El ViewModel publica el estado de carga y el repositorio lanza la llamada. Si termina bien, el historial se recarga solo.',
          msgs: [
            { from: 'vm', to: 'vm', label: 'Resource.loading()' },
            { from: 'vm', to: 'repo', label: 'createWorkout()' },
            { from: 'repo', to: 'http', label: 'POST workouts' },
          ],
          code: S.fjVmWorkout,
        },
        {
          title: 'El interceptor añade el token',
          text: 'AuthInterceptor lee el JWT de las preferencias y lo pone en la cabecera Authorization antes de que la petición salga.',
          why: 'Ninguna pantalla ni repositorio toca el token: se añade en un único sitio para todas las llamadas.',
          msgs: [
            { from: 'http', to: 'prefs', label: 'getToken()' },
            { from: 'prefs', to: 'http', label: 'JWT', kind: 'res' },
            { from: 'http', to: 'api', label: 'POST /api/workouts' },
          ],
          code: S.fjInterceptorAdd,
          http: `POST /api/workouts HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…
Content-Type: application/json

{
  "id_routine": 4,
  "duration_minutes": 52,
  "calories_burned": 386.5,
  "details": [
    { "id_exercise": 17, "sets_performed": 4, "reps_string": "10,10,8,8", "max_weight": 60 }
  ]
}`,
        },
        {
          title: 'La API comprueba el JWT',
          text: 'El middleware authenticateToken verifica la firma y la caducidad y deja el id del usuario en req.user. El cliente no puede elegir para quién guarda.',
          msgs: [
            { from: 'api', to: 'api', label: 'authenticateToken' },
            { from: 'api', to: 'ctrl', label: 'createWorkout' },
          ],
          code: S.fjMwAuth,
        },
        {
          title: 'Una escritura anidada',
          text: 'Prisma crea el entrenamiento y todas sus series en una sola operación anidada.',
          why: 'Las escrituras anidadas de Prisma son atómicas: si falla una serie no queda un entrenamiento a medias.',
          msgs: [
            { from: 'ctrl', to: 'prisma', label: 'workout.create + details' },
            { from: 'prisma', to: 'db', label: 'INSERT en transacción' },
            { from: 'db', to: 'prisma', label: 'OK', kind: 'res' },
          ],
          code: S.fjWorkoutCreate,
        },
        {
          title: '201 y el historial se actualiza',
          text: 'La API responde 201 con el entrenamiento creado. El ViewModel publica el éxito y vuelve a pedir el historial.',
          msgs: [
            { from: 'ctrl', to: 'api', label: '201 Created', kind: 'res' },
            { from: 'api', to: 'http', label: '201', kind: 'res' },
            { from: 'http', to: 'repo', label: 'OK', kind: 'res' },
            { from: 'repo', to: 'vm', label: 'Resource.success', kind: 'res' },
            { from: 'vm', to: 'vm', label: 'fetchWorkoutHistory()' },
          ],
          http: `HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "¡Entrenamiento registrado con éxito!",
  "data": { "id_workout": 231, "duration_minutes": 52, "calories_burned": 386.5 }
}`,
        },
      ],
    },
    {
      id: 'sesion-caducada',
      name: 'Sesión caducada',
      fault: 'Caducar el token',
      summary:
        'El JWT dura 24 horas. Cuando caduca, la API responde 403 y la app limpia la sesión y vuelve al login, sin pantallas rotas.',
      steps: [
        {
          title: 'Una llamada con el token caducado',
          text: 'La app pide el historial de entrenamientos con un token que caducó ayer.',
          msgs: [
            { from: 'vm', to: 'repo', label: 'historial' },
            { from: 'repo', to: 'http', label: 'GET workouts/history' },
            { from: 'http', to: 'api', label: 'GET /api/workouts/history' },
          ],
        },
        {
          title: 'La API la rechaza',
          text: 'jwt.verify falla por la caducidad y authenticateToken responde 403 sin llegar al controlador.',
          msgs: [
            { from: 'api', to: 'api', label: 'jwt.verify: caducado' },
            { from: 'api', to: 'http', label: '403', kind: 'err' },
          ],
          code: S.fjMwAuth,
        },
        {
          title: 'El interceptor cierra la sesión',
          text: 'AuthInterceptor ve el 403 en una ruta que no es de login, borra token, rol e id y abre la pantalla de acceso vaciando la pila de pantallas.',
          why: 'La sesión caducada se gestiona en un único punto: ninguna pantalla tiene que comprobarlo por su cuenta.',
          msgs: [
            { from: 'http', to: 'prefs', label: 'clearSession()' },
            { from: 'http', to: 'http', label: 'abre MainActivity' },
          ],
          code: S.fjInterceptorOut,
        },
      ],
    },
    {
      id: 'password-mal',
      name: 'Contraseña incorrecta',
      fault: 'Equivocar la contraseña',
      summary:
        'El usuario se equivoca al escribir la contraseña. La API lo rechaza y la app lo dice sin confundirlo con una sesión caducada.',
      steps: [
        {
          title: 'Login con la contraseña mal',
          text: 'La petición recorre las mismas capas que un login normal.',
          msgs: [
            { from: 'ui', to: 'vm', label: 'login(email, pass)' },
            { from: 'vm', to: 'repo', label: 'login()' },
            { from: 'repo', to: 'http', label: 'loginUser()' },
            { from: 'http', to: 'api', label: 'POST /api/auth/login' },
          ],
        },
        {
          title: 'bcrypt dice que no',
          text: 'La cuenta existe, pero el hash guardado no corresponde a la contraseña recibida.',
          msgs: [
            { from: 'api', to: 'ctrl', label: 'authController.login' },
            { from: 'ctrl', to: 'prisma', label: 'user.findUnique' },
            { from: 'prisma', to: 'db', label: 'SELECT' },
            { from: 'db', to: 'prisma', label: 'fila', kind: 'res' },
            { from: 'prisma', to: 'ctrl', label: 'user', kind: 'res' },
            { from: 'ctrl', to: 'ctrl', label: 'bcrypt.compare: no' },
          ],
          code: S.fjApiLogin,
        },
        {
          title: '401: credenciales inválidas',
          text: 'La API responde 401 y la contraseña nunca sale del servidor, ni siquiera su hash.',
          msgs: [
            { from: 'ctrl', to: 'api', label: '401 Credenciales inválidas', kind: 'err' },
            { from: 'api', to: 'http', label: '401', kind: 'err' },
          ],
          http: `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Credenciales inválidas"
}`,
        },
        {
          title: 'El interceptor no cierra nada',
          text: 'Es una ruta de login, así que AuthInterceptor deja pasar el 401 sin borrar la sesión. El repositorio lo convierte en un Resource de error y la pantalla enseña el mensaje.',
          why: 'Si el interceptor tratara este 401 como una sesión caducada, mandaría al usuario al login en bucle. Por eso login y registro quedan fuera.',
          msgs: [
            { from: 'http', to: 'http', label: 'ruta de login: no limpia' },
            { from: 'http', to: 'repo', label: 'error 401', kind: 'err' },
            { from: 'repo', to: 'vm', label: 'Resource.error', kind: 'err' },
            { from: 'vm', to: 'ui', label: 'mensaje de error', kind: 'err' },
          ],
          code: S.fjInterceptorOut,
        },
      ],
    },
    {
      id: 'sin-conexion',
      name: 'Sin conexión',
      fault: 'Quitar la conexión',
      summary:
        'El móvil se queda sin red justo al iniciar sesión. La app no se cuelga: avisa y deja volver a intentarlo.',
      steps: [
        {
          title: 'La petición no llega',
          text: 'La app lanza el login como siempre, pero la llamada no obtiene respuesta.',
          msgs: [
            { from: 'ui', to: 'vm', label: 'login(email, pass)' },
            { from: 'vm', to: 'repo', label: 'login()' },
            { from: 'repo', to: 'http', label: 'loginUser()' },
            { from: 'http', to: 'api', label: 'sin respuesta', kind: 'err' },
          ],
        },
        {
          title: 'Retrofit avisa del fallo',
          text: 'Retrofit llama a onFailure y el repositorio lo convierte en un Resource de error con el texto «Error de conexión». El ViewModel lo publica y la pantalla lo muestra.',
          why: 'Las llamadas son asíncronas con enqueue: la interfaz nunca se bloquea esperando a la red.',
          msgs: [
            { from: 'http', to: 'repo', label: 'onFailure', kind: 'err' },
            { from: 'repo', to: 'vm', label: 'Error de conexión', kind: 'err' },
            { from: 'vm', to: 'ui', label: 'Resource.error', kind: 'err' },
          ],
          code: S.fjRepoFailure,
        },
      ],
    },
  ],
};
