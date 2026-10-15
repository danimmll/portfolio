# Portfolio de Daniel Martín López

Web personal con mis dos proyectos principales, [ScoreVia](https://github.com/danimmll/Scorevia) y [FitJourney](https://github.com/danimmll/FitJourneyProject). Cada proyecto tiene un diagrama animado de cómo funciona por dentro y una demo con su lógica real:

- **Diagrama animado**: elige un flujo (login con Google, predicción en directo o datos en directo en ScoreVia; iniciar sesión o guardar un entrenamiento en FitJourney) y dale a reproducir. Cada paso es una frase y los mensajes viajan por el diagrama: en ámbar lo que va, en azul lo que vuelve.
- **Pruébalo tú**: el motor de predicción de ScoreVia (Poisson con Dixon-Coles) y la calculadora de calorías de FitJourney, portados a TypeScript con la misma lógica que el código original.
- **Enlaces profundos**: `?escenario=…&paso=…` abre el diagrama en ese punto. La página de stack enlaza cada tecnología con el paso donde se usa.

## Stack

- Angular 21 con componentes standalone, signals y sin Zone.js.
- Prerenderizado estático de todas las páginas en el build: no hace falta servidor.
- SVG generado a partir de datos, con la animación en `requestAnimationFrame`; respeta `prefers-reduced-motion`.
- Desplegada en Vercel.

## Cómo está organizado

```
src/app/
├── data/          perfil, stack, proyectos y los dos diagramas
├── diagram/       diagrama animado, miniatura y geometría
├── labs/          demos interactivas y la lógica portada de los proyectos
├── shared/        iconos y tarjeta de proyecto
└── pages/         inicio, proyectos, proyecto, CV, stack y contacto
```

Cada diagrama es un fichero de datos (`scorevia.diagram.ts`, `fitjourney.diagram.ts`): piezas con su posición en escritorio y en móvil, conexiones y escenarios. Cada paso es una lista de mensajes `{ from, to, label, kind }`; el componente calcula por qué conexión va cada uno y lo anima. Añadir un flujo nuevo no requiere tocar el componente.

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
