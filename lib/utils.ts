import { customAlphabet } from "nanoid";

// Statuses

export const rectSizes = {
    16: 6,
    24: 8,
    32: 10,
    40: 12,
    80: 16,
    120: 24,
};

export const rectPlacements = {
    16: 5.5,
    24: 16.5,
    32: 22,
    40: 28,
    80: 60,
    120: 90,
};

export const masks = {
    online: "",
    idle: "status-mask-idle",
    dnd: "status-mask-dnd",
    invisible: "status-mask-offline",
    offline: "status-mask-offline",
};

export const colors = {
    online: "#22A559",
    idle: "#F0B232",
    dnd: "#F23F43",
    invisible: "#80848E",
    offline: "#80848E",
};

export const labels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    invisible: "Invisible",
    offline: "Offline",
};

export function getStatusMask(status: string) {
    if (!(status in masks)) return masks.offline;
    return masks[status as keyof typeof masks];
}

export function getStatusLabel(status: string) {
    if (!(status in labels)) return labels.offline;
    return labels[status as keyof typeof labels];
}

export function getStatusColor(status: string) {
    if (!(status in colors)) return colors.offline;
    return colors[status as keyof typeof colors];
}

// Emoji Picker

export const emojiPos = (() => {
    const positions = [];
    const xOffsets = [0, -22, -44, -66, -88, -110, -132, -154, -176, -198, -220];
    const yOffsets = [0, -22, -44, -66, -88];

    for (let i = 0; i < xOffsets.length; i++) {
        for (let j = 0; j < yOffsets.length; j++) {
            // Skip combinations that aren't in the original array
            if (i >= 5 && j > 3) continue; // Adjust based on the original data structure
            positions.push({ x: xOffsets[i], y: yOffsets[j] });
        }
    }

    return positions;
})();

// Avatars

const defaultAvatars = Array.from({ length: 10 }, (_, i) => i);
const defaultIcons = Array.from({ length: 7 }, (_, i) => i);

const defaultAvatarColors = [
    "#289872",
    "#289872",
    "#289872",
    "#3485d6",
    "#3485d6",
    "#ff52a1",
    "#ff52a1",
    "#8e5cd7",
    "#8e5cd7",
    "#8e5cd7",
];

export function getRandomColor(id: number) {
    const index = id % defaultAvatarColors.length;
    return defaultAvatarColors[index];
}

export function getRandomImage(id: number, type: "avatar" | "icon") {
    const list = type === "avatar" ? defaultAvatars : defaultIcons;
    const index = id % list.length;
    return `/assets/${type}s/${list[index]}.png`;
}

// IDs

export function getNanoId() {
    return customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZ.", 12)();
}

export function getNanoIdInt(): number {
    return parseInt(customAlphabet("1234567890", 12)());
}
