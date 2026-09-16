import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: tokens.tabBarActive,
        tabBarInactiveTintColor: tokens.tabBarInactive,
        tabBarStyle: {
          backgroundColor: tokens.tabBarBackground,
          borderTopColor: tokens.tabBarBorder,
          borderTopWidth: 1,
          height: 72 + insets.bottom + Math.max(0, fontScale - 1) * 16 + (fontScale > 1 ? 14 * fontScale : 0),
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabel: ({ children, color }) => (
          <Text style={{ color, fontFamily: theme.fonts.body, fontSize: 10, lineHeight: 14, textAlign: 'center' }}>
            {children}
          </Text>
        ),
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
