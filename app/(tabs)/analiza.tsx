import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { analyzeAddress, geocodeAddress } from '../../services/analysisService';
import { AirQualityCard } from '../../components/analysis/AirQualityCard';
import { ScoreCard } from '../../components/analysis/ScoreCard';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { AddressAnalysis } from '../../types';

const NEG_IONICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  power_line: 'flash-outline',
  mine:       'hammer-outline',
  railway:    'train-outline',
  highway:    'car-outline',
};

export default function AnalizaScreen() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<AddressAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!address.trim()) {
      Alert.alert('Błąd', 'Wpisz adres do analizy');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeAddress(address);
      setResult(analysis);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Błąd', err.message ?? 'Nie udało się przeprowadzić analizy');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Brak uprawnień',
            'Dostęp do lokalizacji jest trwale zablokowany. Włącz go ręcznie w ustawieniach aplikacji.',
            [
              { text: 'Anuluj', style: 'cancel' },
              { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          Alert.alert('Brak uprawnień', 'Aplikacja potrzebuje dostępu do lokalizacji, aby pobrać Twój adres.');
        }
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) {
        const { street, city, streetNumber } = geo[0];
        setAddress([street, streetNumber, city].filter(Boolean).join(' '));
      }
    } catch (ex) {
      console.log(ex);
      Alert.alert('Błąd', 'Nie udało się pobrać lokalizacji');
    } finally {
      setLocating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Ionicons name="search" size={24} color={Colors.green} />
          <Text style={styles.heading}>Analiza adresu</Text>
        </View>
        <Text style={styles.sub}>Sprawdź okolicę zanim podpiszesz umowę</Text>

        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="ul. Puławska 143, Warszawa"
              placeholderTextColor={Colors.dim}
              value={address}
              onChangeText={setAddress}
              onSubmitEditing={handleAnalyze}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.locBtn} onPress={handleLocate} disabled={locating}>
              {locating
                ? <ActivityIndicator size="small" color={Colors.blue} />
                : <Ionicons name="locate-outline" size={22} color={Colors.blue} />
              }
            </TouchableOpacity>
          </View>
          <Button title="Analizuj" onPress={handleAnalyze} loading={loading} />
        </View>

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.green} size="large" />
            <Text style={styles.loadingText}>Pobieranie danych o lokalizacji...</Text>
          </View>
        )}

        {result && !loading && (
          <>
            <View style={styles.addressBanner}>
              <View style={styles.addressLabelRow}>
                <Ionicons name="location-outline" size={13} color={Colors.muted} />
                <Text style={styles.addressLabel}>Analizowany adres</Text>
              </View>
              <Text style={styles.addressText} numberOfLines={2}>{result.address}</Text>
            </View>

            {result.score && <ScoreCard score={result.score} />}

            {result.airQuality && <AirQualityCard data={result.airQuality} />}

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="warning-outline" size={18} color={Colors.orange} />
                <Text style={styles.cardTitle}>Elementy ryzyka</Text>
              </View>
              {result.negativeElements.length === 0 ? (
                <View style={styles.noRisk}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
                  <Text style={styles.noRiskText}>Brak wykrytych elementów ryzyka w promieniu 1 km</Text>
                </View>
              ) : (
                result.negativeElements.map((el) => (
                  <View key={el.type} style={styles.riskItem}>
                    <Ionicons name={NEG_IONICONS[el.type] ?? 'warning-outline'} size={20} color={Colors.error} />
                    <Text style={styles.riskLabel}>{el.label}</Text>
                    <View style={styles.riskBadge}>
                      <Text style={styles.riskBadgeText}>Wykryto</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.coords}>
              {result.lat.toFixed(5)}, {result.lng.toFixed(5)}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  sub: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.lg },
  inputCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, color: Colors.text, fontSize: FontSize.md },
  locBtn: { width: 48, height: 48, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  loadingText: { color: Colors.muted, fontSize: FontSize.sm },
  addressBanner: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  addressLabel: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  addressText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  noRisk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  noRiskText: { fontSize: FontSize.sm, color: Colors.muted, flex: 1 },
  riskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderColor: Colors.border },
  riskLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  riskBadge: { backgroundColor: `${Colors.error}15`, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: `${Colors.error}44` },
  riskBadgeText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: '600' },
  coords: { fontSize: FontSize.xs, color: Colors.dim, textAlign: 'center', marginTop: Spacing.sm },
});
