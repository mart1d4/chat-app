/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ucarecdn.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    // Add CORS headers
                    {
                        key: 'Access-Control-Allow-Origin',
                        // value: 'https://tauri.localhost',
                        value: 'http://localhost:5000',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, OPTIONS, PATCH, DELETE, POST, PUT',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Accept, Content-Type, x-requested-with, Authorization, X-Custom-Header',
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                ],
            },
        ]
    },
};

module.exports = nextConfig;
