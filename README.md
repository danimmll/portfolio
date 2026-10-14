# Portfolio de Daniel Martín López

Web personal con mis dos proyectos principales, [ScoreVia](https://github.com/danimmll/Scorevia) y [FitJourney](https://github.com/danimmll/FitJourneyProject). En lugar de capturas, cada proyecto tiene un diagrama interactivo: eliges una situación (iniciar sesión, pedir una predicción, registrar un entrenamiento…) y el diagrama marca, paso a paso, qué pieza del sistema trabaja, por qué está hecho así y en qué parte del código está.

## Stack

- Angular 21 con componentes standalone, signals y sin Zone.js.
- Prerenderizado estático en el build: cada página sale como HTML ya generado, sin servidor.
- SCSS con tokens propios y modo oscuro automático.
- Diagramas en SVG generados a partir de datos; la animación va con `requestAnimationFrame` y respeta `prefers-reduced-motion`.
- Despliegue en Vercel.

## Cómo está organizado

```
src/app/
├── data/          perfil, experiencia, proyectos y los dos diagramas (solo datos)
├── diagram/       componente del diagrama interactivo, geometría de las conexiones y miniatura
└── pages/
    ├── home/      portada: presentación, proyectos, experiencia, formación y contacto
    └── project/   página de cada proyecto con su diagrama y sus decisiones técnicas
```

Cada diagrama se describe en un fichero de datos (`scorevia.diagram.ts`, `fitjourney.diagram.ts`): las piezas, sus posiciones en escritorio y en móvil, las conexiones y los escenarios con sus pasos. El componente se encarga de dibujar, enrutar las líneas y animar el recorrido, así que añadir un escenario nuevo no requiere tocar código del componente.

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
