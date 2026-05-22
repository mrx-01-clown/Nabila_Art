import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ProductCard } from '@/components/menu/ProductCard';
import { CategoryItem } from '@/components/menu/CategoryItem';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { Toast } from '@/components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface Product {
  id: string;
  title: string;
  weight: string;
  price: number;
  tags: string[];
  imageUrl: string;
  category: string;
}

// Mapping kategori FakeStoreAPI ke label Indonesia
const CATEGORY_MAP: Record<string, string> = {
  "electronics": "Electronics",
  "jewelery": "Perhiasan",
  "men's clothing": "Pria",
  "women's clothing": "Wanita",
};

const ALL_FILTERS = ['Semua', 'Electronics', 'Perhiasan', 'Pria', 'Wanita'];

export default function CatalogScreen() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState('Semua');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = async () => {
    try {
      setError(null);
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Gagal memuat katalog produk');
      const data = await response.json();

      const formatted: Product[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        weight: CATEGORY_MAP[item.category] ?? item.category,
        price: Math.round(item.price * 15000),
        tags: [CATEGORY_MAP[item.category] ?? item.category],
        imageUrl: item.image,
        category: CATEGORY_MAP[item.category] ?? item.category,
      }));

      setAllProducts(formatted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAllProducts();
  }, []);

  // Filter produk berdasarkan kategori aktif
  const filteredProducts = activeFilter === 'Semua'
    ? allProducts
    : allProducts.filter(p => p.category === activeFilter);

  const onAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
    });
    setToastMessage(`${product.title.substring(0, 25)}... ditambahkan!`);
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
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push({ pathname: '/explore', params: { from: 'catalog' } })}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>Cari produk...</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={24} color="#464646ff" />
            {totalItems > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Kategori */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {ALL_FILTERS.map((item, index) => (
            <CategoryItem
              key={`filter-${index}`}
              label={item}
              isActive={activeFilter === item}
              onPress={() => setActiveFilter(item)}
            />
          ))}
        </ScrollView>
        {!isLoading && (
          <Text style={styles.resultCount}>
            {filteredProducts.length} produk ditemukan
          </Text>
        )}
      </View>

      {/* Konten */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.pink.primary} />
          <Text style={styles.loadingText}>Memuat katalog...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="wifi-outline" size={60} color="#ddd" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setIsLoading(true); fetchAllProducts(); }}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={60} color="#ddd" />
          <Text style={styles.emptyTitle}>Produk Tidak Ditemukan</Text>
          <Text style={styles.emptySubtitle}>Coba pilih kategori lain</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.pink.primary]}
              tintColor={Colors.pink.primary}
            />
          }
        >
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  title={product.title}
                  weight={product.weight}
                  price={product.price}
                  tags={product.tags}
                  imageUrl={product.imageUrl}
                  onPress={() => {}}
                  onAddPress={() => onAddToCart(product)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.pink.secondary,
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
    backgroundColor: Colors.pink.primary,
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
  filterContainer: {
    backgroundColor: Colors.pink.secondary,
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 8,
  },
  resultCount: {
    paddingHorizontal: 20,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#e24b4a',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: Colors.pink.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 15,
  },
});
