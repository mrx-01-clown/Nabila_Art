import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  const { totalItems } = useCart();

  return (
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e94e4e',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Katalog',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "grid" : "grid-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "chatbubble" : "chatbubble-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifikasi',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "notifications" : "notifications-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "person" : "person-outline"} color={color} />,
        }}
      />
      
      {/* Sembunyikan halaman tambahan dari navigator bar */}
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="Aboutus"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
