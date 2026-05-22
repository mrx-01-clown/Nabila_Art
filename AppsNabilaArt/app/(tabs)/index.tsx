import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  // SafeAreaView,
  ImageBackground,
  Platform,
  // StatusBar as RNStatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CategoryItem } from '@/components/menu/CategoryItem';
import { ProductCard } from '@/components/menu/ProductCard';
import { Link, useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { Toast } from '@/components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {

  //Memanggil Inset
  const insets = useSafeAreaInsets();
  const categories = ['Semua', 'Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing"];

  // State untuk menyimpan data dari API
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  // Fungsi untuk mengambil data dari FakeStoreAPI
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Mengambil 5 produk pertama sebagai "Produk Unggulan"
      const response = await fetch('https://fakestoreapi.com/products?limit=5');

      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }

      const data = await response.json();

      // Memformat data dari API agar sesuai dengan kebutuhan ProductCard Anda
      const formattedData = data.map(item => ({
        id: item.id.toString(),
        title: item.title,
        weight: item.category, // Memanfaatkan field weight untuk kategori
        price: item.price * 15000, // Konversi kasar USD ke IDR untuk tampilan
        tags: ['FakeStore'], // Tag default
        image: item.image // Simpan URL gambar
      }));

      setFeaturedProducts(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gunakan useEffect untuk memanggil fetchProducts saat komponen di-mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    router.push({ pathname: '/explore', params: { from: 'index' } });
  };

  const handleCart = () => {
    router.push('/cart');
  };

  const handleCatalog = () => {
    router.push('/catalog');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const onAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1
    });
    setToastMessage(`${product.title} ditambahkan ke keranjang!`);
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearch} activeOpacity={0.9}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>Cari seni bunga pilihan...</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCart}>
            <Ionicons name="bag-handle-outline" size={24} color="#464646ff" />
            {totalItems > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Banner Section */}
        <ImageBackground
          source={require('@/assets/images/flower_bg.png')}
          style={styles.banner}
          imageStyle={styles.bannerImageStyle}
        >
          {/* ... Konten Banner tidak diubah ... */}
          <View style={styles.bannerOverlay}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Koleksi Terbaru</Text>
            </View>
            <Text style={styles.bannerTitle}>Temukan Seni Bunga Pilihan</Text>
            <Text style={styles.bannerSubtitle}>
              Kualitas premium, desain artistik, pengiriman aman ke seluruh wilayah.
            </Text>
            <View style={styles.bannerButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCatalog}>
                <Text style={styles.primaryButtonText}>Belanja</Text>
              </TouchableOpacity>
              <Link href="(tabs)/Aboutus" asChild>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Tentang</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.bannerDecorativeIcons}>
            <View style={styles.decIcon}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#fff" />
            </View>
            <View style={[styles.decIcon, { marginTop: 15 }]}>
              <Ionicons name="heart-outline" size={32} color="#fff" />
            </View>
          </View>
        </ImageBackground>

        {/* Kategori Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <Text style={styles.sectionSubtitle}>Pilih kategori favoritmu</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {categories.map((cat, index) => (
              <CategoryItem key={cat} label={cat} isActive={index === 0} />
            ))}
          </ScrollView>
        </View>

        {/* Produk Unggulan Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produk Unggulan</Text>
              <Text style={styles.sectionSubtitle}>Dari FakeStoreAPI</Text>
            </View>
            <TouchableOpacity onPress={handleCatalog}>
              <Text style={styles.seeAllLink}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {/* Menangani State Loading dan Error */}
          {isLoading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="large" color={Colors.pink.primary} />
              <Text style={styles.statusText}>Memuat produk...</Text>
            </View>
          ) : error ? (
            <View style={styles.statusContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  weight={product.weight}
                  price={product.price}
                  tags={product.tags}
                  imageUrl={product.image} // Meneruskan URL gambar ke ProductCard (pastikan komponen ProductCard Anda mendukung ini)
                  onPress={() => router.push('/catalog')}
                  onAddPress={() => onAddToCart(product)}
                />
              ))}
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Styles sebelumnya tidak diubah ...
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.pink.secondary,
    maxHeight: 150, // 150% dari tinggi layar
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 14,
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef6f6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e94e4e',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  banner: {
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.pink.primary,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerImageStyle: {
    opacity: 0.15,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    flex: 1,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 32,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  bannerButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: Colors.pink.dark,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  bannerDecorativeIcons: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  decIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.dark.icon,
    padding: 25,
    justifyContent: 'space-between',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  seeAllLink: {
    color: Colors.pink.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  categoryList: {
    marginBottom: 20,
  },
  productList: {
    paddingBottom: 10,
  },

  // Style Tambahan untuk State Loading/Error
  statusContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    color: '#999',
  },
  errorText: {
    color: '#e24b4a',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: Colors.pink.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  }
});