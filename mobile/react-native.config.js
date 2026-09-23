// Until platform configuration is supplied, keep the current native build usable.
const enabled = process.env.EXPO_PUBLIC_LAUNCH_ANALYTICS_ENABLED === 'true';
module.exports = enabled ? {} : {
  dependencies: {
    '@react-native-firebase/app': { platforms: { android: null, ios: null } },
    '@react-native-firebase/analytics': { platforms: { android: null, ios: null } },
  },
};
