/**
 * Turn raw weather numbers into things a visitor can actually act on.
 *
 * Pure functions, no server-only APIs: the same module runs at build time (to
 * pre-render the advice) and in the browser (to refresh it without a reload).
 * Every rule is a plain threshold — nothing here reads like a weather report.
 */

export type AdviceInput = {
  code: number | null;
  temp: number | null;
  apparent: number | null;
  humidity: number | null;
  wind: number | null; // km/h
  gust: number | null; // km/h
  precip: number | null; // mm, current hour
  precipProb: number | null; // %, today's max
  uv: number | null; // today's UV index max
  visibility: number | null; // metres
  tmax: number | null;
  tmin: number | null;
  cityTemp: number | null; // lowland reference for the altitude comparison
  mistChance: number | null; // 0-100, see seaOfCloudsChance()
};

export type Advice = {
  risks: string[];
  outfit: string[];
  plan: string[];
  pack: string[];
};

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86]);
const DRIZZLE_CODES = new Set([51, 53, 55, 56, 57, 61]);
const HEAVY_CODES = new Set([65, 67, 75, 82, 86]);
const STORM_CODES = new Set([95, 96, 99]);

// Beaufort-ish bands expressed in km/h: 29 km/h ≈ force 5, 50 km/h ≈ force 7.
const WIND_BREEZY = 29;
const WIND_STRONG = 50;
const HEAVY_MM = 7.6;
const UV_NOTICE = 5;
const HOT_C = 32;
const COLD_MAX_C = 10;
const SPREAD_C = 8;
const FOG_VISIBILITY_M = 1000;

const fill = (tpl: string, vars: Record<string, string | number>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));

const uniq = (list: string[]): string[] => Array.from(new Set(list.filter(Boolean)));

export function buildAdvice(d: AdviceInput, t: Record<string, any>): Advice {
  const str = (k: string) => (typeof t?.[k] === 'string' ? (t[k] as string) : '');
  const risks: string[] = [];
  const outfit: string[] = [];
  const plan: string[] = [];
  const pack: string[] = [];

  const code = d.code;
  const isStorm = code !== null && STORM_CODES.has(code);
  const isHeavy = isStorm || (code !== null && HEAVY_CODES.has(code)) || (d.precip ?? 0) >= HEAVY_MM;
  const isRain = code !== null && RAIN_CODES.has(code);
  const isDrizzle = !isHeavy && code !== null && DRIZZLE_CODES.has(code);
  const prob = d.precipProb ?? 0;
  const wind = d.wind ?? 0;
  const gust = d.gust ?? wind;
  const uv = d.uv ?? 0;
  const temp = d.temp;
  const spread = d.tmax !== null && d.tmin !== null ? d.tmax - d.tmin : null;
  const foggy = d.visibility !== null && d.visibility < FOG_VISIBILITY_M;

  /* ---------- 1. risks — highest priority, shown first ---------- */
  if (isStorm) risks.push(str('stormRisk'));
  else if (isHeavy) risks.push(str('heavyRainRisk'));
  if (gust >= WIND_STRONG) risks.push(str('windRisk'));
  if (foggy) risks.push(str('fogRisk'));

  /* ---------- 2. what to wear ---------- */
  if (isStorm || isHeavy) outfit.push(str('rainOutfit'));
  else if (isRain || prob >= 60) outfit.push(str('showerOutfit'));
  if (spread !== null && spread > SPREAD_C) outfit.push(fill(str('diurnal'), { d: Math.round(spread) }));
  if (d.tmax !== null && d.tmax <= COLD_MAX_C) outfit.push(str('coldOutfit'));
  else if (temp !== null && temp >= HOT_C) outfit.push(str('hotOutfit'));
  if (uv >= UV_NOTICE) outfit.push(str('uvOutfit'));
  if (wind >= WIND_BREEZY && gust < WIND_STRONG) outfit.push(str('windOutfit'));

  /* ---------- 3. how to plan the day ---------- */
  if (isStorm) plan.push(str('stormPlan'));
  else if (isHeavy) plan.push(str('heavyRainPlan'));
  else if (prob >= 60) plan.push(str('rainPlan'));
  else if (isRain || isDrizzle) plan.push(str('lightRainPlan'));
  if (temp !== null && temp >= HOT_C) plan.push(str('hotPlan'));
  if (uv >= UV_NOTICE) plan.push(str('uvPlan'));
  if (foggy) plan.push(str('fogPlan'));
  if (code === 0 || code === 1) plan.push(str('clearPlan'));
  else if (code === 3) plan.push(str('overcastPlan'));
  if (!isStorm && !isHeavy && !foggy && d.mistChance !== null) {
    plan.push(d.mistChance >= 55 ? str('mistPlan') : str('mistLowPlan'));
  }
  if (temp !== null && d.cityTemp !== null && d.cityTemp - temp >= 3) {
    plan.push(fill(str('altitudePlan'), { d: Math.round(d.cityTemp - temp) }));
  }

  /* ---------- 4. what to carry — only the items that apply ---------- */
  if (isStorm || isHeavy) pack.push(str('packRaincoat'));
  else if (prob >= 60 || isRain || isDrizzle) pack.push(gust >= WIND_BREEZY ? str('packRaincoat') : str('packUmbrella'));
  if (isRain || isDrizzle || (d.precip ?? 0) > 0) pack.push(str('packNonSlip'));
  if (uv >= UV_NOTICE) {
    pack.push(str('packSunscreen'));
    pack.push(str('packSunglasses'));
    pack.push(str('packHat'));
  }
  if (temp !== null && temp >= HOT_C) pack.push(str('packWater'));
  if (spread !== null && spread > SPREAD_C) pack.push(str('packWarmLayer'));
  if (d.tmax !== null && d.tmax <= COLD_MAX_C) pack.push(str('packScarf'));

  return { risks: uniq(risks), outfit: uniq(outfit), plan: uniq(plan), pack: uniq(pack) };
}

/** Build the input from an Open-Meteo payload so server and browser agree. */
export function adviceFromPayload(
  payload: any,
  base: { cityTemp: number | null; mistChance: number | null }
): AdviceInput {
  const cur = payload?.current ?? {};
  const daily = payload?.daily ?? {};
  const n = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    code: n(cur.weather_code),
    temp: n(cur.temperature_2m),
    apparent: n(cur.apparent_temperature),
    humidity: n(cur.relative_humidity_2m),
    wind: n(cur.wind_speed_10m),
    gust: n(cur.wind_gusts_10m),
    precip: n(cur.precipitation),
    precipProb: n(daily.precipitation_probability_max?.[0]),
    uv: n(daily.uv_index_max?.[0]),
    visibility: n(cur.visibility),
    tmax: n(daily.temperature_2m_max?.[0]),
    tmin: n(daily.temperature_2m_min?.[0]),
    cityTemp: base.cityTemp,
    mistChance: base.mistChance,
  };
}
