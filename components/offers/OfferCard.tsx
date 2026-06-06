import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Offer } from '../../types';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface OfferCardProps {
  offer: Offer;
}

// Memo zapobiega re-renderowaniu gdy inne oferty się zmienią
export const OfferCard = memo(function OfferCard({ offer }: OfferCardProps) {
  const imageUrl = offer.imageUrls?.[0];
  const isAvailable = offer.status === 'available';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/oferty/${offer.id}`)}
      activeOpacity={0.85}
    >
      {/* Zdjęcie */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="home-outline" size={48} color={Colors.dim} />
        </View>
      )}

      {/* Status badge */}
      <View style={[styles.statusBadge, isAvailable ? styles.statusAvailable : styles.statusRented]}>
        <Text style={styles.statusText}>{isAvailable ? 'Dostępne' : 'Wynajęte'}</Text>
      </View>

      {/* Treść */}
      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{offer.price.toLocaleString('pl-PL')} zł/mc</Text>
          {offer.area && <Text style={styles.area}>{offer.area} m²</Text>}
        </View>
        <Text style={styles.title} numberOfLines={1}>{offer.title}</Text>
        {offer.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.muted} />
            <Text style={styles.location} numberOfLines={1}>{offer.location}</Text>
          </View>
        )}

        {/* Głosy i komentarze */}
        <View style={styles.footer}>
          <Ionicons name="thumbs-down" size={13} color={Colors.error} />
          <Text style={[styles.votes, { color: Colors.error }]}>{offer.downvotes ?? 0}</Text>
          <Ionicons name="chatbubble-outline" size={13} color={Colors.muted} />
          <Text style={styles.comments}>{offer.commentCount ?? 0}</Text>
          {offer.isFavorited && <Ionicons name="heart" size={14} color={Colors.coral} style={{ marginLeft: 'auto' }} />}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  imagePlaceholder: { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusAvailable: { backgroundColor: `${Colors.green}22`, borderWidth: 1, borderColor: `${Colors.green}55` },
  statusRented: { backgroundColor: `${Colors.coral}22`, borderWidth: 1, borderColor: `${Colors.coral}55` },
  statusText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  body: { padding: Spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: 4 },
  price: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.green },
  area: { fontSize: FontSize.sm, color: Colors.muted },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  location: { fontSize: FontSize.sm, color: Colors.muted, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  votes: { fontSize: FontSize.sm, color: Colors.muted, marginRight: Spacing.sm },
  comments: { fontSize: FontSize.sm, color: Colors.muted },
});
