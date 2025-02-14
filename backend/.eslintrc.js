module.exports = {
	extends: ["../.eslintrc.js"],
	env: {
		node: true,
		browser: false,
	},
	rules: {
		// Backend-specific rules
		"no-process-exit": "error",
		"no-sync": "warn",
	},
};
