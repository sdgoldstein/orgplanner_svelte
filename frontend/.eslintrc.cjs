/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:svelte/recommended',
		'../.eslintrc.base.js'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
		ecmaFeatures: {
			jsx: false
		}
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
