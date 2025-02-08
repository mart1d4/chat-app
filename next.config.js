/** @type {import('next').NextConfig} */

const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

module.exports = nextConfig;
