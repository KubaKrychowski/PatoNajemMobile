import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize } from '../../constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Imię musi mieć min. 2 znaki';
    if (!email.includes('@')) e.email = 'Podaj poprawny email';
    if (password.length < 8) e.password = 'Min. 8 znaków';
    if (!/[a-z]/.test(password)) e.password = 'Wymagana mała litera';
    if (!/[A-Z]/.test(password)) e.password = 'Wymagana duża litera';
    if (!/[0-9]/.test(password)) e.password = 'Wymagana cyfra';
    if (password !== confirm) e.confirm = 'Hasła nie są zgodne';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register(email, password, name);
      Alert.alert(
        'Konto utworzone',
        'Możesz się teraz zalogować.\n\n[DEV] Weryfikacja emaila wyłączona — konto aktywowane automatycznie.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Błąd rejestracji';
      Alert.alert('Błąd', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Pato<Text style={styles.logoGreen}>Najem</Text></Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Utwórz konto</Text>

          <Input label="Imię" placeholder="Jan Kowalski" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} />
          <Input label="Email" placeholder="jan@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
          <Input label="Hasło" placeholder="Min. 8 znaków" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
          <Input label="Potwierdź hasło" placeholder="••••••••" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} />

          <Text style={styles.hint}>Hasło musi zawierać: min. 8 znaków, wielką i małą literę, cyfrę.</Text>

          <Button title="Zarejestruj się" onPress={handleRegister} loading={loading} style={styles.btn} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center', backgroundColor: Colors.bg },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 36, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  logoGreen: { color: Colors.green },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  hint: { fontSize: FontSize.xs, color: Colors.muted, marginBottom: Spacing.md, lineHeight: 18 },
  btn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: Colors.muted, fontSize: FontSize.sm },
  link: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
});
