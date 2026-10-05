import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { purposeCopy } from '../../../lib/purposeCheckCopy';
import { Text, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { theme } from '../../../theme';

export default function TabsLayout() {
  const { tokens } = useVisualEnvironment();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabel: ({ color, children }) => <Text numberOfLines={2} style={{ color, fontFamily: theme.fonts.body, fontSize: 10, textAlign: 'center' }}>{children}</Text>,
        tabBarActiveTintColor: tokens.tabBarActive,
        tabBarInactiveTintColor: tokens.tabBarInactive,
        tabBarStyle: {
          backgroundColor: tokens.tabBarBackground,
          borderTopColor: tokens.tabBarBorder,
          borderTopWidth: 1,
          height: 64 + Math.max(0, fontScale - 1) * 24 + Math.max(insets.bottom, 8),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.body,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="clarity-check"
        options={{
          title: 'Clarity Check',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'navigate-circle' : 'navigate-circle-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen name="purpose" options={{ title: purposeCopy.tab, tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'leaf' : 'leaf-outline'} color={color} size={size}/> }}/>

      <Tabs.Screen
        name="mentor"
        options={{
          title: 'Compass',
          tabBarActiveTintColor: tokens.accentStrong,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
