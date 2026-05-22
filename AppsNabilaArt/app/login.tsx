import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.replace('/(tabs)/profile');
    } else {
      setError(result.error || 'Login gagal.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Ilustrasi */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="flower" size={56} color={Colors.pink.dark} />
          </View>
          <Text style={styles.appName}>Nabila Art</Text>
          <Text style={styles.tagline}>Bunga premium untuk momen spesialmu 🌸</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Selamat Datang!</Text>
          <Text style={styles.formSubtitle}>Masuk untuk melanjutkan belanja</Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#ccc" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="contoh@email.com"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#ccc" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tombol Login */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.loginButtonText}>Masuk</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Link ke Register */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color={Colors.pink.dark} />
            <Text style={styles.registerButtonText}>Daftar Akun Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Skip / Browse as guest */}
        <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.guestText}>Lanjut tanpa login →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pink.secondary },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.pink.primary,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: { fontSize: 30, fontWeight: '900', color: Colors.pink.dark, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#999', marginTop: 6, textAlign: 'center' },

  // Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  formSubtitle: { fontSize: 14, color: '#999', marginBottom: 20 },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  errorText: { color: '#dc2626', fontSize: 13, flex: 1 },

  // Input
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', height: '100%' },
  eyeButton: { padding: 4 },

  // Login button
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink.primary,
    borderRadius: 16,
    height: 54,
    marginTop: 8,
    gap: 8,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.65 },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  dividerText: { marginHorizontal: 12, color: '#ccc', fontSize: 13 },

  // Register button
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 54,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.pink.primary,
    backgroundColor: Colors.pink.soft,
  },
  registerButtonText: { color: Colors.pink.dark, fontSize: 16, fontWeight: '700' },

  // Guest
  guestButton: { alignItems: 'center', padding: 10 },
  guestText: { color: '#aaa', fontSize: 14 },
});
