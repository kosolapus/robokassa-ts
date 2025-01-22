import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreIIFE: true,
          ignoreVoid: true,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '_',
          varsIgnorePattern: '_',
        },
      ],
      '@stylistic/max-len': ['error', { comments: 85 }],
    },
  }
);
