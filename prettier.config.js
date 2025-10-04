module.exports = {
  semi: true, // Use semicolons at the end of statements
  singleQuote: false, // Use double quotes instead of single quotes
  trailingComma: "all",
  tabWidth: 2, // Set tab width to 2 spaces
  printWidth: 80, // Set print width to 80 characters
  useTabs: false, // Use spaces instead of tabs
  bracketSpacing: true, // Print spaces between brackets
  arrowParens: "always", // Always include parentheses around arrow function arguments
  endOfLine: "lf", // Use LF for line endings
  overrides: [
    {
      files: "*.js",
      options: {
        parser: "babel",
      },
    },
  ],
  plugins: [],
};
// This is a Prettier configuration file that sets the formatting rules for the project.
