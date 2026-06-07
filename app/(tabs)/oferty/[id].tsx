import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { offersService } from '../../../services/offersService';
import { Button } from '../../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius } from '../../../constants/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useSelector((s: RootState) => s.auth.user);
  const [comment, setComment] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const { data: offer, isLoading } = useQuery({
    queryKey: ['offer', id],
    queryFn: () => offersService.getOffer(id),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => offersService.getComments(id),
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: (type: 'up' | 'down') => offersService.vote(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer', id] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => offersService.addComment(id, comment, user?.name ?? 'Anonim'),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Błąd', 'Musisz być zalogowany aby komentować'),
  });

  if (isLoading || !offer) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={20} color={Colors.blue} />
            <Text style={styles.backText}>Wróć</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, offer.status === 'available' ? styles.available : styles.rented]}>
            <Text style={styles.statusText}>{offer.status === 'available' ? 'Dostępne' : 'Wynajęte'}</Text>
          </View>
        </View>

        {offer.imageUrls?.length > 0 ? (
          <View>
            <Image source={{ uri: offer.imageUrls[activeImage] }} style={styles.image} resizeMode="cover" />
            {offer.imageUrls.length > 1 && (
              <ScrollView horizontal style={styles.thumbnails} showsHorizontalScrollIndicator={false}>
                {offer.imageUrls.map((url, i) => (
                  <TouchableOpacity key={url} onPress={() => setActiveImage(i)}>
                    <Image source={{ uri: url }} style={[styles.thumb, i === activeImage && styles.thumbActive]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="home-outline" size={56} color={Colors.dim} />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{offer.price.toLocaleString('pl-PL')} zł/mc</Text>
            {offer.area && <Text style={styles.area}>{offer.area} m²</Text>}
          </View>
          <Text style={styles.title}>{offer.title}</Text>
          {offer.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.muted} />
              <Text style={styles.location}>{offer.location}</Text>
            </View>
          )}

          <View style={styles.voteRow}>
            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() => voteMutation.mutate('down')}
              disabled={voteMutation.isPending}
            >
              <Ionicons name="thumbs-down" size={18} color={Colors.error} />
              <Text style={[styles.voteBtnText, { color: Colors.error }]}>{offer.downvotes ?? 0}</Text>
            </TouchableOpacity>

            <View style={styles.viewsRow}>
              <Ionicons name="eye-outline" size={14} color={Colors.muted} />
              <Text style={styles.views}>{offer.viewCount ?? 0}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Opis</Text>
          <Text style={styles.description}>{offer.description}</Text>

          <Text style={styles.sectionTitle}>Komentarze ({comments.length})</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{c.userName}</Text>
                <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString('pl-PL')}</Text>
              </View>
              <Text style={styles.commentText}>{c.content}</Text>
            </View>
          ))}

          {user && (
            <View style={styles.addComment}>
              <TextInput
                style={styles.commentInput}
                placeholder="Dodaj komentarz..."
                placeholderTextColor={Colors.dim}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <Button
                title="Wyślij"
                onPress={() => commentMutation.mutate()}
                loading={commentMutation.isPending}
                disabled={!comment.trim()}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.sm },
  backText: { color: Colors.blue, fontSize: FontSize.md, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  available: { backgroundColor: `${Colors.green}22`, borderColor: `${Colors.green}55` },
  rented: { backgroundColor: `${Colors.coral}22`, borderColor: `${Colors.coral}55` },
  statusText: { fontSize: FontSize.xs, color: Colors.text, fontWeight: '600' },
  image: { width: '100%', height: 260 },
  imagePlaceholder: { height: 200, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  thumbnails: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  thumb: { width: 60, height: 60, borderRadius: Radius.sm, marginRight: Spacing.sm, opacity: 0.6 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: Colors.green },
  body: { padding: Spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: 4 },
  price: { fontSize: 28, fontWeight: '900', color: Colors.green },
  area: { fontSize: FontSize.md, color: Colors.muted },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  location: { fontSize: FontSize.sm, color: Colors.muted },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  voteBtnText: { fontSize: FontSize.md, fontWeight: '600' },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  views: { fontSize: FontSize.sm, color: Colors.muted },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 24 },
  commentCard: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  commentDate: { fontSize: FontSize.xs, color: Colors.muted },
  commentText: { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 20 },
  addComment: { marginTop: Spacing.lg, gap: Spacing.sm },
  commentInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md, minHeight: 80, textAlignVertical: 'top' },
});
