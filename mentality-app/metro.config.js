const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * expo-sqlite runs on web through wa-sqlite, which ships as a .wasm binary and
 * needs SharedArrayBuffer. Metro has to treat the wasm as an asset, and the
 * dev server has to send the cross-origin isolation headers or the browser
 * refuses to hand SharedArrayBuffer over.
 *
 * Web is a preview surface here — the product ships to iOS and Android — but
 * the offline outbox is shared code, so it has to load somewhere or every
 * screen that writes would break in the browser.
 */
config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    return middleware(req, res, next);
  };
};

module.exports = config;
