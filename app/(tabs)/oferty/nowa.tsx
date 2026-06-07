import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image, FlatList, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { offersService } from '../../../services/offersService';
import { Colors, Spacing, FontSize, Radius } from '../../../constants/theme';

const DIFFICULTIES = ['NORMAL', 'HARD MODE', 'EXTREME'];
const MAX_IMAGES = 5;

export default function NowaOfertaScreen() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    location: '',
    area: '',
    price: '',
    description: '',
    landlordPhone: '',
    difficulty: 'NORMAL',
  });
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const pickImages = async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Brak uprawnień',
          'Dostęp do galerii jest trwale zablokowany. Włącz go ręcznie w ustawieniach aplikacji.',
          [
            { text: 'Anuluj', style: 'cancel' },
            { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert('Brak uprawnień', 'Aplikacja potrzebuje dostępu do galerii, aby dodać zdjęcia do oferty.');
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
      orderedSelection: true,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Tytuł jest wymagany';
    if (!form.location.trim()) e.location = 'Lokalizacja jest wymagana';
    if (!form.area || isNaN(Number(form.area)) || Number(form.area) < 1)
      e.area = 'Podaj poprawną powierzchnię (min. 1 m²)';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Podaj poprawną cenę';
    if (!form.description.trim()) e.description = 'Opis jest wymagany';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const offer = await offersService.createOffer({
        title: form.title.trim(),
        location: form.location.trim(),
        area: Number(form.area),
        price: Number(form.price),
        description: form.description.trim(),
        landlordPhone: form.landlordPhone.trim() || undefined,
        difficulty: form.difficulty,
      });

      if (images.length > 0) {
        for (const img of images) {
          try {
            await offersService.uploadOfferImage(offer.id, img.uri);
          } catch {
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['offers'] });
      Alert.alert('Sukces', 'Oferta została dodana!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Błąd dodawania oferty';
      Alert.alert('Błąd', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Nowa oferta</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Input label="Tytuł ogłoszenia" placeholder="np. Mieszkanie 2-pokojowe Wola" value={form.title} onChangeText={v => set('title', v)} error={errors.title} />
          <Input label="Lokalizacja" placeholder="np. Warszawa, ul. Kowalska 5" value={form.location} onChangeText={v => set('location', v)} error={errors.location} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Input label="Powierzchnia (m²)" placeholder="50" value={form.area} onChangeText={v => set('area', v)} keyboardType="numeric" error={errors.area} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Cena (zł/mies.)" placeholder="2500" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" error={errors.price} />
            </View>
          </View>

          <Input label="Opis" placeholder="Opisz mieszkanie, stan, wyposażenie..." value={form.description} onChangeText={v => set('description', v)} error={errors.description} />
          <Input label="Telefon wynajmującego (opcjonalnie)" placeholder="+48 123 456 789" value={form.landlordPhone} onChangeText={v => set('landlordPhone', v)} keyboardType="phone-pad" />

          <Text style={styles.label}>Zdjęcia ({images.length}/{MAX_IMAGES})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={img.uri} style={styles.imageThumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="camera-outline" size={28} color={Colors.muted} />
                <Text style={styles.addImageText}>Dodaj</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <Text style={styles.label}>Poziom patologii</Text>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.diffBtn, form.difficulty === d && styles.diffActive]}
                onPress={() => set('difficulty', d)}
              >
                <Text style={[styles.diffText, form.difficulty === d && styles.diffTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Dodaj ofertę" onPress={handleSubmit} loading={loading} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  topTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  container: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 48 },
  row: { flexDirection: 'row' },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.muted, marginBottom: 6, marginTop: 4 },
  imageRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  imageThumbWrap: { position: 'relative', marginRight: Spacing.sm },
  imageThumb: { width: 80, height: 80, borderRadius: Radius.md, backgroundColor: Colors.surface },
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.bg, borderRadius: 10 },
  addImageBtn: {
    width: 80, height: 80, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addImageText: { fontSize: FontSize.xs, color: Colors.muted },
  diffRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  diffBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  diffActive: { backgroundColor: `${Colors.green}20`, borderColor: Colors.green },
  diffText: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: '600' },
  diffTextActive: { color: Colors.green },
  btn: { marginTop: Spacing.md },
});
