const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
  ...expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*", "assets/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      // Unused code is the main thing this catches for us. An underscore
      // prefix is the escape hatch for a parameter we have to accept but
      // don't read.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-unused-vars": "off",

      // A web rule. React Native <Text> renders an apostrophe as an
      // apostrophe, and the copy in this app is full of them on purpose —
      // it's written the way an athlete talks.
      "react/no-unescaped-entities": "off",
    },
  },
];
