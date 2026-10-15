/** Trazos de 24×24 dibujados con línea, para la interfaz y para las piezas de los diagramas. */
export const ICONS = {
  // Piezas de los diagramas
  browser:
    'M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z M3 9h18 M6.5 6.5h.01 M9.5 6.5h.01',
  gateway: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z M9 12l2 2 4-4',
  registry: 'M9 6h11 M9 12h11 M9 18h11 M4.5 6h.01 M4.5 12h.01 M4.5 18h.01',
  service: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z M12 12l8-4.5 M12 12v9 M12 12L4 7.5',
  engine:
    'M6 6h12v12H6z M10 10h4v4h-4z M10 3v3 M14 3v3 M10 18v3 M14 18v3 M3 10h3 M3 14h3 M18 10h3 M18 14h3',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  cloud: 'M7 19h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 10.3 4.4 4.4 0 0 0 7 19z',
  screen:
    'M7.5 3h9A1.5 1.5 0 0 1 18 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-15A1.5 1.5 0 0 1 7.5 3z M10.5 18h3',
  state: 'M4 7h9 M17 7h3 M15 5v4 M4 17h3 M11 17h9 M9 15v4',
  repo: 'M12 3l9 4.5-9 4.5-9-4.5z M3 12l9 4.5 9-4.5 M3 16.5l9 4.5 9-4.5',
  key: 'M8 15a4 4 0 1 1 3.7-5.5H21v3h-2v2h-3v-2h-4.3A4 4 0 0 1 8 15z M7 11h.01',
  network: 'M7 4v16 M3 8l4-4 4 4 M17 20V4 M13 16l4 4 4-4',
  server: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  route: 'M6 4v16 M6 12h8a4 4 0 0 0 4-4V4 M15 7l3-3 3 3',
  orm: 'M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14',

  // Interfaz
  home: 'M4 10.5L12 4l8 6.5 M6 9v11h12V9 M10 20v-5.5h4V20',
  projects: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  external: 'M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12 M18 6L6 18',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8.5 5v14 M15.5 5v14',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  code: 'M8 8l-4 4 4 4 M16 8l4 4-4 4 M13.5 5l-3 14',
  file: 'M6 3h8l4 4v14H6z M14 3v4h4',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 21a7.5 7.5 0 0 1 15 0',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  restart: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4h4',
} as const;

export type IconName = keyof typeof ICONS;
