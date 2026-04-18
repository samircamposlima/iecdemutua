const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
