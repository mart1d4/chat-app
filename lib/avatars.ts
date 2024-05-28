export const defaultAvatars = [
    "4_zaaf5608f2b4d18548df90c14_f105e7453fe94cd3c_d20240425_m140321_c005_v0501002_t0033_u01714053801839",
    "4_zaaf5608f2b4d18548df90c14_f11177263f6849cb8_d20240425_m140321_c005_v0501002_t0043_u01714053801620",
    "4_zaaf5608f2b4d18548df90c14_f111e95748997418b_d20240425_m140322_c005_v0501020_t0041_u01714053802557",
    "4_zaaf5608f2b4d18548df90c14_f109fe25e8b219673_d20240425_m140320_c005_v0501019_t0044_u01714053800366",
    "4_zaaf5608f2b4d18548df90c14_f119f46b01aaab7e4_d20240425_m140321_c005_v0501002_t0056_u01714053801243",
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
