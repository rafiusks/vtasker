module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	rules: {
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		"no-console": ["warn", { allow: ["warn", "error"] }],
	},
	ignorePatterns: ["dist", "build", "node_modules", "*.js", "!.eslintrc.js"],
};
