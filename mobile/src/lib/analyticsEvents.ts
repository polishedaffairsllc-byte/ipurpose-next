import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { NativeEvent } from './analyticsCore';

// Native Firebase owns first_open automatically. Never log it manually.
// Auth continues to use the existing JS SDK; no native Auth migration is needed.
const enabled = () => !__DEV__ && Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient' && Constants.expoConfig?.extra?.launchAnalyticsEnabled === true;
let ready: Promise<typeof import('@react-native-firebase/analytics')> | undefined;
function initialize() {
  ready ??= import('@react-native-firebase/analytics').then(async sdk => {
    await sdk.setAnalyticsCollectionEnabled(sdk.getAnalytics(), true);
    return sdk;
  }).catch(error => { ready = undefined; throw error; });
  return ready;
}

export function initializeLaunchAnalytics(): void {
  if (enabled()) void initialize().catch(() => {});
}

export function logLaunchEvent(name: NativeEvent): void {
  if (!enabled()) return;
  void initialize().then(sdk => name === 'sign_up'
    ? sdk.logSignUp(sdk.getAnalytics(), { method: 'email' })
    : sdk.logEvent(sdk.getAnalytics(), name))
    .catch(() => { /* Analytics must not interrupt account creation or Clarity. */ });
}
