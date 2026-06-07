import axios from 'axios';
import {
  AIR_QUALITY_URL,
  NOMINATIM_URL,
  OVERPASS_URL,
} from '../constants/config';
import { AirQuality, NegativeElement, LocationScore, AddressAnalysis } from '../types';

const NOMINATIM_HEADERS = {
  'Accept-Language': 'pl',
  'User-Agent': 'PatoNajem/1.0 (kubolot33123@gmail.com)',
};

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const res = await axios.get(`${NOMINATIM_URL}/search`, {
    params: { q: address, format: 'json', limit: 1, countrycodes: 'pl' },
    headers: NOMINATIM_HEADERS,
  });
  if (!res.data?.length) return null;
  const r = res.data[0];
  return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), display: r.display_name };
}

export async function fetchAirQuality(lat: number, lng: number): Promise<AirQuality | null> {
  try {
    const res = await axios.get(`${AIR_QUALITY_URL}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide',
        timezone: 'Europe/Warsaw',
      },
    });
    const c = res.data?.current;
    if (!c) return null;
    return {
      pm2_5: c.pm2_5 ?? 0,
      pm10: c.pm10 ?? 0,
      ozone: c.ozone ?? 0,
      nitrogen_dioxide: c.nitrogen_dioxide ?? 0,
      sulphur_dioxide: c.sulphur_dioxide ?? 0,
      carbon_monoxide: c.carbon_monoxide ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchNegativeElements(lat: number, lng: number): Promise<NegativeElement[]> {
  const radius = 1000;
  const query = `
    [out:json][timeout:15];
    (
      way["power"="line"](around:${radius},${lat},${lng});
      node["landuse"="quarry"](around:${radius},${lat},${lng});
      way["railway"="rail"](around:${radius},${lat},${lng});
      way["highway"~"motorway|trunk"](around:${radius},${lat},${lng});
    );
    out center;
  `;
  try {
    const res = await axios.post(OVERPASS_URL, query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000,
    });
    const elements: NegativeElement[] = [];
    const seen = new Set<string>();
    for (const el of res.data?.elements ?? []) {
      const tags = el.tags ?? {};
      let type: NegativeElement['type'] | null = null;
      let label = '';
      if (tags.power === 'line' && !seen.has('power_line')) { type = 'power_line'; label = 'Linia wysokiego napięcia'; seen.add('power_line'); }
      else if (tags.landuse === 'quarry' && !seen.has('mine')) { type = 'mine'; label = 'Kopalnia / kamieniołom'; seen.add('mine'); }
      else if (tags.railway === 'rail' && !seen.has('railway')) { type = 'railway'; label = 'Linia kolejowa'; seen.add('railway'); }
      else if (['motorway', 'trunk'].includes(tags.highway) && !seen.has('highway')) { type = 'highway'; label = 'Droga szybkiego ruchu'; seen.add('highway'); }
      if (type) elements.push({ type, label });
    }
    return elements;
  } catch {
    return [];
  }
}

export function calculateScore(airQuality: AirQuality | null, negativeElements: NegativeElement[]): LocationScore {
  const pm25 = airQuality?.pm2_5 ?? 25;
  const airScore = Math.max(0, Math.min(100, Math.round(100 - (pm25 / 75) * 100)));

  const nuisancePenalty = Math.min(100, negativeElements.length * 20);
  const nuisanceScore = 100 - nuisancePenalty;

  const poiScore = 65;
  const transportScore = 70;

  const total = Math.round((airScore * 0.3) + (nuisanceScore * 0.3) + (poiScore * 0.2) + (transportScore * 0.2));

  return { total, airQuality: airScore, poi: poiScore, nuisance: nuisanceScore, transport: transportScore };
}

export async function analyzeAddress(address: string): Promise<AddressAnalysis> {
  let geo: { lat: number; lng: number; display: string } | null = null;
  try {
    geo = await geocodeAddress(address);
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 403) {
      throw new Error('Geocoder tymczasowo niedostępny (403). Spróbuj ponownie za chwilę.');
    }
    if (status === 429) {
      throw new Error('Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.');
    }
    throw new Error('Błąd połączenia z geocoderem. Sprawdź internet i spróbuj ponownie.');
  }
  if (!geo) throw new Error('Nie znaleziono adresu. Spróbuj podać dokładniejszy adres.');

  const [airQuality, negativeElements] = await Promise.all([
    fetchAirQuality(geo.lat, geo.lng),
    fetchNegativeElements(geo.lat, geo.lng),
  ]);

  const score = calculateScore(airQuality, negativeElements);

  return {
    address: geo.display,
    lat: geo.lat,
    lng: geo.lng,
    airQuality,
    negativeElements,
    score,
  };
}
