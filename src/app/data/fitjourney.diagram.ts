import { Diagram } from '../diagram/diagram.model';

/**
 * Arquitectura real de FitJourney (github.com/danimmll/FitJourneyProject): app Android
 * en MVVM y API REST en Node.js con Prisma.
 */
export const FITJOURNEY_DIAGRAM: Diagram = {
  title: 'Arquitectura de FitJourney',
  size: { d: [960, 400], m: [360, 610] },
  groups: [
    {
      id: 'app',
      label: 'App Android (Java)',
      d: { x: 10, y: 10, w: 540, h: 380 },
      m: { x: 4, y: 4, w: 352, h: 330 },
    },
    {
      id: 'api',
      label: 'API REST en Render',
      d: { x: 580, y: 10, w: 180, h: 380 },
      m: { x: 4, y: 352, w: 352, h: 170 },
    },
  ],
  nodes: [
    {
      id: 'ui',
      label: 'Fragment',
      sub: 'pantalla + ViewBinding',
      d: { x: 30, y: 60, w: 150, h: 56 },
      m: { x: 14, y: 40, w: 160, h: 50 },
    },
    {
      id: 'vm',
      label: 'ViewModel',
      sub: 'estado en LiveData',
      d: { x: 205, y: 60, w: 150, h: 56 },
      m: { x: 186, y: 40, w: 160, h: 50 },
    },
    {
      id: 'repo',
      label: 'Repository',
      sub: 'única puerta a los datos',
      d: { x: 380, y: 60, w: 150, h: 56 },
      m: { x: 186, y: 130, w: 160, h: 50 },
    },
    {
      id: 'prefs',
      label: 'Preferencias',
      sub: 'token y ajustes locales',
      d: { x: 205, y: 250, w: 150, h: 56 },
      m: { x: 14, y: 220, w: 160, h: 50 },
    },
    {
      id: 'http',
      label: 'Retrofit + OkHttp',
      sub: 'AuthInterceptor',
      d: { x: 380, y: 250, w: 150, h: 56 },
      m: { x: 186, y: 220, w: 160, h: 50 },
    },
    {
      id: 'api',
      label: 'Express',
      sub: 'rutas + middleware JWT',
      d: { x: 595, y: 60, w: 150, h: 56 },
      m: { x: 186, y: 385, w: 160, h: 50 },
    },
    {
      id: 'ctrl',
      label: 'Controladores',
      sub: 'lógica de cada recurso',
      d: { x: 595, y: 155, w: 150, h: 56 },
      m: { x: 186, y: 455, w: 160, h: 50 },
    },
    {
      id: 'prisma',
      label: 'Prisma',
      sub: 'ORM',
      d: { x: 595, y: 250, w: 150, h: 56 },
      m: { x: 14, y: 455, w: 160, h: 50 },
    },
    {
      id: 'db',
      label: 'PostgreSQL',
      sub: 'en Supabase',
      d: { x: 790, y: 250, w: 150, h: 56 },
      m: { x: 14, y: 550, w: 160, h: 50 },
    },
  ],
  edges: [
    { id: 'ui-vm', from: 'ui', to: 'vm' },
    { id: 'vm-repo', from: 'vm', to: 'repo' },
    { id: 'repo-http', from: 'repo', to: 'http' },
    { id: 'vm-prefs', from: 'vm', to: 'prefs' },
    { id: 'prefs-http', from: 'prefs', to: 'http' },
    { id: 'http-api', from: 'http', to: 'api', label: 'HTTPS', elbow: { d: 565 } },
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
          text: 'LoginFragment comprueba que los campos no estén vacíos y llama a login(email, password). El ViewModel publica el estado "cargando" en un LiveData y la pantalla muestra el progreso.',
          why: 'La vista no sabe nada de red: solo pinta lo que le llega por LiveData, y el ViewModel sobrevive a los giros de pantalla.',
          code: ['MainViewModel.login()', 'Resource.loading()'],
          edges: [{ id: 'ui-vm' }],
        },
        {
          title: 'El repositorio prepara la llamada',
          text: 'UserRepository es la única clase que sabe de dónde salen los datos. Lanza la petición con Retrofit de forma asíncrona.',
          code: ['UserRepository.login()'],
          edges: [{ id: 'vm-repo' }, { id: 'repo-http' }],
        },
        {
          title: 'La petición llega a la API',
          text: 'Retrofit serializa el cuerpo con Gson y OkHttp lo envía por HTTPS a la API desplegada en Render.',
          code: ['POST /api/auth/login'],
          edges: [{ id: 'http-api' }, { id: 'api-ctrl' }],
        },
        {
          title: 'Comprueba la cuenta',
          text: 'El controlador busca el usuario por correo con Prisma y rechaza la entrada si no existe o la cuenta está desactivada.',
          code: ['prisma.user.findUnique({ where: { email } })'],
          edges: [{ id: 'ctrl-prisma' }, { id: 'prisma-db' }],
        },
        {
          title: 'Verifica la contraseña y firma el JWT',
          text: 'Compara la contraseña con el hash de bcrypt y firma un JWT de 24 horas con el id y el rol del usuario. La respuesta nunca incluye el hash.',
          code: ['bcrypt.compare()', "jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '24h' })"],
          nodes: ['ctrl'],
        },
        {
          title: 'Vuelve a la app',
          text: 'El token y los datos del usuario recorren el camino de vuelta hasta el ViewModel.',
          edges: [
            { id: 'api-ctrl', back: true },
            { id: 'http-api', back: true },
            { id: 'repo-http', back: true },
            { id: 'vm-repo', back: true },
          ],
        },
        {
          title: 'Guarda la sesión y navega',
          text: 'El ViewModel guarda el token y el id del usuario en las preferencias y publica el éxito en el LiveData. La pantalla lo observa y navega a la zona principal.',
          code: ['PreferencesRepository.setToken()', 'Resource.success()'],
          edges: [{ id: 'vm-prefs' }, { id: 'ui-vm', back: true }],
        },
      ],
    },
    {
      id: 'entrenamiento',
      name: 'Registrar un entrenamiento',
      summary:
        'Al terminar una rutina, la app calcula lo que ha costado y lo guarda en una sola escritura en la base de datos.',
      steps: [
        {
          title: 'Termina la sesión y calcula las calorías',
          text: 'WorkoutSessionFragment junta las series hechas (repeticiones, peso, tiempo o velocidad) y calcula las calorías con el MET de cada ejercicio y el peso del usuario.',
          why: 'El cálculo vive en FitnessCalculator, una clase sin estado y fácil de probar, separada de la pantalla.',
          code: ['FitnessCalculator.calculateCaloriesBurned()'],
          nodes: ['ui'],
        },
        {
          title: 'Pasa el entrenamiento al ViewModel',
          text: 'La pantalla entrega el objeto Workout y el ViewModel lo manda al repositorio.',
          code: ['SecondViewModel.createWorkout(workout)'],
          edges: [{ id: 'ui-vm' }, { id: 'vm-repo' }, { id: 'repo-http' }],
        },
        {
          title: 'El interceptor pone el token',
          text: 'AuthInterceptor lee el token de las preferencias y añade la cabecera Authorization a la petición.',
          why: 'Ningún repositorio tiene que acordarse de autenticar: pasa en un solo sitio para todas las llamadas.',
          code: ['Authorization: Bearer <token>'],
          edges: [{ id: 'prefs-http' }],
        },
        {
          title: 'La API valida el token',
          text: 'El middleware authenticateToken verifica el JWT y deja el id del usuario en req.user. El entrenamiento siempre se guarda a nombre de quien hace la petición, no de quien diga el cuerpo.',
          code: ['POST /api/workouts', 'authenticateToken'],
          edges: [{ id: 'http-api' }, { id: 'api-ctrl' }],
        },
        {
          title: 'Una sola escritura con sus detalles',
          text: 'El controlador crea el entrenamiento y todas sus series con un create anidado de Prisma, y devuelve el resultado con la rutina y los ejercicios incluidos.',
          why: 'Entrenamiento y detalles se guardan en la misma operación: no puede quedar un entrenamiento a medias.',
          code: ['prisma.workout.create({ data: { details: { create: [...] } } })'],
          edges: [{ id: 'ctrl-prisma' }, { id: 'prisma-db' }],
        },
        {
          title: 'Confirma y actualiza el historial',
          text: 'La API responde 201 y el ViewModel publica el éxito. Si el token hubiera caducado (401 o 403), el interceptor borra la sesión y devuelve al usuario al login.',
          code: ['201 Created'],
          edges: [
            { id: 'api-ctrl', back: true },
            { id: 'http-api', back: true },
            { id: 'repo-http', back: true },
            { id: 'vm-repo', back: true },
            { id: 'ui-vm', back: true },
          ],
        },
      ],
    },
  ],
};
