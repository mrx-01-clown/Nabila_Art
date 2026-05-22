import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openWhatsAppChat } from '@/services/whatsapp';

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([
    {
      question: 'Bagaimana cara melacak pesanan saya?',
      answer: 'Anda dapat melacak pesanan Anda melalui menu "Notifikasi" atau menghubungi admin kami via WhatsApp dengan menyertakan ID Pesanan Anda.'
    },
    {
      question: 'Apakah bisa pesan bunga custom?',
      answer: 'Tentu saja! Nabila Art melayani pembuatan buket atau papan bunga custom. Silakan hubungi kami via WhatsApp untuk diskusi lebih lanjut mengenai desain dan harga.'
    },
    {
      question: 'Metode pembayaran apa saja yang diterima?',
      answer: 'Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BNI, BRI) serta e-Wallet (OVO, GoPay, Dana, ShopeePay).'
    },
    {
      question: 'Berapa lama proses pengiriman?',
      answer: 'Untuk buket ready stock bisa dikirim di hari yang sama (Same Day). Untuk pesanan custom atau papan bunga, proses pembuatan memakan waktu 1-2 hari kerja.'
    },
    {
      question: 'Apakah pesanan bisa dibatalkan?',
      answer: 'Pesanan hanya dapat dibatalkan jika belum masuk proses produksi (maksimal 1 jam setelah pembayaran). Untuk informasi lebih lanjut, hubungi layanan pelanggan kami.'
    }
  ]);

  React.useEffect(() => {
    // Attempt to fetch FAQs from Backend
    // Using 10.0.2.2 for Android emulator to access localhost
    const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/faqs' : 'http://localhost:3000/api/faqs';
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setFaqs(data);
        }
      })
      .catch(err => {
        console.log("Backend not running or unreachable, using default static FAQs:", err.message);
      });
  }, []);

  const helpTopics = [
    { id: 1, title: 'Akun & Profil', icon: 'person-outline' },
    { id: 2, title: 'Pembayaran', icon: 'card-outline' },
    { id: 3, title: 'Pengiriman', icon: 'cube-outline' },
    { id: 4, title: 'Pengembalian', icon: 'return-up-back-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <View style={{ width: 26 }} /> {/* Spacer */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hai, ada yang bisa kami bantu?</Text>
          <View style={styles.searchFake}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <Text style={styles.searchFakeText}>Cari solusi kendalamu...</Text>
          </View>
        </View>

        {/* Topik Bantuan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topik Populer</Text>
          <View style={styles.topicGrid}>
            {helpTopics.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.topicCard}>
                <View style={styles.topicIcon}>
                  <Ionicons name={topic.icon as any} size={28} color={Colors.pink.dark} />
                </View>
                <Text style={styles.topicText}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pertanyaan Umum (FAQ)</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionActive]}>
                      {faq.question}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
                      size={20} 
                      color={isExpanded ? Colors.pink.primary : "#999"} 
                    />
                  </View>
                  {isExpanded && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Masih butuh bantuan?</Text>
          <Text style={styles.contactSubtitle}>Tim Nabila Art siap membantu Anda menyelesaikan masalah</Text>
          
          <TouchableOpacity style={styles.contactButton} onPress={openWhatsAppChat}>
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Chat Admin via WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: Colors.pink.primary,
    padding: 25,
    paddingBottom: 35,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  searchFake: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchFakeText: {
    marginLeft: 10,
    color: '#999',
    fontSize: 15,
  },
  section: {
    padding: 20,
    marginTop: -15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 15,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  faqList: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  faqItemExpanded: {
    backgroundColor: '#FFFAFB',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    flex: 1,
    paddingRight: 15,
    lineHeight: 22,
  },
  faqQuestionActive: {
    color: Colors.pink.primary,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  contactSection: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366', // WhatsApp Green
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  }
});
