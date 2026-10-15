# Portfolio de Daniel Martín López

Web personal con mis dos proyectos principales, [ScoreVia](https://github.com/danimmll/Scorevia) y [FitJourney](https://github.com/danimmll/FitJourneyProject). En vez de capturas, cada proyecto tiene un diagrama interactivo de cómo funciona por dentro:

- **Flujos reales**: iniciar sesión con Google, una predicción en directo o la ingesta automática de datos en ScoreVia; el login y el registro de un entrenamiento, capa por capa, en FitJourney.
- **Rompe el sistema**: interruptores que provocan fallos reales (token caducado, refresh token robado, usuario sin Premium, un servicio caído, cuota agotada, contraseña incorrecta, sin conexión…) y el diagrama enseña cómo reacciona la arquitectura.
- **Dos vistas**: arquitectura, con paquetes animados que llevan la etiqueta de lo que viaja (ámbar la ida, azul la vuelta, rojo los errores), y diagrama de secuencia.
- **Inspector de piezas**: pulsando cualquier caja se ve qué hace, con qué está hecha y dónde está su código.
- **Código plegado en cada paso**: el fragmento exacto del repositorio, con su número de línea y enlace a GitHub, más la petición HTTP de ejemplo.
- **Pruébalo tú**: el motor de predicción de ScoreVia (Poisson con Dixon-Coles), su rate limiter del login y la calculadora de calorías de FitJourney, portados a TypeScript con la misma lógica que el código original.
- **Enlaces profundos**: `?escenario=…&paso=…&vista=secuencia` abre el diagrama justo en ese punto. La página de stack enlaza cada tecnología con el paso donde se usa.

## Stack

- Angular 21 con componentes standalone, signals y sin Zone.js.
- Prerenderizado estático de todas las páginas en el build: no hace falta servidor.
- SVG generado a partir de datos, con la animación en `requestAnimationFrame`; respeta `prefers-reduced-motion`.
- Resaltado de código propio, sin dependencias.
- Desplegada en Vercel.

## Cómo está organizado

```
src/app/
├── data/          perfil, stack, proyectos, los dos diagramas y los fragmentos de código
├── diagram/       diagrama interactivo, miniatura animada, geometría y resaltado de código
├── labs/          demos interactivas y la lógica portada de los proyectos
├── shared/        iconos y tarjeta de proyecto
└── pages/         inicio, proyectos, proyecto, CV, stack y contacto
```

Cada diagrama es un fichero de datos (`scorevia.diagram.ts`, `fitjourney.diagram.ts`): piezas con su posición en escritorio y en móvil, conexiones y escenarios. Cada paso es una lista de mensajes `{ from, to, label, kind }`; el componente calcula por qué conexión va cada uno, lo anima y genera la vista de secuencia. Añadir un flujo nuevo no requiere tocar el componente.

## Ejecutarlo en local

Requiere Node.js 20.19, 22.12 o 24 en adelante.

```bash
npm ci
npm start           # servidor de desarrollo en http://localhost:4200
npm run build       # genera la web estática en dist/portfolio/browser
npm run preview     # sirve el build para revisarlo
```

## Contacto

- Correo: danielmartinlopez7@gmail.com
- LinkedIn: [daniel-martin-lopez](https://www.linkedin.com/in/daniel-martin-lopez-380996337)
