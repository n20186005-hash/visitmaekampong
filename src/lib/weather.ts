import type { Lang } from '../i18n/ui';

/**
 * Weather data access layer.
 *
 * Values are resolved on the server (build time for this statically generated
 * site) and kept in a short-lived module cache so repeated renders of the
 * th/en/zh pages reuse a single upstream response instead of fetching again.
 */

export type CurrentWeather = {
  temperature: number | null;
  apparent: number | null;
  humidity: number | null;
  wind: number | null;
  gust: number | null;
  visibility: number | null;
  precipitation: number | null;
  code: number | null;
  isDay: boolean;
  time: string | null;
};

export type ForecastDay = {
  date: string;
  code: number | null;
  max: number | null;
  min: number | null;
  rainChance: number | null;
  precip: number | null;
  uv: number | null;
  sunrise: string | null;
  sunset: string | null;
};

export type WeatherSnapshot = {
  ok: boolean;
  current: CurrentWeather;
  days: ForecastDay[];
  sunrise: string | null;
  sunset: string | null;
  /** Chiang Mai city reading, used for the altitude temperature comparison. */
  cityTemp: number | null;
  fetchedAt: string | null;
};

/**
 * Reference lowland station used to explain the altitude effect: Mae Kampong
 * sits around 1,300 m while Chiang Mai city is near 300 m.
 */
export const CITY_COORDS = { lat: 18.7883, lng: 98.9853 };

