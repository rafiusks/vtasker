/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		// Configure server actions
		serverActions: {
			bodySizeLimit: "2mb",
		},
		// Enable Turbopack
		turbo: {
			rules: {
				// Configure any custom rules here
			},
			resolveAlias: {
				// Configure any aliases here
			},
		},
	},
	// Ensure proper serialization of data
	webpack: (config) => {
		config.experiments = {
			...config.experiments,
			topLevelAwait: true,
		};
		return config;
	},
};

module.exports = nextConfig;
