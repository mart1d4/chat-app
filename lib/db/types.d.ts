import type { ColumnType, JSONColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export interface Users {
    accentColor: string;
    avatar: string;
    banner: string | null;
    createdAt: Generated<Date>;
    customStatus: string | null;
    description: string | null;
    displayName: string;
    email: string | null;
    id: number;
    isDeleted: Generated<boolean>;
    notes: JSONColumnType<Notes[]>;
    notifications: string;
    password: string;
    phone: string | null;
    primaryColor: string;
    tokens: JSONColumnType<Tokens[]>;
    status: Generated<"dnd" | "idle" | "invisible" | "offline" | "online">;
    system: Generated<boolean>;
    username: string;
    verified: Generated<boolean>;
}

// If Channel type is not 0 or 1, it will have a position not null
export interface Channels {
    bitrate: number | null;
    createdAt: Generated<Date>;
    guildId: (this["id"] extends 0 | 1 ? null : number) | null;
    icon: string | null;
    id: number;
    isDeleted: Generated<boolean>;
    lastMessageId: number | null;
    lastPinTimestamp: Date | null;
    name: string | null;
    nsfw: number | null;
    ownerId: number | null;
    parentId: number | null;
    permissionOverwrites: JSONColumnType<PermissionOverwrites[]>;
    position: (this["id"] extends 0 | 1 ? null : number) | null;
    rateLimit: number | null;
    rtcRegion: string | null;
    topic: string | null;
    type: number;
    updatedAt: Generated<Date>;
    userLimit: number | null;
    videoQualityMode: string | null;
}

export interface Guilds {
    afkChannelId: number | null;
    afkTimeout: number | null;
    banner: string | null;
    createdAt: Generated<Date>;
    description: string | null;
    icon: string | null;
    id: number;
    isDeleted: Generated<boolean>;
    name: string;
    ownerId: number;
    systemChannelId: number | null;
    vanityUrl: string | null;
    vanityUrlUses: number | null;
    welcomeScreen: JSONColumnType<WelcomeScreens> | null;
}

export interface Roles {
    color: string;
    createdAt: Generated<Date>;
    guildId: number;
    hoist: Generated<boolean>;
    id: number;
    mentionable: Generated<boolean>;
    name: string;
    permissions: number;
    position: number;
}

export interface Invites {
    channelId: number;
    code: string;
    createdAt: Generated<Date>;
    expiresAt: Date;
    guildId: number | null;
    id: number;
    inviterId: number;
    maxAge: number;
    maxUses: number;
    temporary: boolean;
    uses: Generated<number>;
}

export interface Messages {
    attachments: JSONColumnType<Attachments[]>;
    authorId: number;
    channelId: number;
    content: string | null;
    createdAt: Generated<Date>;
    edited: Date | null;
    embeds: JSONColumnType<Embeds[]>;
    id: number;
    userMentions: JSONColumnType<number[]>;
    roleMentions: JSONColumnType<number[]>;
    channelMentions: JSONColumnType<number[]>;
    mentionEveryone: Generated<boolean>;
    messageReferenceId: number | null;
    pinned: Date | null;
    reactions: JSONColumnType<Reactions[]>;
    type: number;
}

export interface Emojis {
    animated: number;
    createdAt: Generated<Date>;
    guildId: number;
    id: number;
    name: string;
    url: string;
}

export interface Requests {
    requestedId: number;
    requesterId: number;
}

export interface Friends {
    A: number;
    B: number;
}

export interface Blocked {
    blockedId: number;
    blockerId: number;
}

export interface ChannelRecipients {
    channelId: number;
    isHidden: Generated<boolean>;
    userId: number;
}

export interface ChannelMessages {
    channelId: number;
    messageId: number;
}

export interface GuildMembers {
    guildId: number;
    userId: number;
    profile: JSONColumnType<MembersProfile>;
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
    blocked: Blocked;
    channelmessages: ChannelMessages;
    channelrecipients: ChannelRecipients;
    channels: Channels;
    emojis: Emojis;
    friends: Friends;
    guildmembers: GuildMembers;
    guilds: Guilds;
    invites: Invites;
    messages: Messages;
    requests: Requests;
    roles: Roles;
    users: Users;
    usermentions: UserMentions;
    rolementions: RoleMentions;
    channelmentions: ChannelMentions;
    messagereactions: MessageReactions;
}

// Types created manually

export interface Embeds {
    title: string;
    description: string;
    url: string;
    type: string;
    color: string;
    fields: {
        name: string;
        value: string;
        inline: number;
    }[];
    image: string;
    thumbnail: string;
    video: string;
    provider: string;
}

export interface Notes {
    id: number;
    note: string;
}

export interface Tokens {
    token: string;
    expires: number;
    userAgent: string;
    ip: string;
}

export interface Reactions {
    count: number;
    emojiId: number | null;
    emojiName: string | null;
    userIds: number[];
}

export interface Attachments {
    id: number;

    name: string;
    size: number;
    type: string;

    url: string;
    proxyUrl: string;

    height: number | null;
    width: number | null;

    spoiler: boolean;
    description: string;
}

export interface WelcomeScreens {
    title: string;
    description: string;
    welcomeChannels: number[];
    welcomeRoles: number[];
    imageUrl: string;
}

export interface MembersProfile {
    nickname: string;
    roles: number[];
    permissions: number;
    color: string;
    joinedAt: Date;
}

export interface PermissionOverwrites {
    roleId: number;
    allow: number;
    deny: number;
}
