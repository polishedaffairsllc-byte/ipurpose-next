import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

/** Tab scenes delegate the bottom inset to the tab bar; stack screens own all edges. */
export function ScreenSafeArea({
  hasTabBar = false,
  dark = false,
  ...props
}: SafeAreaViewProps & { hasTabBar?: boolean; dark?: boolean }) {
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(dark ? 'light' : 'dark');
  }, [dark]));

  return (
    <SafeAreaView
      edges={hasTabBar ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      {...props}
    />
  );
}