/** Builds the upstream request. Exported so the browser refresh uses the same shape. */
export const weatherUrl = (
  lat: number,
  lng: number,
  days = 7,
  city: { lat: number; lng: number } = CITY_COORDS
): string =>
  `${ENDPOINT}?latitude=${lat},${city.lat}&longitude=${lng},${city.lng}` +
  `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility,is_day` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset` +
  `&timezone=Asia%2FBangkok&forecast_days=${days}&wind_speed_unit=kmh`;

/** Multi-location responses come back as an array; pick the village entry. */
export const pickLocation = (data: any, index = 0): any =>
  Array.isArray(data) ? data[index] ?? {} : (data ?? {});

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; data: WeatherSnapshot }>();

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

const hhmm = (iso: string | undefined): string | null => {
  if (!iso) return null;
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
};

export const wmoIcon = (code: number | null): string => {
  if (code === null) return '🌡️';
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};

const WMO_LABELS: Record<number, Record<Lang, string>> = {
  0: { en: 'Clear sky', th: 'ท้องฟ้าแจ่มใส', zh: '晴' },
  1: { en: 'Mainly clear', th: 'ส่วนใหญ่แจ่มใส', zh: '晴間少雲' },
  2: { en: 'Partly cloudy', th: 'มีเมฆบางส่วน', zh: '多雲' },
  3: { en: 'Overcast', th: 'มีเมฆมาก', zh: '陰' },
  45: { en: 'Fog', th: 'หมอก', zh: '霧' },
  48: { en: 'Rime fog', th: 'หมอกน้ำค้างแข็ง', zh: '霧凇' },
  51: { en: 'Light drizzle', th: 'ฝนตกปรอยๆ เล็กน้อย', zh: '小毛毛雨' },
  53: { en: 'Drizzle', th: 'ฝนตกปรอยๆ', zh: '毛毛雨' },
  55: { en: 'Heavy drizzle', th: 'ฝนตกปรอยๆ หนัก', zh: '大毛毛雨' },
  56: { en: 'Freezing drizzle', th: 'ฝนปรอยเยือกแข็ง', zh: '凍毛毛雨' },
  57: { en: 'Freezing drizzle', th: 'ฝนปรอยเยือกแข็ง', zh: '凍毛毛雨' },
  61: { en: 'Light rain', th: 'ฝนตกเล็กน้อย', zh: '小雨' },
  63: { en: 'Rain', th: 'ฝนตก', zh: '中雨' },
  65: { en: 'Heavy rain', th: 'ฝนตกหนัก', zh: '大雨' },
  66: { en: 'Freezing rain', th: 'ฝนเยือกแข็ง', zh: '凍雨' },
  67: { en: 'Freezing rain', th: 'ฝนเยือกแข็ง', zh: '凍雨' },
  71: { en: 'Light snow', th: 'หิมะตกเล็กน้อย', zh: '小雪' },
  73: { en: 'Snow', th: 'หิมะตก', zh: '雪' },
  75: { en: 'Heavy snow', th: 'หิมะตกหนัก', zh: '大雪' },
  77: { en: 'Snow grains', th: 'เม็ดหิมะ', zh: '米雪' },
  80: { en: 'Light showers', th: 'ฝนโปรยปราย', zh: '陣雨' },
  81: { en: 'Showers', th: 'ฝนโปรยปราย', zh: '陣雨' },
  82: { en: 'Violent showers', th: 'ฝนโปรยปรายหนัก', zh: '強陣雨' },
  85: { en: 'Snow showers', th: 'หิมะโปรยปราย', zh: '陣雪' },
  86: { en: 'Snow showers', th: 'หิมะโปรยปราย', zh: '陣雪' },
  95: { en: 'Thunderstorm', th: 'พายุฝนฟ้าคะนอง', zh: '雷陣雨' },
  96: { en: 'Storm with hail', th: 'พายุฝนฟ้าคะนองและลูกเห็บ', zh: '雷陣雨伴冰雹' },
  99: { en: 'Storm with hail', th: 'พายุฝนฟ้าคะนองและลูกเห็บ', zh: '雷陣雨伴冰雹' },
};

export const wmoLabel = (code: number | null, lang: Lang): string => {
  if (code === null) return '';
  const entry = WMO_LABELS[code];
  return entry ? entry[lang] : WMO_LABELS[2][lang];
};

/** Whole code -> label map, so the browser refresh can translate without a second i18n copy. */
export const wmoLabelMap = (lang: Lang): Record<string, string> =>
  Object.fromEntries(Object.entries(WMO_LABELS).map(([code, labels]) => [code, labels[lang]]));

/** Practical "do I need an umbrella?" verdict for the next hours. */
export type Umbrella = 'needed' | 'maybe' | 'none';

export const umbrellaVerdict = (snap: WeatherSnapshot): Umbrella => {
  const today = snap.days[0];
  const rain = today?.rainChance ?? 0;
  const wet = (code: number | null) =>
    code !== null && ((code >= 51 && code <= 99) || code === 45 || code === 48);
  if (wet(snap.current.code) || rain >= 60) return 'needed';
  if (rain >= 30) return 'maybe';
  return 'none';
};

/**
 * Chance of the famous morning "sea of clouds".
 * Valley fog forms when the air is near saturation, the sky is clear (radiative
 * cooling) and there is little wind to mix the layers — a simple heuristic that
 * mirrors what villagers watch for at dawn.
 */
export const seaOfCloudsChance = (snap: WeatherSnapshot): number => {
  const h = snap.current.humidity;
  const code = snap.current.code ?? 3;
  if (h === null) return 0;
  let score = 0;
  if (h >= 95) score += 60;
  else if (h >= 85) score += 45;
  else if (h >= 70) score += 28;
  else score += 10;

  if (code === 0 || code === 1) score += 30;
  else if (code === 2) score += 20;
  else if (code === 3) score += 8;
  else if (code >= 51) score -= 15;

  const wind = snap.current.wind ?? 0;
  if (wind <= 5) score += 12;
  else if (wind <= 12) score += 5;
  else score -= 12;

  return Math.max(0, Math.min(95, Math.round(score)));
};

/** Mist chance from a single observation — lets the browser refresh reuse the same heuristic. */
export const mistChanceFromCurrent = (
  humidity: number | null,
  wind: number | null,
  code: number | null
): number =>
  seaOfCloudsChance({
    ok: true,
    current: {
      temperature: null,
      apparent: null,
      humidity,
      wind,
      gust: null,
      visibility: null,
      precipitation: null,
      code,
      isDay: true,
      time: null,
    },
    days: [],
    sunrise: null,
    sunset: null,
    cityTemp: null,
    fetchedAt: null,
  });

const emptySnapshot = (): WeatherSnapshot => ({
  ok: false,
  current: {
    temperature: null,
    apparent: null,
    humidity: null,
    wind: null,
    gust: null,
    visibility: null,
    precipitation: null,
    code: null,
    isDay: true,
    time: null,
  },
  days: [],
  sunrise: null,
  sunset: null,
  cityTemp: null,
  fetchedAt: null,
});

/**
 * Fetch current conditions plus a multi-day forecast. Cached in-process.
 */
export async function getWeather(lat: number, lng: number, days = 7): Promise<WeatherSnapshot> {
  const key = `${lat},${lng},${days}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  try {
    const res = await fetch(weatherUrl(lat, lng, days), { signal: AbortSignal.timeout(9000) });
    if (!res.ok) throw new Error(`weather ${res.status}`);
    const raw = (await res.json()) as any;

    const data = pickLocation(raw, 0);
    const city = pickLocation(raw, 1);
    const cur = data?.current ?? {};
    const daily = data?.daily ?? {};

    const snapshot: WeatherSnapshot = {
      ok: true,
      current: {
        temperature: num(cur.temperature_2m),
        apparent: num(cur.apparent_temperature),
        humidity: num(cur.relative_humidity_2m),
        wind: num(cur.wind_speed_10m),
        gust: num(cur.wind_gusts_10m),
        visibility: num(cur.visibility),
        precipitation: num(cur.precipitation),
        code: num(cur.weather_code),
        isDay: cur.is_day !== 0,
        time: cur.time ?? null,
      },
      days: (daily.time ?? []).map((date: string, i: number) => ({
        date,
        code: num(daily.weather_code?.[i]),
        max: num(daily.temperature_2m_max?.[i]),
        min: num(daily.temperature_2m_min?.[i]),
        rainChance: num(daily.precipitation_probability_max?.[i]),
        precip: num(daily.precipitation_sum?.[i]),
        uv: num(daily.uv_index_max?.[i]),
        sunrise: hhmm(daily.sunrise?.[i]),
        sunset: hhmm(daily.sunset?.[i]),
      })),
      sunrise: hhmm(daily.sunrise?.[0]),
      sunset: hhmm(daily.sunset?.[0]),
      cityTemp: num(city?.current?.temperature_2m),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(key, { at: Date.now(), data: snapshot });
    return snapshot;
  } catch (err) {
    console.warn('[weather] unable to load forecast data:', (err as Error).message);
    const fallback = emptySnapshot();
    cache.set(key, { at: Date.now(), data: fallback });
    return fallback;
  }
}

/** Localised weekday label, e.g. "Mon", using the site's own weekday names. */
export const weekdayLabel = (date: string, weekdays: string[]): string => {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return weekdays[d.getDay()] ?? date;
};

/** "12/14" style short date (day and month only). */
export const shortDate = (date: string): string => {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[3])}/${Number(m[2])}` : date;
};
