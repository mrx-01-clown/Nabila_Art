import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

type NotificationType = 'order' | 'promo' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Pesanan Dikonfirmasi',
    message: 'Pesanan #INV-384920 Anda telah dikonfirmasi dan sedang diproses oleh tim kami.',
    time: '2 menit lalu',
    isRead: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Promo Spesial Hari Ibu! 🌸',
    message: 'Dapatkan diskon 20% untuk semua jenis buket di tanggal 22 Desember. Gunakan kode: IBU20',
    time: '1 jam lalu',
    isRead: false,
  },
  {
    id: '3',
    type: 'order',
    title: 'Pesanan Sedang Dikirim',
    message: 'Buket Mawar Pink Anda sedang dalam perjalanan. Estimasi tiba 30-60 menit.',
    time: '3 jam lalu',
    isRead: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Koleksi Baru Telah Tiba!',
    message: 'Kami menghadirkan koleksi bunga impor terbaru. Tulip dan Lily dari Belanda kini tersedia!',
    time: 'Kemarin',
    isRead: true,
  },
  {
    id: '5',
    type: 'promo',
    title: 'Gratis Ongkir Hari Ini',
    message: 'Nikmati gratis ongkos kirim untuk pembelian di atas Rp 100.000 hari ini saja!',
    time: '2 hari lalu',
    isRead: true,
  },
  {
    id: '6',
    type: 'order',
    title: 'Pesanan Selesai ✅',
    message: 'Pesanan #INV-283741 telah diterima. Jangan lupa berikan ulasan Anda!',
    time: '3 hari lalu',
    isRead: true,
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  order: {
    icon: 'cube-outline',
    bg: '#EEF2FF',
    color: '#4F46E5',
  },
  promo: {
    icon: 'pricetag-outline',
    bg: '#FFF0F5',
    color: Colors.pink.primary,
  },
  info: {
    icon: 'information-circle-outline',
    bg: '#F0FDF4',
    color: '#16A34A',
  },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadSubtitle}>{unreadCount} belum dibaca</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
            <Ionicons name="checkmark-done-outline" size={16} color={Colors.pink.primary} />
            <Text style={styles.markAllText}>Tandai Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {unreadCount > 0 && (
          <>
            <Text style={styles.sectionLabel}>BARU</Text>
            {notifications
              .filter((n) => !n.isRead)
              .map((item) => (
                <NotificationItem key={item.id} item={item} onPress={() => markRead(item.id)} />
              ))}
          </>
        )}

        <Text style={styles.sectionLabel}>SEBELUMNYA</Text>
        {notifications.filter((n) => n.isRead).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={Colors.pink.primary} />
            <Text style={styles.emptyText}>Semua sudah dibaca</Text>
          </View>
        ) : (
          notifications
            .filter((n) => n.isRead)
            .map((item) => (
              <NotificationItem key={item.id} item={item} onPress={() => {}} />
            ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const config = TYPE_CONFIG[item.type];

  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {!item.isRead && <View style={styles.unreadDot} />}
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={24} color={config.color} />
      </View>
      <View style={styles.notifBody}>
        <View style={styles.notifTopRow}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
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
  unreadSubtitle: { fontSize: 13, color: Colors.pink.primary, fontWeight: '600', marginTop: 2 },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.pink.soft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  markAllText: { color: Colors.pink.primary, fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 15 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
    overflow: 'hidden',
  },
  notifCardUnread: {
    borderColor: Colors.pink.soft,
    backgroundColor: '#FFFAFB',
  },
  unreadDot: {
    position: 'absolute',
    top: 18,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink.primary,
  },
  notifIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#222', flex: 1 },
  notifTime: { fontSize: 11, color: '#aaa', marginLeft: 8 },
  notifMessage: { fontSize: 13, color: '#666', lineHeight: 19 },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 14 },
});
