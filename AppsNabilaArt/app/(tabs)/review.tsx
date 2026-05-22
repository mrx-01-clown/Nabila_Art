import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Siti Aminah',
    rating: 5,
    comment: 'Bunganya sangat segar dan pengirimannya cepat sekali! Packing juga rapi banget, terima kasih Nabila Art 🌸',
    date: '2 Mei 2025',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    rating: 4,
    comment: 'Desain buketnya unik dan modern, istri saya sangat suka. Akan pesan lagi untuk anniversary.',
    date: '28 Apr 2025',
  },
  {
    id: '3',
    name: 'Dewi Lestari',
    rating: 5,
    comment: 'Pelayanan sangat ramah dan kualitas premium! Sesuai ekspektasi bahkan lebih bagus dari foto.',
    date: '20 Apr 2025',
  },
  {
    id: '4',
    name: 'Rina Kusuma',
    rating: 5,
    comment: 'Papan bunganya luar biasa indah, cocok banget untuk wisuda teman saya. Recommended!',
    date: '15 Apr 2025',
  },
];

export default function ReviewScreen() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = (totalRating / reviews.length).toFixed(1);

  // Hitung distribusi rating
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmitReview = () => {
    if (!newName.trim() || !newComment.trim()) {
      Alert.alert('Peringatan', 'Mohon isi nama dan ulasan Anda.');
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newReview: Review = {
      id: Date.now().toString(),
      name: newName.trim(),
      rating: selectedRating,
      comment: newComment.trim(),
      date: dateStr,
    };

    setReviews([newReview, ...reviews]);
    setNewName('');
    setNewComment('');
    setSelectedRating(5);
    setShowForm(false);
    Alert.alert('Terima Kasih! 🌸', 'Ulasan Anda telah berhasil dikirim.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Pelanggan</Text>
        <TouchableOpacity
          style={styles.addReviewBtn}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
          <Text style={styles.addReviewText}>{showForm ? 'Tutup' : 'Tulis'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.ratingBig}>{avgRating}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= Math.round(parseFloat(avgRating)) ? 'star' : 'star-outline'}
                    size={18}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.totalReviews}>
                Dari {reviews.length} ulasan
              </Text>
            </View>

            <View style={styles.summaryRight}>
              {ratingDistribution.map(({ star, count }) => (
                <View key={star} style={styles.ratingRow}>
                  <Text style={styles.ratingRowLabel}>{star}</Text>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingRowCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Form Tulis Review */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Tulis Ulasan Anda</Text>

              <Text style={styles.formLabel}>Pilih Rating</Text>
              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSelectedRating(s)}>
                    <Ionicons
                      name={s <= selectedRating ? 'star' : 'star-outline'}
                      size={36}
                      color="#FFD700"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Nama Anda</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama Anda"
                value={newName}
                onChangeText={setNewName}
                placeholderTextColor="#bbb"
              />

              <Text style={styles.formLabel}>Ulasan</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ceritakan pengalaman Anda dengan Nabila Art..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#bbb"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Daftar Review */}
          <Text style={styles.sectionTitle}>Semua Ulasan</Text>
          {reviews.map((item) => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>{item.name}</Text>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <View style={styles.reviewerStars}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={13} color="#FFD700" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pink.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addReviewText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scrollContent: { padding: 20 },

  // Summary
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 20,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  ratingBig: { fontSize: 44, fontWeight: '900', color: Colors.pink.dark },
  stars: { flexDirection: 'row', marginVertical: 6 },
  totalReviews: { color: '#999', fontSize: 12, textAlign: 'center' },
  summaryRight: { flex: 1, justifyContent: 'center', gap: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingRowLabel: { fontSize: 12, color: '#666', width: 10, textAlign: 'right' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#FFD700', borderRadius: 3 },
  ratingRowCount: { fontSize: 12, color: '#999', width: 18, textAlign: 'right' },

  // Form
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.pink.soft,
    shadowColor: Colors.pink.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 15 },
  formLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 8, marginTop: 10 },
  starSelector: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  input: {
    backgroundColor: '#FBFAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pink.primary,
    paddingVertical: 14,
    borderRadius: 15,
    marginTop: 18,
    gap: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Reviews list
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 15 },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pink.soft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.pink.dark },
  reviewerName: { fontSize: 15, fontWeight: '700', color: '#333' },
  reviewDate: { fontSize: 12, color: '#999', marginTop: 2 },
  reviewerStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 21 },
});
