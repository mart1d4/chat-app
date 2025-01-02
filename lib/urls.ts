if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("Please set the NEXT_PUBLIC_API_URL environment variable");
    process.exit(1);
}

if (!process.env.NEXT_PUBLIC_CDN_URL) {
    console.error("Please set the NEXT_PUBLIC_CDN_URL environment variable");
    process.exit(1);
}

export function getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL;
}

export function getCdnUrl() {
    return process.env.NEXT_PUBLIC_CDN_URL;
}
