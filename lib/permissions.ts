import type { GuildChannel, GuildMember, GuildRole } from "@/type";

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

export const guildPermissionList = [
    {
        title: "General Server Permissions",
        permissions: [
            {
                name: "View Channels",
                description:
                    "Allows members to view channels by default (excluding private channels).",
                permission: PERMISSIONS.VIEW_CHANNEL,
            },
            {
                name: "Manage Channels",
                description: "Allows members to create, edit, or delete channels.",
                permission: PERMISSIONS.MANAGE_CHANNELS,
            },
            {
                name: "Manage Roles",
                description:
                    "Allows members to create new roles and edit or delete roles lower than their highest role. Also allows members to change permissions of individual channels that they have access to.",
                permission: PERMISSIONS.MANAGE_ROLES,
            },
            {
                name: "Create Expressions",
                description:
                    "Allows members to add custom emoji, stickers, and sounds in this server.",
                permission: PERMISSIONS.CREATE_GUILD_EXPRESSIONS,
            },
            {
                name: "Manage Expressions",
                description:
                    "Allows members to edit or remove custom emoji, stickers, and sounds in this server.",
                permission: PERMISSIONS.MANAGE_GUILD_EXPRESSIONS,
            },
            {
                name: "View Audit Log",
                description:
                    "Allows members to view a record of who made which changes in this server.",
                permission: PERMISSIONS.VIEW_AUDIT_LOG,
            },
            {
                name: "Manage Webhooks",
                description:
                    "Allows members to create, edit, or delete webhooks, which can post messages from other apps or sites into this server.",
                permission: PERMISSIONS.MANAGE_WEBHOOKS,
            },
            {
                name: "Manage Server",
                description:
                    "Allows members to change this server's name, switch regions, view all invites, add apps to this server and create and update AutoMod rules.",
                permission: PERMISSIONS.MANAGE_GUILD,
            },
        ],
    },
    {
        title: "Membership Permissions",
        permissions: [
            {
                name: "Create Invite",
                description: "Allows members to invite new people to this server.",
                permission: PERMISSIONS.CREATE_INSTANT_INVITE,
            },
            {
                name: "Change Nickname",
                description:
                    "Allows members to change their own nickname, a custom name for just this server.",
                permission: PERMISSIONS.CHANGE_NICKNAME,
            },
            {
                name: "Manage Nicknames",
                description: "Allows members to change the nicknames of other members.",
                permission: PERMISSIONS.MANAGE_NICKNAMES,
            },
            {
                name: "Kick Members",
                description:
                    "Allows members to remove other members from this server. Kicked members will be able to rejoin if they have another invite.",
                permission: PERMISSIONS.KICK_MEMBERS,
            },
            {
                name: "Ban Members",
                description:
                    "Allows members to permanently ban and delete the message history of other members from this server.",
                permission: PERMISSIONS.BAN_MEMBERS,
            },
            {
                name: "Timeout Members",
                description:
                    "When you put a user in timeout they will not be able to send messages in chat, reply withing threads, react to messages, or speak in voice or Stage channels.",
                permission: PERMISSIONS.MODERATE_MEMBERS,
            },
        ],
    },
    {
        title: "Text Channel Permissions",
        permissions: [
            {
                name: "Send Messages",
                description: "Allows members to send messages in text channels.",
                permission: PERMISSIONS.SEND_MESSAGES,
            },
            {
                name: "Send Messages in Threads",
                description: "Allows members to send messages in threads.",
                permission: PERMISSIONS.SEND_MESSAGES_IN_THREADS,
            },
            {
                name: "Create Public Threads",
                description:
                    "Allows members to create threads that everyone in a channel can view.",
                permission: PERMISSIONS.CREATE_PUBLIC_THREADS,
            },
            {
                name: "Create Private Threads",
                description: "Allows members to create invite-only threads",
                permission: PERMISSIONS.CREATE_PRIVATE_THREADS,
            },
            {
                name: "Embed Links",
                description:
                    "Allows links that members share to show embedded content in text channels.",
                permission: PERMISSIONS.EMBED_LINKS,
            },
            {
                name: "Attach Files",
                description: "Allows members to upload files or media in text channels.",
                permission: PERMISSIONS.ATTACH_FILES,
            },
            {
                name: "Add Reactions",
                description:
                    "Allows members to add new emoji reactions to a message. If this permission is disabled, members can still react usng any existing reactions on a message.",
                permission: PERMISSIONS.ADD_REACTIONS,
            },
            {
                name: "Use External Emojis",
                description:
                    "Allows members to use emoji from other servers, if they're a Spark Nitro member.",
                permission: PERMISSIONS.USE_EXTERNAL_EMOJIS,
            },
            {
                name: "Use External Stickers",
                description:
                    "Allows members to use stickers from other servers, if they're a Spark Nitro member.",
                permission: PERMISSIONS.USE_EXTERNAL_STICKERS,
            },
            {
                name: "Use External Sounds",
                description:
                    "Allows members to use sounds from other servers, if they're a Spark Nitro member.",
                permission: PERMISSIONS.USE_EXTERNAL_SOUNDS,
            },
            {
                name: "Mention @everyone, @here, and All Roles",
                description:
                    'Allows members to use @everyone (everyone in the server) or @here (only online members in that channel). They can also @mention all roles, even if the role\'s "Allow anyone to mentions this role" permission is disabled.',
                permission: PERMISSIONS.MENTION_EVERYONE,
            },
            {
                name: "Manage Messages",
                description:
                    "Allows members to delete messages by other members or pin any message.",
                permission: PERMISSIONS.MANAGE_MESSAGES,
            },
            {
                name: "Manage Threads",
                description:
                    "Allows members to rename, delete, close, and turn on slow mode for threads. They can also view private threads.",
                permission: PERMISSIONS.MANAGE_THREADS,
            },
            {
                name: "Read Message History",
                description:
                    "Allows members to view previous messages sent in channels. If this permission is disabled, members only see messages sent when they are online. This does not fully apply to threads and forum posts.",
                permission: PERMISSIONS.READ_MESSAGE_HISTORY,
            },
            {
                name: "Send Text-to-Speech Messages",
                description:
                    "Allows members to send text-to-speech messages by starting a message with /tts. These messages can be heard by anyone focused on the channel.",
                permission: PERMISSIONS.SEND_TTS_MESSAGES,
            },
            {
                name: "Create Polls",
                description: "Allows members to create polls.",
                permission: PERMISSIONS.SEND_POLLS,
            },
        ],
    },
    {
        title: "Voice Channel Permissions",
        permissions: [
            {
                name: "Connect",
                description: "Allows members to join voice channels and hear others.",
                permission: PERMISSIONS.CONNECT,
            },
            {
                name: "Speak",
                description:
                    'Allows members to talk in voice channels. If this permission if disabled, members are default muted until somebody with the "Mute Members" permission un-mutes them.',
                permission: PERMISSIONS.SPEAK,
            },
            {
                name: "Video",
                description:
                    "Allows members to share their video, screen share, or stream a game in this server.",
                permission: PERMISSIONS.STREAM,
            },
            {
                name: "Use Soundboard",
                description: "Allows members to send sounds from server soundboard.",
                permission: PERMISSIONS.USE_SOUNDBOARD,
            },
            {
                name: "Use External Sounds",
                description:
                    "Allows members to use sounds from other servers, if they're a Spark Nitro member.",
                permission: PERMISSIONS.USE_EXTERNAL_SOUNDS,
            },
            {
                name: "Use Voice Activity",
                description:
                    "Allows members to speak in voice channels by simply talking. If this permission is disabled, members are required to use Push-to-talk. Good for controlling background noise or noisy memebrs.",
                permission: PERMISSIONS.USE_VAD,
            },
            {
                name: "Priority Speaker",
                description:
                    "Allows members to be more easily heard in voice channels. When activated, the volume of others without this permission will be automatically lowered. Priority Speaker is activated by using the Push to Talk (Priority) keybind.",
                permission: PERMISSIONS.PRIORITY_SPEAKER,
            },
            {
                name: "Mute Members",
                description: "Allows members to mute other members in voice channels for everyone.",
                permission: PERMISSIONS.MUTE_MEMBERS,
            },
            {
                name: "Deafen Members",
                description:
                    "Allows members to deafen other members in voice channels, which means they won't be able to speak or hear others.",
                permission: PERMISSIONS.DEAFEN_MEMBERS,
            },
            {
                name: "Move Members",
                description:
                    "Allows members to disconnect or move other members between voice channels that the member with this permission has access to.",
                permission: PERMISSIONS.MOVE_MEMBERS,
            },
        ],
    },
    {
        title: "Apps Permisisons",
        permissions: [
            {
                name: "Use Application Commands",
                description:
                    "Allows members to use commands from applications, including slash commands and context menu commands.",
                permission: PERMISSIONS.USE_APPLICATION_COMMANDS,
            },
            {
                name: "Use Activities",
                description: "Allows members to use activities.",
                permission: PERMISSIONS.USE_EMBEDDED_ACTIVITIES,
            },
        ],
    },
    {
        title: "Events Permissions",
        permissions: [
            {
                name: "Create Events",
                description: "Allows members to create events.",
                permission: PERMISSIONS.CREATE_EVENTS,
            },
            {
                name: "Manage Events",
                description: "Allows members to edit and cancel events.",
                permission: PERMISSIONS.MANAGE_EVENTS,
            },
        ],
    },
    {
        title: "Advanced Permissions",
        permissions: [
            {
                name: "Administrator",
                description:
                    "Members with this permission will have every permission and will also bypass all channel specific permissions or restrictions (for example, these members would get access to all private channels). This is a dangerous permission to grant.",
                permission: PERMISSIONS.ADMINISTRATOR,
            },
        ],
    },
];

