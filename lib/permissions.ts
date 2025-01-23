// Permission flags
export const PERMISSIONS = {
    CREATE_INSTANT_INVITE: 0x0000000000000001n, // 1 << 0
    KICK_MEMBERS: 0x0000000000000002n, // 1 << 1
    BAN_MEMBERS: 0x0000000000000004n, // 1 << 2
    ADMINISTRATOR: 0x0000000000000008n, // 1 << 3
    MANAGE_CHANNELS: 0x0000000000000010n, // 1 << 4
    MANAGE_GUILD: 0x0000000000000020n, // 1 << 5
    ADD_REACTIONS: 0x0000000000000040n, // 1 << 6
    VIEW_AUDIT_LOG: 0x0000000000000080n, // 1 << 7
    PRIORITY_SPEAKER: 0x0000000000000100n, // 1 << 8
    STREAM: 0x0000000000000200n, // 1 << 9
    VIEW_CHANNEL: 0x0000000000000400n, // 1 << 10
    SEND_MESSAGES: 0x0000000000000800n, // 1 << 11
    SEND_TTS_MESSAGES: 0x0000000000001000n, // 1 << 12
    MANAGE_MESSAGES: 0x0000000000002000n, // 1 << 13
    EMBED_LINKS: 0x0000000000004000n, // 1 << 14
    ATTACH_FILES: 0x0000000000008000n, // 1 << 15
    READ_MESSAGE_HISTORY: 0x0000000000010000n, // 1 << 16
    MENTION_EVERYONE: 0x0000000000020000n, // 1 << 17
    USE_EXTERNAL_EMOJIS: 0x0000000000040000n, // 1 << 18
    VIEW_GUILD_INSIGHTS: 0x0000000000080000n, // 1 << 19
    CONNECT: 0x0000000000100000n, // 1 << 20
    SPEAK: 0x0000000000200000n, // 1 << 21
    MUTE_MEMBERS: 0x0000000000400000n, // 1 << 22
    DEAFEN_MEMBERS: 0x0000000000800000n, // 1 << 23
    MOVE_MEMBERS: 0x0000000001000000n, // 1 << 24
    USE_VAD: 0x0000000002000000n, // 1 << 25
    CHANGE_NICKNAME: 0x0000000004000000n, // 1 << 26
    MANAGE_NICKNAMES: 0x0000000008000000n, // 1 << 27
    MANAGE_ROLES: 0x0000000010000000n, // 1 << 28
    MANAGE_WEBHOOKS: 0x0000000020000000n, // 1 << 29
    MANAGE_GUILD_EXPRESSIONS: 0x0000000040000000n, // 1 << 30
    USE_APPLICATION_COMMANDS: 0x0000000080000000n, // 1 << 31
    REQUEST_TO_SPEAK: 0x0000000100000000n, // 1 << 32
    MANAGE_EVENTS: 0x0000000200000000n, // 1 << 33
    MANAGE_THREADS: 0x0000000400000000n, // 1 << 34
    CREATE_PUBLIC_THREADS: 0x0000000800000000n, // 1 << 35
    CREATE_PRIVATE_THREADS: 0x0000001000000000n, // 1 << 36
    USE_EXTERNAL_STICKERS: 0x0000002000000000n, // 1 << 37
    SEND_MESSAGES_IN_THREADS: 0x0000004000000000n, // 1 << 38
    USE_EMBEDDED_ACTIVITIES: 0x0000008000000000n, // 1 << 39
    MODERATE_MEMBERS: 0x0000010000000000n, // 1 << 40
    VIEW_CREATOR_MONETIZATION_ANALYTICS: 0x0000020000000000n, // 1 << 41
    USE_SOUNDBOARD: 0x0000040000000000n, // 1 << 42
    CREATE_GUILD_EXPRESSIONS: 0x0000080000000000n, // 1 << 43
    CREATE_EVENTS: 0x0000010000000000n, // 1 << 44
    USE_EXTERNAL_SOUNDS: 0x0000200000000000n, // 1 << 45
    SEND_VOICE_MESSAGES: 0x0000400000000000n, // 1 << 46
    SEND_POLLS: 0x0002000000000000n, // 1 << 49
};

// Function to check permissions
export function hasPermission(permissions: bigint | string, permissionFlag: bigint | string) {
    if (typeof permissions === "string") {
        permissions = BigInt(permissions);
    }

    if (typeof permissionFlag === "string") {
        permissionFlag = BigInt(permissionFlag);
    }

    return (permissions & permissionFlag) === permissionFlag;
}

// Function to create permission integer from an array of permission names
export function generatePermissions(permissions: (keyof typeof PERMISSIONS)[]) {
    let permissionInteger = 0n; // Start with 0n (BigInt)

    for (const permission of permissions) {
        if (PERMISSIONS.hasOwnProperty(permission)) {
            permissionInteger |= PERMISSIONS[permission];
        } else {
            console.error(`Permission '${permission}' does not exist.`);
        }
    }

    return permissionInteger;
}

// Function to add permissions to an existing permission integer
export function addPermissions(current: bigint | string, toAdd: (keyof typeof PERMISSIONS)[]) {
    let newPermissions = typeof current === "string" ? BigInt(current) : current;

    for (const permission of toAdd) {
        if (PERMISSIONS.hasOwnProperty(permission)) {
            newPermissions |= PERMISSIONS[permission];
        } else {
            console.error(`Permission '${permission}' does not exist.`);
        }
    }

    return newPermissions;
}

// Function to remove permissions from an existing permission integer
export function removePermissions(
    current: bigint | string,
    toRemove: (keyof typeof PERMISSIONS)[]
) {
    let newPermissions = typeof current === "string" ? BigInt(current) : current;

    for (const permission of toRemove) {
        if (PERMISSIONS.hasOwnProperty(permission)) {
            newPermissions &= ~PERMISSIONS[permission];
        } else {
            console.error(`Permission '${permission}' does not exist.`);
        }
    }

    return newPermissions;
}

// Function to combine multiple permission integers into one
export function combinePermissions(permissionIntegers: (bigint | string)[]) {
    let combinedPermissions = 0n;

    for (const permissionInteger of permissionIntegers) {
        if (typeof permissionInteger === "string") {
            combinedPermissions |= BigInt(permissionInteger);
        } else {
            combinedPermissions |= permissionInteger;
        }
    }

    return combinedPermissions;
}

export function getDefaultPermissions() {
    // Default permissions for the "everyone" role
    // when creating new guilds

    return generatePermissions([
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "CONNECT",
        "SPEAK",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "VIEW_GUILD_INSIGHTS",
        "USE_APPLICATION_COMMANDS",
        "REQUEST_TO_SPEAK",
        "CREATE_PUBLIC_THREADS",
        "CREATE_PRIVATE_THREADS",
        "USE_EXTERNAL_STICKERS",
        "SEND_MESSAGES_IN_THREADS",
        "USE_EMBEDDED_ACTIVITIES",
        "SEND_VOICE_MESSAGES",
        "CREATE_INSTANT_INVITE",
    ]);
}
