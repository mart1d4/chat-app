/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ucarecdn.com",
            },
        ],
        dangerouslyAllowSVG: true,
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "http://192.168.1.27:3000",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Accept, Content-Type, x-requested-with, Authorization, X-Custom-Header",
                    },
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true",
                    },
                ],
            },
        ];
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
