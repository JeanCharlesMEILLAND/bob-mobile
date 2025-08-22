const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Optimizations pour le web
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any npm packages that need to be transpiled for web
          'react-native-vector-icons',
          'react-native-paper',
          'react-native-gesture-handler',
        ],
      },
    },
    argv
  );

  // Personnalisations pour BOB Mobile Web
  config.resolve.alias = {
    ...config.resolve.alias,
    // Alias pour React Native Web
    'react-native$': 'react-native-web',
  };

  // Configuration pour les icônes
  config.module.rules.push({
    test: /\.ttf$/,
    loader: 'url-loader',
    include: /node_modules\/react-native-vector-icons/,
  });

  // Pas besoin de règle Babel supplémentaire, Expo s'en charge

  return config;
};