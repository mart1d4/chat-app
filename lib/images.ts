"use client";

export function getImageDimensions({
    w,
    h,
    maxW,
    maxH,
    keepMaxAspectRatio,
    maxSize = 0.8,
}: {
    w: number;
    h: number;
    maxW?: number;
    maxH?: number;
    keepMaxAspectRatio?: boolean;
    maxSize?: number;
}) {
    if (!w || !h) {
        return { width: 0, height: 0 };
    }

    let width = 0;
    let height = 0;

    const { innerWidth, innerHeight } = window;

    let maxHeight = innerHeight * maxSize;
    let maxWidth = innerWidth * maxSize;

    // Maintain aspect ratio
    let aspectRatio = w / h;

    if (maxW && maxH) {
        if (maxW === maxH) {
            return { width: maxW, height: maxH };
        }

        if (keepMaxAspectRatio) {
            if (maxW > maxH) {
                aspectRatio = maxW / maxH;
            } else {
                aspectRatio = maxH / maxW;
            }
        }

        maxWidth = maxW;
        maxHeight = maxH;
    }

    if (w > h) {
        // Landscape image
        width = Math.min(maxWidth, w);
        height = width / aspectRatio;

        // Check if height exceeds maxHeight
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
    } else {
        // Portrait image
        height = Math.min(maxHeight, h);
        width = height * aspectRatio;

        // Check if width exceeds maxWidth
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }
    }

    return { width, height };
}
