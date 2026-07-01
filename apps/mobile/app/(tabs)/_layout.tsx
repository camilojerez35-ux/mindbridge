import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
      },
    }}>
      <Tabs.Screen name="home" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
      }} />
      <Tabs.Screen name="chat" options={{
        title: 'Chat IA',
        tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
      }} />
      <Tabs.Screen name="diario" options={{
        title: 'Diario',
        tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
      }} />
      <Tabs.Screen name="psicologos" options={{
        title: 'Psicólogos',
        tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
