import { generateReactHelpers } from "@uploadthing/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

if (!apiUrl) {
    console.error("Please set NEXT_PUBLIC_API_URL in your .env file");
    process.exit(1);
}

if (!cdnUrl) {
    console.error("Please set NEXT_PUBLIC_CDN_URL in your .env file");
    process.exit(1);
}

export const { useUploadThing, uploadFiles } = generateReactHelpers({
    url: `http://localhost:8080/api/uploadthing`,
});

export function getCdnUrl() {
    return `${cdnUrl}`;
}
