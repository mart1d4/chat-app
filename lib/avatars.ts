export const defaultAvatars = [
    "HVcOIr52x0E5T7KPPfzgpf3tNQ1LMHSjxdK60RVZbh28sv9Y",
    "HVcOIr52x0E5nJMCBDwB2e9DyoM0Ex4HPh8fZwbV13v6RXgN",
    "HVcOIr52x0E5RteWWKUmx68b3WSXl0unh2PzjO4GeJgd5H7t",
    "HVcOIr52x0E5IFjXmevkgd12hbcy9a4GrnW0fzNiEHMT5uVS",
    "HVcOIr52x0E5r2lkpMqbvKdixBVmE2pGzhQl6O0U3LXTRqoC",
];

export const defaultIcons = [
    "HVcOIr52x0E5xfzI5wuBiERqGeQtU5yKWXpaslTdIDMV1bHo",
    "HVcOIr52x0E5WKjJyYNX68kG5Y1HnD09aZsVerTNpL3AtiXP",
    "HVcOIr52x0E5dmTM1Ye8eoPXfKMu182SIyJUkBaz6nb9h5dG",
    "HVcOIr52x0E58sTGb1ngOFldkn2GHpI05BUbuS7cZoyMATwx",
    "HVcOIr52x0E58omnMZgOFldkn2GHpI05BUbuS7cZoyMATwxK",
    "HVcOIr52x0E5HMlcYpU52x0E5TLFK9sBYuh6plvVygcmS4Wz",
    "HVcOIr52x0E53FaV91HKPA1Yh96tLS85olMvOZIfVWNiBRb3",
];

export const colors = {
    online: "#22A559",
    idle: "#F0B232",
    dnd: "#F23F43",
    invisible: "#80848E",
    offline: "#80848E",
};

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

export const labels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    invisible: "Invisible",
    offline: "Offline",
};

/**
 * Get a random avatar from the default avatars list
 * @param id - The id to get the avatar for
 * @returns The avatar url for the id
 * @example getRandomAvatar(1234)
 */
export function getRandomAvatar(id: number) {
    const index = id % defaultAvatars.length;
    return defaultAvatars[index];
}
