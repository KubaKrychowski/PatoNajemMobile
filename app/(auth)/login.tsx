import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../../store/authSlice';
import { RootState, AppDispatch } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize } from '../../constants/theme';

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!email.includes('@')) errors.email = 'Podaj poprawny adres email';
    if (password.length < 6) errors.password = 'Hasło jest za krótkie';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    dispatch(clearError());
    if (!validate()) return;
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      router.replace('/(tabs)/oferty');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Pato<Text style={styles.logoGreen}>Najem</Text></Text>
          <Text style={styles.tagline}>Wynajmij mądrzej</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Zaloguj się</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="jan@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={fieldErrors.email}
          />
          <Input
            label="Hasło"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={fieldErrors.password}
          />

          <Button title="Zaloguj się" onPress={handleLogin} loading={isLoading} style={styles.btn} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nie masz konta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.link}>Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center', backgroundColor: Colors.bg },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { fontSize: 40, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  logoGreen: { color: Colors.green },
  tagline: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 4 },
  form: { backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  heading: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  errorBanner: { backgroundColor: 'rgba(255,71,87,0.1)', borderRadius: 10, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,71,87,0.3)' },
  errorText: { color: Colors.error, fontSize: FontSize.sm },
  btn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: Colors.muted, fontSize: FontSize.sm },
  link: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
});
