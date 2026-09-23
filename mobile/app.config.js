module.exports = ({ config }) => {
  const enabled = process.env.EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED === 'true';
  const androidFile = process.env.GOOGLE_SERVICES_JSON;
  const iosFile = process.env.GOOGLE_SERVICE_INFO_PLIST;
  if (enabled && !androidFile && !iosFile) throw new Error('Launch analytics requires native Firebase configuration: GOOGLE_SERVICES_JSON and/or GOOGLE_SERVICE_INFO_PLIST.');
  const platform = process.env.EAS_BUILD_PLATFORM;
  if (enabled && ((platform === 'android' && !androidFile) || (platform === 'ios' && !iosFile))) throw new Error(`Missing Firebase configuration for ${platform}.`);
  return {
    ...config,
    android: { ...config.android, ...(enabled && androidFile ? { googleServicesFile: androidFile } : {}), blockedPermissions: [...(config.android?.blockedPermissions || []), 'com.google.android.gms.permission.AD_ID'] },
    ios: { ...config.ios, ...(enabled && iosFile ? { googleServicesFile: iosFile } : {}) },
    extra: { ...config.extra, launchAnalyticsEnabled: enabled },
    plugins: [
      ...(config.plugins || []),
      ...(enabled ? [
        ['@react-native-firebase/app', { ios: { disableSPM: true } }],
        ['@react-native-firebase/analytics', { ios: { withoutAdIdSupport: true } }],
        ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
      ] : []),
    ],
  };
};