export function isNotBigInt(value: any): value is string | number {
    return typeof value !== "bigint";
}

export function hasPermission(permissions: bigint | string, permissionFlag: bigint | string) {
    if (isNotBigInt(permissions)) {
        permissions = BigInt(permissions);
    }

    if (isNotBigInt(permissionFlag)) {
        permissionFlag = BigInt(permissionFlag);
    }

    return (permissions & permissionFlag) === permissionFlag;
}

export function generatePermissions(permissions: (keyof typeof PERMISSIONS)[]) {
    let permissionInteger = 0n;

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
    let newPermissions = isNotBigInt(current) ? BigInt(current) : current;

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
    let newPermissions = isNotBigInt(current) ? BigInt(current) : current;

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
        if (isNotBigInt(permissionInteger)) {
            combinedPermissions |= BigInt(permissionInteger);
        } else {
            combinedPermissions |= permissionInteger;
        }
    }

    return combinedPermissions;
}

export function doesUserHaveChannelPermission(
    channels: GuildChannel[],
    roles: GuildRole[],
    channel: GuildChannel,
    user: GuildMember,
    permission: keyof typeof PERMISSIONS
) {
    // Check for permissions, if channel has no overwrites, use its category's overwrites (it channel has a category)
    // remember that deny rules always take precedence over allow rules
    // Also need to take into the account that each role has its own permissions, and that some roles are higher than others

    const userRoles = user.roles.sort(
        // Sort roles so that the highest role is first
        // a higher role is a role with a lower position
        (a, b) => roles.find((r) => r.id === b)?.position - roles.find((r) => r.id === a)?.position
    );

    const userPermissions = user.permissions;

    // First check if any of the roles user has makes the user an admin
    if (hasPermission(userPermissions, PERMISSIONS.ADMINISTRATOR)) return true;

    for (const role of userRoles) {
        const rolePermissions = roles.find((r) => r.id === role)?.permissions;
        if (hasPermission(rolePermissions, PERMISSIONS.ADMINISTRATOR)) return true;
    }

    const overwrites = channel.permissionOverwrites;
    const category = channels.find((c) => c.id === channel.parentId);
    const categoryOverwrites = category?.permissionOverwrites || [];

    // Check channel overwrites
    for (const overwrite of overwrites) {
        if (overwrite.type === 0 && userRoles.includes(overwrite.id)) {
            if (hasPermission(overwrite.deny, PERMISSIONS[permission])) return false;
            if (hasPermission(overwrite.allow, PERMISSIONS[permission])) return true;
        } else if (overwrite.type === 1 && overwrite.id === user.id) {
            if (hasPermission(overwrite.deny, PERMISSIONS[permission])) return false;
            if (hasPermission(overwrite.allow, PERMISSIONS[permission])) return true;
        }
    }

    // Check category overwrites
    for (const overwrite of categoryOverwrites) {
        if (overwrite.type === 0 && userRoles.includes(overwrite.id)) {
            if (hasPermission(overwrite.deny, PERMISSIONS[permission])) return false;
            if (hasPermission(overwrite.allow, PERMISSIONS[permission])) return true;
        } else if (overwrite.type === 1 && overwrite.id === user.id) {
            if (hasPermission(overwrite.deny, PERMISSIONS[permission])) return false;
            if (hasPermission(overwrite.allow, PERMISSIONS[permission])) return true;
        }
    }

    // Check guild permissions
    if (hasPermission(userPermissions, PERMISSIONS[permission])) return true;

    // Check role permissions
    for (const role of userRoles) {
        const rolePermissions = roles.find((r) => r.id === role)?.permissions;
        if (hasPermission(rolePermissions, PERMISSIONS[permission])) return true;
    }

    return false;
}

export function doesUserHaveGuildPermission(
    roles: GuildRole[],
    user: GuildMember,
    permission: keyof typeof PERMISSIONS
) {
    const userRoles = user.roles.sort(
        (a, b) => roles.find((r) => r.id === b)?.position - roles.find((r) => r.id === a)?.position
    );

    const userPermissions = user.permissions;

    if (hasPermission(userPermissions, PERMISSIONS.ADMINISTRATOR)) return true;

    for (const role of userRoles) {
        const rolePermissions = roles.find((r) => r.id === role)?.permissions;
        if (hasPermission(rolePermissions, PERMISSIONS.ADMINISTRATOR)) return true;
    }

    if (hasPermission(userPermissions, PERMISSIONS[permission])) return true;

    for (const role of userRoles) {
        const rolePermissions = roles.find((r) => r.id === role)?.permissions;
        if (hasPermission(rolePermissions, PERMISSIONS[permission])) return true;
    }

    return false;
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
