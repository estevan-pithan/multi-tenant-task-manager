import pluginJs from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	reactHooks.configs['recommended-latest'],
	eslintPluginPrettier,
	{
		files: ['**/*.tsx'],
		languageOptions: { parserOptions: { parser: tseslint.parser } },
		rules: {
			'no-console': 'warn',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'no-unexpected-multiline': 'error',
			'no-undef': 'off',
		},
		ignores: ['node_modules', 'dist', 'coverage', 'build', '.vscode', 'public', '*.scss'],
	},
]
