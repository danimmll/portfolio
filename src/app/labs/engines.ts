/*
 * Lógica portada tal cual desde los repositorios para que las demos calculen lo mismo
 * que el código real:
 *  - Predicción: Microservicio-predicciones, PredictionEngineServiceImpl y PredictionServiceImpl.
 *  - Rate limit: Gateway, VentanaRateLimiter y AuthRateLimiterFilter; bloqueo de cuenta en
 *    usuarios-roles, JwtAuthenticationFilter y UsuarioDetailsServiceImpl.
 *  - Calorías: FitJourney, FitnessCalculator y WorkoutSessionFragment.
 */

// ——— Predicción (ScoreVia) ———

const MAX_GOLES = 8;
const RHO_DIXON_COLES = -0.15;
const PESO_ROJA_MAX = 0.3;

export interface Roja {
  equipo: 'local' | 'visitante';
  minuto: number;
}

export interface Prediccion {
  local: number;
  empate: number;
  visitante: number;
  lambdaLocal: number;
  lambdaVisitante: number;
  marcadores: { local: number; visitante: number; p: number }[];
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function poisson(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/** Fórmula tau de Dixon y Coles (1997) para los marcadores bajos. */
function multiplicadorDixonColes(lambda: number, mu: number, gl: number, gv: number): number {
  if (gl === 0 && gv === 0) return 1 - lambda * mu * RHO_DIXON_COLES;
  if (gl === 1 && gv === 0) return 1 + mu * RHO_DIXON_COLES;
  if (gl === 0 && gv === 1) return 1 + lambda * RHO_DIXON_COLES;
  if (gl === 1 && gv === 1) return 1 - RHO_DIXON_COLES;
  return 1;
}

export function proporcionTiempoRestante(minuto: number): number {
  if (minuto >= 90) return 0;
  return 1 - Math.pow(minuto / 90, 1.25);
}

function aplicarRojas(
  lambdaLocal: number,
  lambdaVisitante: number,
  rojas: Roja[],
): [number, number] {
  const l: [number, number] = [lambdaLocal, lambdaVisitante];
  for (const r of rojas) {
    const impacto = Math.max(0, (90 - r.minuto) / 90) * PESO_ROJA_MAX;
    if (r.equipo === 'local') {
      l[0] *= 1 - impacto;
      l[1] *= 1 + impacto * 0.5;
    } else {
      l[1] *= 1 - impacto;
      l[0] *= 1 + impacto * 0.5;
    }
  }
  return l;
}

/**
 * Igual que predecirPartidoEnVivo: reduce los goles esperados según el minuto, aplica las
 * rojas que ya han ocurrido y reparte la probabilidad sobre el marcador actual.
 */
export function predecirEnVivo(
  lambdaLocalPrevio: number,
  lambdaVisitantePrevio: number,
  minuto: number,
  golesLocal: number,
  golesVisitante: number,
  rojas: Roja[],
): Prediccion {
  const efectivo = Math.min(minuto, 90);
  const resto = proporcionTiempoRestante(efectivo);
  const [lL, lV] = aplicarRojas(
    lambdaLocalPrevio * resto,
    lambdaVisitantePrevio * resto,
    rojas.filter((r) => r.minuto <= efectivo),
  );

  let pL = 0;
  let pE = 0;
  let pV = 0;
  const porMarcador = new Map<string, { local: number; visitante: number; p: number }>();

  for (let gl = 0; gl <= MAX_GOLES; gl++) {
    for (let gv = 0; gv <= MAX_GOLES; gv++) {
      const p = poisson(lL, gl) * poisson(lV, gv) * multiplicadorDixonColes(lL, lV, gl, gv);
      const fl = golesLocal + gl;
      const fv = golesVisitante + gv;
      if (fl > fv) pL += p;
      else if (fl === fv) pE += p;
      else pV += p;
      const key = `${fl}-${fv}`;
      const prev = porMarcador.get(key);
      porMarcador.set(key, { local: fl, visitante: fv, p: (prev?.p ?? 0) + p });
    }
  }

  let total = pL + pE + pV;
  if (total === 0) {
    total = 1;
    pE = 1;
  }

  const marcadores = [...porMarcador.values()]
    .map((m) => ({ ...m, p: (m.p / total) * 100 }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3);

  return {
    local: (pL / total) * 100,
    empate: (pE / total) * 100,
    visitante: (pV / total) * 100,
    lambdaLocal: lL,
    lambdaVisitante: lV,
    marcadores,
  };
}

// ——— Rate limit del login (ScoreVia) ———

export const LIMITE_LOGIN = 20;
export const VENTANA_SEGUNDOS = 60;
export const MAX_INTENTOS_LOGIN = 5;
export const MINUTOS_BLOQUEO = 15;

/** Ventana fija por IP, como VentanaRateLimiter: empieza con la primera petición. */
export class Ventana {
  inicio: number | null = null;
  contador = 0;

  permitir(ahora: number): boolean {
    if (this.inicio === null || ahora - this.inicio >= VENTANA_SEGUNDOS) {
      this.inicio = ahora;
      this.contador = 0;
    }
    this.contador++;
    return this.contador <= LIMITE_LOGIN;
  }
}

/** Intentos fallidos y bloqueo de una cuenta, como en usuarios-roles. */
export class Cuenta {
  intentos = 0;
  bloqueadaHasta = 0;

  /** Devuelve el mensaje del 400 que vería el cliente. */
  loginFallido(ahora: number): string {
    if (this.bloqueadaHasta > ahora)
      return 'Demasiados intentos fallidos. Vuelve a intentarlo más tarde.';
    this.intentos++;
    if (this.intentos >= MAX_INTENTOS_LOGIN) {
      this.bloqueadaHasta = ahora + MINUTOS_BLOQUEO * 60;
      this.intentos = 0;
    }
    return 'Cuenta no existente o datos erróneos';
  }
}

// ——— Calorías (FitJourney) ———

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface Factor {
  label: string;
  value: number;
}

export interface MetFuerza {
  met: number;
  factores: Factor[];
}

/** Descanso fijo de 90 s, como lo llama WorkoutSessionFragment. */
export function metFuerza(
  levantadoKg: number,
  pesoKg: number,
  series: number,
  reps: number,
  descanso = 90,
): MetFuerza {
  const intensidad = clamp(levantadoKg / pesoKg, 0.3, 1.5);
  const volumen = clamp((series * reps) / 30, 0.5, 2);
  const descansoF = clamp(60 / (descanso > 0 ? descanso : 1), 0.7, 1.1);
  return {
    met: 6 * (1 + intensidad) * (1 + volumen) * descansoF,
    factores: [
      { label: 'Intensidad (levantado ÷ peso, entre 0,3 y 1,5)', value: intensidad },
      { label: 'Volumen (series × repeticiones ÷ 30, entre 0,5 y 2)', value: volumen },
      { label: 'Descanso (60 ÷ 90 s, entre 0,7 y 1,1)', value: descansoF },
    ],
  };
}

/** MET base 8 e inclinación 0, como calcula la app el cardio. */
export function metCardio(velocidadKmh: number): MetFuerza {
  const velocidad = clamp(velocidadKmh / 8, 0.6, 1.8);
  const inclinacion = clamp(1 + 0 / 10, 1, 2);
  return {
    met: 8 * velocidad * inclinacion,
    factores: [
      { label: 'Velocidad (km/h ÷ 8, entre 0,6 y 1,8)', value: velocidad },
      { label: 'Inclinación (la app usa 0 %)', value: inclinacion },
    ],
  };
}

/** Estático, intensidad normal y nivel intermedio: lo que usa la sesión de entrenamiento. */
export function metEstiramiento(): MetFuerza {
  return {
    met: 2.5 * 1.2 * 1,
    factores: [
      { label: 'Base de estiramiento estático', value: 2.5 },
      { label: 'Intensidad normal', value: 1.2 },
      { label: 'Nivel intermedio', value: 1 },
    ],
  };
}

export const calorias = (met: number, pesoKg: number, minutos: number) =>
  met * pesoKg * (minutos / 60);
