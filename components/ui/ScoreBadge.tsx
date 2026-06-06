import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 70) return Colors.green;
  if (score >= 40) return Colors.orange;
  return Colors.error;
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const dim = size === 'sm' ? 36 : size === 'lg' ? 72 : 48;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 24 : 17;

  return (
    <View style={[styles.badge, { width: dim, height: dim, borderRadius: dim / 2, borderColor: color, backgroundColor: `${color}15` }]}>
      <Text style={[styles.text, { color, fontSize }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  text: { fontWeight: '800' },
});
