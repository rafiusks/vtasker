module.exports = {
	extends: [
        "../.eslintrc.js",
        "next/core-web-vitals",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:storybook/recommended"
    ],
	plugins: ["react", "react-hooks"],
	rules: {
		// Frontend-specific rules
		"react/react-in-jsx-scope": "off",
		"react/prop-types": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
	},
	settings: {
		react: {
			version: "detect",
		},
	},
};
