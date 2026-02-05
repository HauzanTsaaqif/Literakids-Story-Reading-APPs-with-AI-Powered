const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Fast Refresh
config.resetCache = true;
config.watchFolders = [__dirname];

module.exports = config;
