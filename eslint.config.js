// eslint.config.js
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals'; // Import globals for predefined environments

export default [
  {
    ignores: ['node_modules/', 'public/', 'dist/', 'dev.sqlite3'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Add Node.js global variables
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'error',
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',
      'import/no-unresolved': 'off',
    },
  },
];
