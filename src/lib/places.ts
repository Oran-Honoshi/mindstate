const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { data: T; ts: number };
    if (Date.now() - entry.ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null; }
    return entry.data;
  } catch { return null; }
}

function cacheSet<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* quota */ }
}

export interface CityInfo {
  facts: string[];
  thumbnailUrl: string | null;
}

export async function getCityInfo(city: string): Promise<CityInfo> {
  const key = `ms_city_${city.toLowerCase().replace(/\s+/g, "_")}`;
  const cached = cacheGet<CityInfo>(key);
  if (cached) return cached;
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
    );
    if (!r.ok) throw new Error();
    const d = await r.json();
    const sentences = ((d.extract ?? "") as string).match(/[^.!?]+[.!?]+/g) ?? [];
    const facts = sentences.slice(0, 2).map((s: string) => s.trim()).filter(Boolean);
    const thumbnailUrl = (d.thumbnail?.source as string | undefined) ?? null;
    const result: CityInfo = { facts, thumbnailUrl };
    if (facts.length || thumbnailUrl) cacheSet(key, result);
    return result;
  } catch { return { facts: [], thumbnailUrl: null }; }
}

export interface CountryData {
  flagUrl: string;
  capital: string;
  population: string;
}

export async function getCountryData(country: string): Promise<CountryData | null> {
  const key = `ms_country_${country.toLowerCase().replace(/\s+/g, "_")}`;
  const cached = cacheGet<CountryData>(key);
  if (cached) return cached;
  try {
    const r = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`
    );
    if (!r.ok) throw new Error();
    const arr = await r.json();
    const d = arr[0] as {
      cca2: string; capital?: string[]; population: number;
    };
    const result: CountryData = {
      flagUrl: `https://flagcdn.com/w160/${d.cca2.toLowerCase()}.svg`,
      capital: d.capital?.[0] ?? "",
      population: d.population > 1_000_000
        ? `${Math.round(d.population / 1_000_000)}M`
        : `${Math.round(d.population / 1_000)}K`,
    };
    cacheSet(key, result);
    return result;
  } catch { return null; }
}
