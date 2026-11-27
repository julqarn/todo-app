const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Signs release builds with the project's release keystore.
 * Credentials come from environment variables (GitHub Actions secrets in CI):
 *   ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD,
 *   ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
 */
function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('signingConfigs.release')) {
      contents = contents.replace(
        /signingConfigs\s*\{/,
        `signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            enableV1Signing true
            enableV2Signing true
            enableV3Signing true
        }`
      );
      contents = contents.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
        '$1signingConfig signingConfigs.release'
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withReleaseSigning;
