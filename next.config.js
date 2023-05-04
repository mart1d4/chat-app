/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
        serverComponentsExternalPackages: ["mongoose"],
    },
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
};

module.exports = nextConfig;
