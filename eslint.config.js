const js = require("@eslint/js");
const prettierPlugin = require("eslint-plugin-prettier");
module.exports = [
  js.configs.recommended, // ESLint recommended rules

  {
    languageOptions: {
      globals: {
        require: "readonly", // Node.js global
        module: "readonly", // Node.js global
        __dirname: "readonly", // Node.js global
        process: "readonly", // Node.js global
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      // ESLint rules
      semi: ["off", "always"], // Enforce semicolons
      quotes: ["off", "double"], // Enforce double quotes
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_| req|res|next|console|" },
      ], // Allow unused variables with underscore prefix
      // "no-unused-vars": "warn",
      "no-undef": "on", // Allow undefined variables
      "no-redeclare": "off", // Allow variable redeclaration
      "no-shadow": "off", // Allow variable shadowing
      "no-use-before-define": "on", // Allow variables to be used before they are defined
      "no-multi-assign": "off", // Allow multiple assignments in a single statement
      "no-new": "off", // Allow usage of new without assignment
      "no-throw-literal": "off", // Allow throwing literals
      "no-implicit-globals": "off", // Allow implicit globals
      "no-unsafe-optional-chaining": "off", // Allow unsafe optional chaining

      "no-console": "off", // Allow console statements
      "no-process-exit": "off", // Allow process.exit()
      // Prettier integration
      "prettier/prettier": "warn",
    },
  },
];
// This configuration extends the recommended ESLint rules and integrates Prettier for code formatting.
