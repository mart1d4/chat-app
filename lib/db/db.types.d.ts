import type { ColumnType, JSONColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export interface Users {
    id: Generated<number>;

    username: string;
    displayName: string;

    description: string | null;
    customStatus: string | null;
    status: Generated<"online" | "idle" | "dnd" | "invisible" | "offline">;

    avatar: string;
    banner: string | null;

    primaryColor: string;
    accentColor: string;

    password: string;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;

    twoFactorEnabled: Generated<boolean>;
    twoFactorTempSecret: string | null;
    twoFactorSecret: string | null;
    recoveryCodes:
        | {
              code: string;
              used: boolean;
          }[]
        | null;

    email: string | null;
    emailVerificationToken: string | null;
    emailVerificationCode: string | null;

    phone: string | null;
    phoneVerified: Generated<boolean>;
    phoneVerificationCode: string | null;
    phoneVerificationExpires: Date | null;

    system: Generated<boolean>;
    verified: Generated<boolean>;

    notes: JSONColumnType<Notes[]>;
    notifications: JSONColumnType<Notifications[]>;
    settings: JSONColumnType<Settings[]>;

    createdAt: Generated<Date>;
    isDeleted: Generated<boolean>;
}

// If Channel type is not 0 or 1, then return V, else return null

type IfChannelTypeNot0Or1<T, V> = T["type"] extends 0 | 1 ? null : V;

export interface Channels {
    id: Generated<number>;

    type: number;

    name: string | null;
    topic: string | null;
    icon: string | null;
    nsfw: IfChannelTypeNot0Or1<this, boolean>;

    position: IfChannelTypeNot0Or1<this, number>;
    parentId: number | null;

    lastMessageId: number | null;
    lastPinTimestamp: Date | null;

    bitrate: IfChannelTypeNot0Or1<this, number>;
    rateLimit: IfChannelTypeNot0Or1<this, number>;
    userLimit: IfChannelTypeNot0Or1<this, number>;

    rtcRegion: IfChannelTypeNot0Or1<this, string | null>;
    videoQualityMode: IfChannelTypeNot0Or1<this, number>;

    ownerId: number | null;
    guildId: IfChannelTypeNot0Or1<this, number>;

    permissionOverwrites: JSONColumnType<PermissionOverwrites[]>;

    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    isDeleted: Generated<boolean>;
}

export interface Guilds {
    id: Generated<number>;

    name: string;
    icon: string | null;
    banner: string | null;
    description: string | null;

    systemChannelId: number | null;
    afkChannelId: number | null;
    afkTimeout: number | null;

    vanityUrl: string | null;
    vanityUrlUses: number | null;
    welcomeScreen: JSONColumnType<WelcomeScreen> | null;

    ownerId: number;

    createdAt: Generated<Date>;
    isDeleted: Generated<boolean>;
}

export interface Messages {
    id: Generated<number>;

    type: number;

    content: string | null;
    attachments: JSONColumnType<Attachments[]>;
    embeds: JSONColumnType<Embeds[]>;

    edited: Date | null;
    pinned: Date | null;

    referenceId: number | null;
    mentionEveryone: Generated<boolean>;

    authorId: number;
    channelId: number;

    createdAt: Generated<Date>;
}

export interface Emojis {
    id: Generated<number>;

    name: string;
    url: string;
    animated: Generated<boolean>;

    guildId: number;

    createdAt: Generated<Date>;
}

export interface Roles {
    id: Generated<number>;

    name: string;
    color: Generated<string>;

    hoist: Generated<boolean>;
    position: number;

    permissions: number;
    mentionable: Generated<boolean>;

    guildId: number;

    createdAt: Generated<Date>;
}

export interface Invites {
    id: Generated<number>;

    code: string;
    uses: Generated<number>;
    temporary: Generated<boolean>;

    maxAge: Generated<number>;
    maxUses: Generated<number>;

    inviterId: number;
    channelId: number;
    guildId: number | null;

    expiresAt: Date;
    createdAt: Generated<Date>;
}

export interface UserTokens {
    userId: number;

    token: string;
    expires: Date;
    userAgent: string;
    ip: string;

    country: string | null;
    region: string | null;
    city: string | null;
}

export interface Friends {
    A: number;
    B: number;
}

export interface Blocked {
    blockerId: number;
    blockedId: number;
}

export interface Requests {
    requesterId: number;
    requestedId: number;
}

export interface ChannelRecipients {
    channelId: number;
    userId: number;
    isHidden: Generated<boolean>;
}

export interface GuildMembers {
    guildId: number;
    userId: number;
    profile: JSONColumnType<GuildMemberProfile>;
}

export interface ChannelMessages {
    channelId: number;
    messageId: number;
}

export interface UserMentions {
    messageId: number;
    userId: number;
}

export interface RoleMentions {
    messageId: number;
    roleId: number;
}

export interface ChannelMentions {
    messageId: number;
    channelId: number;
}

export interface MessageReactions {
    messageId: number;
    emojiId: number;
    userId: number;
}

export interface DB {
    users: Users;
    channels: Channels;
    guilds: Guilds;
    messages: Messages;
    emojis: Emojis;
    roles: Roles;
    invites: Invites;

    userTokens: UserTokens;
    friends: Friends;
    blocked: Blocked;
    requests: Requests;
    channelRecipients: ChannelRecipients;
    guildMembers: GuildMembers;
    channelMessages: ChannelMessages;
    userMentions: UserMentions;
    roleMentions: RoleMentions;
    channelMentions: ChannelMentions;
    messageReactions: MessageReactions;
}

// Not tables, just column types

export interface Embeds {
    type: string;

    title: string;
    description: string;
    url: string;
    color: string;

    fields: {
        name: string;
        value: string;
        inline: number;
    }[];

    image: {
        url: string;
        width: number;
        height: number;
    };
    thumbnail: string;
    video: string;

    provider: string;
}

export interface Notes {
    id: number;
    note: string;
}

// If type is image or video, then return V, else return null

type IfImageOrVideo<T, V> = T["type"] extends "image" | "video" ? V : null;

export interface Attachments {
    id: number;

    type: "image" | "video" | "audio" | "file";

    size: number;
    filename: string;
    alt: string;
    spoiler: boolean;
    description: string;

    height: IfImageOrVideo<this, number>;
    width: IfImageOrVideo<this, number>;

    proxyUrl: string | null;
}

export interface WelcomeScreen {
    title: string;

    description: string;

    welcomeChannels: number[];
    welcomeRoles: number[];

    imageUrl: string;
}

export interface GuildMemberProfile {
    id: number;

    nickname: string | null;

    roles: number[];
    permissions: number;

    joinedAt: Date;
}

// Type is 0 for role permissions and 1 for member permissions
export interface PermissionOverwrites {
    id: number;

    type: 0 | 1;

    allow: number;
    deny: number;
}

export interface Notifications {
    id: number;
    message: string;
    read: boolean;
}

export interface Settings {
    theme: "system" | "dark" | "light" | "catppuccin" | "solarized" | "dracula" | "nord";
    accent: string;
    darkSidebar: boolean;

    locale: string;
    timezone: string;

    acceptRequestsFrom: {
        everyone: boolean;
        friends: boolean;
        guilds: boolean;
    };

    explicitContentFilter: boolean;

    messageDisplay: "cozy" | "compact";
    showAvatarOnCompactMessages: boolean;
    chatFontSize: number;
    spaceBetweenMessageGroups: number;
    zoomLevel: number;

    alwaysUnderlineLinks: boolean;
    showRoleColorsInNames: boolean;
    reducedMotion: boolean;
    playAnimatedEmojis: boolean;
    automaticallyPlayGIFs: boolean;

    showSendMessageButton: boolean;
    textToSpeechSpeed: number;

    voiceInputMode: "voice" | "push-to-talk";
}
