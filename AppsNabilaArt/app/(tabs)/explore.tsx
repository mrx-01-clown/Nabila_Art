import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function SearchScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto focus input when screen mounts
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const searchHistory = [
    'Bunga Mawar Merah',
    'Buket Pernikahan',
    'Vas Keramik',
    'Bunga Kering',
    'Anggrek Bulan',
  ];

  const popularSearches = [
    'Buket Wisuda',
    'Dekorasi Meja',
    'Tulip Import',
    'Papan Bunga',
    'Tanaman Hias Indoor',
    'Mawar Putih',
    'Bunga Box',
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const executeSearch = (query: string) => {
    // In a real app, this would navigate to a results page or fetch results
    console.log('Mencari:', query || searchQuery);
    // We can navigate to catalog tab as an example
    router.push('/catalog');
  };

  const handleBack = () => {
    if (from === 'catalog') {
      router.push('/catalog');
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      
      {/* Search Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back-outline" size={26} color="#e94e4e" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Cari seni bunga pilihan..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={() => executeSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
             <TouchableOpacity style={styles.iconInside} onPress={() => setSearchQuery('')}>
               <Ionicons name="close-circle" size={18} color="#ccc" />
             </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.iconInside}>
            <Ionicons name="camera-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={() => executeSearch(searchQuery)}>
           <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Riwayat Pencarian */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Pencarian</Text>
            <TouchableOpacity>
              <Ionicons name="trash-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {searchHistory.map((item, index) => (
              <TouchableOpacity 
                key={`history-${index}`} 
                style={styles.tag}
                onPress={() => {
                  setSearchQuery(item);
                  executeSearch(item);
                }}
              >
                <Text style={styles.tagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pencarian Populer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Pencarian Populer</Text>
          <View style={styles.tagsContainer}>
            {popularSearches.map((item, index) => (
              <TouchableOpacity 
                key={`popular-${index}`} 
                style={[styles.tag, styles.popularTag]}
                onPress={() => {
                  setSearchQuery(item);
                  executeSearch(item);
                }}
              >
                <Text style={[styles.tagText, styles.popularTagText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    paddingRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e94e4e',
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333',
  },
  iconInside: {
    paddingLeft: 8,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#e94e4e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#555',
  },
  popularTag: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffdede',
    borderStyle: 'solid',
  },
  popularTagText: {
    color: '#e94e4e',
  }
});
