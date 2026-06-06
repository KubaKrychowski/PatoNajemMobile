import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationScore } from '../../types';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props { score: LocationScore }

const METRICS: { key: keyof LocationScore; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'airQuality', label: 'Jakość powietrza', icon: 'leaf-outline' },
  { key: 'poi',        label: 'Punkty POI',       icon: 'storefront-outline' },
  { key: 'nuisance',   label: 'Brak uciążliwości',icon: 'volume-mute-outline' },
  { key: 'transport',  label: 'Komunikacja',       icon: 'bus-outline' },
];

function getColor(v: number) {
  if (v >= 70) return Colors.green;
  if (v >= 40) return Colors.orange;
  return Colors.error;
}

export function ScoreCard({ score }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="stats-chart-outline" size={18} color={Colors.green} />
          <Text style={styles.title}>Scoring lokalizacji</Text>
        </View>
        <ScoreBadge score={score.total} size="lg" />
      </View>
      {METRICS.map((m) => {
        const val = score[m.key];
        const color = getColor(val);
        return (
          <View key={m.key} style={styles.row}>
            <Ionicons name={m.icon} size={18} color={color} style={styles.icon} />
            <Text style={styles.label}>{m.label}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { width: `${val}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.val, { color }]}>{val}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon: { width: 24 },
  label: { fontSize: FontSize.sm, color: Colors.muted, width: 130 },
  barWrap: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, marginHorizontal: Spacing.sm, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: Radius.full },
  val: { width: 32, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'right' },
});
