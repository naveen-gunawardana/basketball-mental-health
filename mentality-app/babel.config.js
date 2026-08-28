module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    // react-native-worklets must stay last — Reanimated 4 depends on it.
    plugins: ["react-native-worklets/plugin"],
  };
};
