import { Linking, Alert } from 'react-native';

/**
 * Membuka WhatsApp dengan template pesan konfirmasi pesanan
 * @param orderId ID unik pesanan
 * @param total Total harga yang sudah diformat atau angka
 */
export const sendOrderConfirmation = (orderId: string, total: string | number) => {
  const phoneNumber = "6281326583373"; // Ganti dengan nomor WhatsApp Owner (format 62...)
  const message = `Halo Admin, saya ingin konfirmasi pesanan.\n\n*ID Pesanan:* *${orderId}*\n*Total:* ${total}\n\nMohon segera diproses ya!`;

  const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "WhatsApp tidak terinstall di perangkat ini.");
    }
  }).catch(err => {
    console.error("An error occurred", err);
    Alert.alert("Error", "Gagal membuka WhatsApp.");
  });
};

/**
 * Membuka WhatsApp untuk layanan pelanggan umum
 */
export const openWhatsAppChat = () => {
  const phoneNumber = "6281326583373";
  const message = `Halo Nabila Art, saya butuh bantuan jajan wkwk.`;

  const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "WhatsApp tidak terinstall di perangkat ini.");
    }
  }).catch(err => {
    console.error("An error occurred", err);
    Alert.alert("Error", "Gagal membuka WhatsApp.");
  });
};
