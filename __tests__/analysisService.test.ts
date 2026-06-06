import { calculateScore, geocodeAddress } from '../services/analysisService';
import { AirQuality, NegativeElement } from '../types';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('calculateScore', () => {
  const cleanAir: AirQuality = { pm2_5: 5, pm10: 10, ozone: 40, nitrogen_dioxide: 10, sulphur_dioxide: 20, carbon_monoxide: 1000 };
  const dirtyAir: AirQuality = { pm2_5: 80, pm10: 100, ozone: 120, nitrogen_dioxide: 50, sulphur_dioxide: 150, carbon_monoxide: 15000 };

  test('zwraca wysoki wynik dla czystego powietrza bez ryzyka', () => {
    const score = calculateScore(cleanAir, []);
    expect(score.total).toBeGreaterThan(70);
    expect(score.airQuality).toBeGreaterThan(80);
  });

  test('zwraca niższy wynik dla zanieczyszczonego powietrza', () => {
    const scoreDirty = calculateScore(dirtyAir, []);
    const scoreClean = calculateScore(cleanAir, []);
    expect(scoreDirty.total).toBeLessThan(scoreClean.total);
  });

  test('każdy element negatywny obniża wynik', () => {
    const noRisk = calculateScore(cleanAir, []);
    const oneRisk = calculateScore(cleanAir, [{ type: 'railway', label: 'Kolej' }]);
    const twoRisk = calculateScore(cleanAir, [{ type: 'railway', label: 'Kolej' }, { type: 'highway', label: 'Autostrada' }]);
    expect(oneRisk.total).toBeLessThan(noRisk.total);
    expect(twoRisk.total).toBeLessThan(oneRisk.total);
  });

  test('wynik mieści się w zakresie 0–100', () => {
    const score1 = calculateScore(cleanAir, []);
    const score2 = calculateScore(dirtyAir, Array(10).fill({ type: 'highway', label: 'Droga' } as NegativeElement));
    expect(score1.total).toBeGreaterThanOrEqual(0);
    expect(score1.total).toBeLessThanOrEqual(100);
    expect(score2.total).toBeGreaterThanOrEqual(0);
    expect(score2.total).toBeLessThanOrEqual(100);
  });

  test('zwraca score.nuisance = 100 gdy brak elementów ryzyka', () => {
    const score = calculateScore(cleanAir, []);
    expect(score.nuisance).toBe(100);
  });

  test('zwraca null-safe score gdy airQuality = null', () => {
    const score = calculateScore(null, []);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.airQuality).toBeDefined();
  });
});

describe('geocodeAddress', () => {
  test('zwraca null gdy Nominatim nie znajdzie adresu', async () => {
    mockedAxios.get = jest.fn().mockResolvedValueOnce({ data: [] });
    const result = await geocodeAddress('nieistniejacy adres xyz 99999');
    expect(result).toBeNull();
  });

  test('poprawnie parsuje odpowiedź Nominatim', async () => {
    mockedAxios.get = jest.fn().mockResolvedValueOnce({
      data: [{ lat: '52.2297', lon: '21.0122', display_name: 'Warszawa, Polska' }],
    });
    const result = await geocodeAddress('Warszawa');
    expect(result).not.toBeNull();
    expect(result?.lat).toBeCloseTo(52.2297);
    expect(result?.lng).toBeCloseTo(21.0122);
    expect(result?.display).toContain('Warszawa');
  });
});
