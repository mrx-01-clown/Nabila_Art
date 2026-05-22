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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    const result = await register(name, email, password, phone || undefined);
    if (result.success) {
      router.replace('/(tabs)/profile');
    } else {
      setError(result.error || 'Registrasi gagal.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={24} color={Colors.pink.dark} />
          </TouchableOpacity>
        </View>

        {/* Judul */}
        <View style={styles.titleBlock}>
          <Ionicons name="flower" size={44} color={Colors.pink.dark} />
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Bergabung dan temukan bunga impianmu 🌷</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#ccc" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
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

          {/* Nomor HP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor HP (WhatsApp) <Text style={styles.optional}>Opsional</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#ccc" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#ccc"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
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

          {/* Konfirmasi Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputWrapper,
              confirmPassword.length > 0 && confirmPassword !== password && styles.inputWrapperError,
              confirmPassword.length > 0 && confirmPassword === password && styles.inputWrapperSuccess,
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#ccc" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                placeholderTextColor="#ccc"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#ccc" />
              </TouchableOpacity>
              {confirmPassword.length > 0 && confirmPassword === password && (
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              )}
            </View>
          </View>

          {/* Tombol Daftar */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Link login */}
        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
          <Text style={styles.loginLinkText}>
            Sudah punya akun? <Text style={styles.loginLinkBold}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pink.secondary },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  headerRow: { marginBottom: 8 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: { alignItems: 'center', marginBottom: 24, gap: 8 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.pink.dark },
  subtitle: { fontSize: 14, color: '#999', textAlign: 'center' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },

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

  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  required: { color: Colors.pink.dark },
  optional: { fontSize: 11, color: '#bbb', fontWeight: '400' },
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
  inputWrapperError: { borderColor: '#dc2626' },
  inputWrapperSuccess: { borderColor: '#16a34a' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', height: '100%' },
  eyeButton: { padding: 4 },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink.primary,
    borderRadius: 16,
    height: 54,
    marginTop: 12,
    gap: 8,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.65 },
  registerButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  loginLink: { alignItems: 'center', padding: 10 },
  loginLinkText: { color: '#888', fontSize: 14 },
  loginLinkBold: { color: Colors.pink.dark, fontWeight: '800' },
});
