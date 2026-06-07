import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logoutThunk } from '../../store/authSlice';
import { RootState, AppDispatch } from '../../store';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';

export default function ProfilScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);

  const handleLogout = () => {
    Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: async () => {
        await dispatch(logoutThunk());
        router.replace('/(auth)/login');
      }},
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notLoggedText}>Nie jesteś zalogowany</Text>
          <Button title="Zaloguj się" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {!user.isEmailVerified && (
            <View style={styles.unverifiedBadge}>
              <Ionicons name="warning-outline" size={13} color={Colors.orange} />
              <Text style={styles.unverifiedText}>Email niezweryfikowany</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konto</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rola</Text>
            <Text style={styles.infoValue}>{user.role ?? 'user'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dołączył/a</Text>
            <Text style={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString('pl-PL')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Klucz AI</Text>
            {user.hasApiKey ? (
              <View style={styles.apiKeyRow}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
                <Text style={[styles.infoValue, { color: Colors.green }]}>Ustawiony</Text>
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: Colors.muted }]}>—</Text>
            )}
          </View>
        </View>

        <Button title="Wyloguj się" onPress={handleLogout} variant="danger" style={{ marginTop: Spacing.lg }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  notLoggedText: { color: Colors.muted, fontSize: FontSize.lg },
  profileCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.bg },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: Colors.muted },
  unverifiedBadge: { marginTop: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${Colors.orange}18`, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: `${Colors.orange}44` },
  unverifiedText: { fontSize: FontSize.xs, color: Colors.orange, fontWeight: '600' },
  apiKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderColor: Colors.border },
  infoLabel: { fontSize: FontSize.sm, color: Colors.muted },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
});
