/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'../.eslintrc.base.js'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
		ecmaVersion: 2020,
		ecmaFeatures: {
			jsx: false
		}
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
