module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier", // Make ESLint work with Prettier
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	rules: {
		// Shared rules for both frontend and backend
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		"no-console": ["warn", { allow: ["warn", "error"] }],
	},
	ignorePatterns: ["dist", "build", "node_modules"],
	settings: {
		next: {
			rootDir: "frontend/",
		},
	},
};
