// babel.config.js - Corriger les warnings
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin', // Au lieu de react-native-reanimated/plugin
    ],
  };
};