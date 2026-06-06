import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AirQuality } from '../../types';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props { data: AirQuality }

interface Pollutant {
  key: keyof AirQuality;
  label: string;
  unit: string;
  thresholds: [number, number]; // [good, moderate]
}

const POLLUTANTS: Pollutant[] = [
  { key: 'pm2_5',             label: 'PM2.5',  unit: 'µg/m³', thresholds: [10, 25] },
  { key: 'pm10',              label: 'PM10',   unit: 'µg/m³', thresholds: [20, 50] },
  { key: 'ozone',             label: 'Ozon',   unit: 'µg/m³', thresholds: [60, 100] },
  { key: 'nitrogen_dioxide',  label: 'NO₂',    unit: 'µg/m³', thresholds: [20, 40] },
  { key: 'sulphur_dioxide',   label: 'SO₂',    unit: 'µg/m³', thresholds: [50, 125] },
  { key: 'carbon_monoxide',   label: 'CO',     unit: 'µg/m³', thresholds: [4000, 10000] },
];

function getColor(value: number, [good, moderate]: [number, number]): string {
  if (value <= good) return Colors.green;
  if (value <= moderate) return Colors.orange;
  return Colors.error;
}

export function AirQualityCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="leaf-outline" size={18} color={Colors.green} />
        <Text style={styles.title}>Jakość powietrza</Text>
      </View>
      {POLLUTANTS.map((p) => {
        const val = data[p.key];
        const color = getColor(val, p.thresholds);
        const maxVal = p.thresholds[1] * 1.5;
        const pct = Math.min(100, (val / maxVal) * 100);
        return (
          <View key={p.key} style={styles.row}>
            <Text style={styles.label}>{p.label}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.value, { color }]}>{val.toFixed(1)}</Text>
            <Text style={styles.unit}>{p.unit}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 44, fontSize: FontSize.xs, color: Colors.muted, fontWeight: '600' },
  barWrap: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, marginHorizontal: Spacing.sm, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: Radius.full },
  value: { width: 42, fontSize: FontSize.xs, fontWeight: '700', textAlign: 'right' },
  unit: { width: 40, fontSize: 9, color: Colors.dim, marginLeft: 2 },
});
