const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    assetExts: [...getDefaultConfig(__dirname).resolver.assetExts, 'sqlite', 'db'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
