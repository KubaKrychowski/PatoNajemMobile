import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { offersService } from '../../../services/offersService';
import { OfferCard } from '../../../components/offers/OfferCard';
import { RootState, AppDispatch } from '../../../store';
import { setSearch, setTab } from '../../../store/offersSlice';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../../constants/theme';
import { OfferFilterTab, Offer } from '../../../types';

const TABS: { key: OfferFilterTab; label: string }[] = [
  { key: 'wszystkie', label: 'Wszystkie' },
  { key: 'dostepne',  label: 'Dostępne' },
  { key: 'wynajete',  label: 'Wynajęte' },
];

export default function OfertyScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((s: RootState) => s.offers.filters);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedOffers, setCachedOffers] = useState<Offer[]>([]);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage,
    isLoading, isError, refetch, isFetching,
  } = useInfiniteQuery({
    queryKey: ['offers', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        const cached = await offersService.getCachedOffers();
        setIsOffline(true);
        setCachedOffers(cached?.items ?? []);
        return cached ?? { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
      }
      setIsOffline(false);
      return offersService.getOffers(filters, pageParam as number);
    },
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
  });

  const offers = data?.pages.flatMap((p) => p.items) ?? cachedOffers;

  const renderOffer = useCallback(({ item }: { item: Offer }) => (
    <OfferCard offer={item} />
  ), []);

  const keyExtractor = useCallback((item: Offer) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.logo}>Pato<Text style={{ color: Colors.green }}>Najem</Text></Text>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline-outline" size={12} color={Colors.orange} />
            <Text style={styles.offlineText}> Offline</Text>
          </View>
        )}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Szukaj ofert..."
          placeholderTextColor={Colors.dim}
          value={filters.search}
          onChangeText={(t) => dispatch(setSearch(t))}
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, filters.tab === t.key && styles.tabActive]}
            onPress={() => dispatch(setTab(t.key))}
          >
            <Text style={[styles.tabText, filters.tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/oferty/nowa')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.green} size="large" />
          <Text style={styles.loadingText}>Ładowanie ofert...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Błąd ładowania ofert</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOffer}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={Colors.green}
            />
          }
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator color={Colors.green} style={{ marginVertical: Spacing.lg }} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Brak ofert dla tych filtrów</Text>
            </View>
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  logo: { fontSize: 22, fontWeight: '900', color: Colors.text },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${Colors.orange}22`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  offlineText: { fontSize: FontSize.xs, color: Colors.orange },
  searchWrap: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  search: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, color: Colors.text, fontSize: FontSize.md },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  tabActive: { backgroundColor: `${Colors.green}18`, borderColor: `${Colors.green}44` },
  tabText: { fontSize: FontSize.sm, color: Colors.muted, fontWeight: '600' },
  tabTextActive: { color: Colors.green },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  loadingText: { color: Colors.muted, marginTop: Spacing.sm, fontSize: FontSize.sm },
  errorText: { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  retryText: { color: Colors.blue, fontWeight: '600' },
  emptyText: { color: Colors.muted, fontSize: FontSize.md },
  fab: {
    position: 'absolute', bottom: 24, right: 20, zIndex: 99,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
});
