const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "error",
      "eqeqeq": "error"
    }
  }
];
