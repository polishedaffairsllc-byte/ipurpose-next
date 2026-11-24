import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PlatformPressable } from '@react-navigation/elements';
import { Tabs, usePathname } from 'expo-router';
import { Image, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackSupportScreenView } from '../../../lib/analyticsEvents';
import { purposeCopy } from '../../../lib/purposeCheckCopy';
import { theme } from '../../../theme';

const primaryTabs = [
  { name: 'index', path: '/', title: 'Home', icon: 'home-outline', selectedIcon: 'home' },
  { name: 'clarity-check', path: '/clarity-check', title: 'Clarity Check', materialIcon: 'waves' },
  { name: 'purpose', path: '/purpose', title: purposeCopy.tab, icon: 'leaf-outline', selectedIcon: 'leaf' },
  { name: 'mentor', path: '/mentor', title: 'Compass', logo: true },
  { name: 'account', path: '/account', title: 'Account', icon: 'person-outline', selectedIcon: 'person' },
] as const;

// Detail routes keep the tile for their parent selected and remain separately
// addressable by the existing app links.
const detailTabs: Record<string, typeof primaryTabs[number]['name']> = {
  '/anchor': 'index',
  '/focus': 'index',
  '/onboarding': 'clarity-check',
  '/purpose-path': 'purpose',
  '/timezone': 'account',
};
const borderColor = 'rgba(235, 232, 248, 0.26)';
const inactiveColor = '#E3E0EE';

export default function TabsLayout() {
  const detailTab = detailTabs[usePathname()];
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottom = Math.max(insets.bottom, 8);

  return (
    <Tabs backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: theme.colors.salmonPeach,
        tabBarInactiveTintColor: inactiveColor,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, {
          height: 80 + Math.max(0, fontScale - 1) * 24 + bottom,
          paddingBottom: bottom,
        }],
      }}
    >
      {primaryTabs.map(tab => {
        const isDetailParent = detailTab === tab.name;
        return (
          <Tabs.Screen key={tab.name} name={tab.name}
            listeners={{ focus: () => trackSupportScreenView(tab.path) }}
            options={{
              title: tab.title,
              tabBarAccessibilityLabel: tab.title,
              tabBarLabel: ({ color, children }) => (
                <Text numberOfLines={2} style={[styles.label, { color: isDetailParent ? theme.colors.salmonPeach : color }]}>
                  {children}
                </Text>
              ),
              tabBarButton: isDetailParent ? props => (
                <PlatformPressable {...props} aria-selected accessibilityState={{ ...props.accessibilityState, selected: true }} />
              ) : undefined,
              tabBarIcon: ({ color, size, focused }) => 'logo' in tab ? (
                <Image accessible={false} source={require('../../../../assets/brand/compass-tab-silhouette.png')}
                  resizeMode="contain" style={{ width: size, height: size, tintColor: color }} />
              ) : 'materialIcon' in tab ? (
                <MaterialCommunityIcons name={tab.materialIcon} size={size} color={isDetailParent ? theme.colors.salmonPeach : color} />
              ) : (
                <Ionicons name={focused || isDetailParent ? tab.selectedIcon : tab.icon} size={size}
                  color={isDetailParent ? theme.colors.salmonPeach : color} />
              ),
            }}
          />
        );
      })}
      <Tabs.Screen name="anchor" options={{ href: null }} />
      <Tabs.Screen name="focus" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="purpose-path" options={{ href: null }} />
      <Tabs.Screen name="timezone" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#171B30',
    borderTopColor: borderColor,
    borderTopWidth: 1,
    paddingTop: 7,
    paddingHorizontal: 3,
  },
  item: {
    borderColor,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#1E2238',
    marginHorizontal: 3,
    paddingVertical: 4,
  },
  label: { fontFamily: theme.fonts.body, fontSize: 11, textAlign: 'center' },
});
