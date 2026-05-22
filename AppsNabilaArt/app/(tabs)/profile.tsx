import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// ==================== Komponen Avatar Inisial ====================
function AvatarInitial({ name, size = 90 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatarCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

// ==================== Menu Item Row ====================
function MenuItem({
  icon,
  label,
  value,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, color ? { backgroundColor: `${color}20` } : null]}>
        <Ionicons name={icon as any} size={20} color={color ?? Colors.pink.dark} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, color ? { color } : null]}>{label}</Text>
        {value ? <Text style={styles.menuValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );
}

// ==================== Main Profile Screen ====================
export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateProfile, isLoading } = useAuth();

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editError, setEditError] = useState('');

  // Jika belum login → tampilkan UI guest
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Akun</Text>
        </View>

        <ScrollView contentContainerStyle={styles.guestContent}>
          <View style={styles.guestIllustration}>
            <Ionicons name="person-circle-outline" size={90} color={Colors.pink.primary} />
          </View>
          <Text style={styles.guestTitle}>Belum Masuk</Text>
          <Text style={styles.guestSubtitle}>
            Masuk untuk melihat profil, riwayat pesanan, dan menyimpan alamat pengiriman.
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginBtnText}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/register' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={20} color={Colors.pink.dark} />
            <Text style={styles.registerBtnText}>Daftar Akun Baru</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <MenuItem
            icon="help-circle-outline"
            label="Pusat Bantuan"
            onPress={() => router.push('/help')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Tentang Kami"
            onPress={() => router.push('/(tabs)/Aboutus' as any)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Handler Edit Profil ----
  const openEdit = () => {
    setEditName(user?.name ?? '');
    setEditPhone(user?.phone ?? '');
    setEditAddress(user?.address ?? '');
    setEditError('');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    setEditError('');
    if (!editName.trim()) {
      setEditError('Nama tidak boleh kosong.');
      return;
    }
    const result = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim() || null,
      address: editAddress.trim() || null,
    } as any);

    if (result.success) {
      setEditVisible(false);
      Alert.alert('Berhasil! 🌸', 'Profil Anda telah diperbarui.');
    } else {
      setEditError(result.error ?? 'Gagal memperbarui profil.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  // Hitung tanggal bergabung
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akun</Text>
        <TouchableOpacity onPress={openEdit} style={styles.editHeaderBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.pink.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <AvatarInitial name={user?.name ?? 'U'} size={90} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="flower-outline" size={12} color={Colors.pink.dark} />
              <Text style={styles.memberText}>Member sejak {joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={Colors.pink.dark} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nomor HP</Text>
                <Text style={styles.infoValue}>{user?.phone || '— Belum diisi'}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Ionicons name="location-outline" size={18} color={Colors.pink.dark} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {user?.address || '— Belum diisi'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <MenuItem
            icon="create-outline"
            label="Edit Profil"
            onPress={openEdit}
          />
          <MenuItem
            icon="time-outline"
            label="Riwayat Pesanan"
            value="Segera hadir"
            onPress={() => Alert.alert('Info', 'Fitur riwayat pesanan segera hadir!')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Tentang Kami"
            onPress={() => router.push('/(tabs)/Aboutus' as any)}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Pusat Bantuan"
            onPress={() => router.push('/help')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ==================== Modal Edit Profil ==================== */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#ddd" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {editError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={styles.errorText}>{editError}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Nama Lengkap *</Text>
              <View style={styles.fieldInput}>
                <Ionicons name="person-outline" size={18} color="#ccc" />
                <TextInput
                  style={styles.fieldTextInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#ccc"
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.fieldLabel}>Nomor HP / WhatsApp</Text>
              <View style={styles.fieldInput}>
                <Ionicons name="call-outline" size={18} color="#ccc" />
                <TextInput
                  style={styles.fieldTextInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="08xxxxxxxxxx"
                  placeholderTextColor="#ccc"
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.fieldLabel}>Alamat Pengiriman</Text>
              <View style={[styles.fieldInput, styles.fieldTextArea]}>
                <Ionicons name="location-outline" size={18} color="#ccc" style={{ marginTop: 4 }} />
                <TextInput
                  style={[styles.fieldTextInput, { height: 90 }]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Alamat lengkap..."
                  placeholderTextColor="#ccc"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAFC',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  editHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- Profile Hero ----
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarCircle: {
    backgroundColor: Colors.pink.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: { color: '#fff', fontWeight: '900' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: '#111' },
  userEmail: { fontSize: 13, color: '#888', marginTop: 3 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: Colors.pink.soft,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  memberText: { fontSize: 11, color: Colors.pink.dark, fontWeight: '600' },

  // ---- Info Section ----
  infoSection: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 12 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#bbb', fontWeight: '600', marginBottom: 3 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },

  // ---- Menu Section ----
  menuSection: { padding: 20, paddingBottom: 0 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  menuValue: { fontSize: 12, color: '#bbb', marginTop: 2 },

  // ---- Logout ----
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FED7D7',
  },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },

  // ---- Guest State ----
  guestContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  guestIllustration: {
    alignSelf: 'center',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: { fontSize: 24, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 10 },
  guestSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink.primary,
    borderRadius: 16,
    height: 54,
    marginBottom: 12,
    gap: 8,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 54,
    marginBottom: 28,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.pink.primary,
    backgroundColor: Colors.pink.soft,
  },
  registerBtnText: { color: Colors.pink.dark, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },

  // ---- Modal Edit ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  errorText: { color: '#dc2626', fontSize: 13, flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 12 },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  fieldTextArea: { height: 'auto', paddingVertical: 12, alignItems: 'flex-start' },
  fieldTextInput: { flex: 1, fontSize: 15, color: '#333' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink.primary,
    borderRadius: 16,
    height: 54,
    marginTop: 20,
    gap: 8,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
