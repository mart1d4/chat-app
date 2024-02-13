import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
    [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export interface Blocked {
    blockedId: number;
    blockerId: number;
}

export interface Channelmessages {
    channelId: number;
    messageId: number;
}

export interface Channelrecipients {
    channelId: number;
    isHidden: Generated<number>;
    userId: number;
}

export interface Channels {
    bitrate: number | null;
    createdAt: Generated<Date>;
    guildId: number | null;
    icon: string | null;
    id: number;
    isDeleted: Generated<number>;
    lastMessageId: number | null;
    lastPinTimestamp: Date | null;
    name: string | null;
    nsfw: number | null;
    ownerId: number | null;
    parentId: number | null;
    permissionOverwrites: Json;
    position: number | null;
    rateLimit: number | null;
    rtcRegion: string | null;
    topic: string | null;
    type: number;
    updatedAt: Generated<Date>;
    userLimit: number | null;
    videoQualityMode: string | null;
}

export interface Emojis {
    animated: Generated<number>;
    createdAt: Generated<Date>;
    guildId: number;
    id: number;
    name: string;
    url: string;
}

export interface Friends {
    A: number;
    B: number;
}

export interface Guildmembers {
    guildId: number;
    userId: number;
}

export interface Guilds {
    afkChannelId: number | null;
    afkTimeout: number | null;
    banner: string | null;
    createdAt: Generated<Date>;
    description: string | null;
    icon: string | null;
    id: number;
    isDeleted: Generated<number>;
    members: Json;
    name: string;
    ownerId: number;
    systemChannelId: number | null;
    vanityUrl: string | null;
    vanityUrlUses: number | null;
    welcomeScreen: Json | null;
}

export interface Invites {
    channelId: number;
    code: string;
    createdAt: Generated<Date>;
    expiresAt: Date;
    guildId: number | null;
    id: number;
    inviterId: number;
    maxAge: Generated<number>;
    maxUses: Generated<number>;
    temporary: Generated<number>;
    uses: Generated<number>;
}

export interface Messages {
    attachments: Json | null;
    authorId: number;
    channelId: number;
    content: string | null;
    createdAt: Generated<Date>;
    edited: Date | null;
    embeds: Json | null;
    id: number;
    mentionChannelIds: Json | null;
    mentionEveryone: Generated<number>;
    mentionRoleIds: Json | null;
    mentions: Json | null;
    messageReferenceId: number | null;
    pinned: Date | null;
    reactions: Json | null;
    type: number;
}

export interface Requests {
    requestedId: number;
    requesterId: number;
}

export interface Roles {
    color: Generated<string>;
    createdAt: Generated<Date>;
    guildId: number;
    hoist: Generated<number>;
    id: number;
    mentionable: Generated<number>;
    name: string;
    permissions: Json;
    position: number;
}

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
    isDeleted: Generated<number>;
    notes: Json;
    notifications: Json;
    password: string;
    phone: string | null;
    primaryColor: string;
    refreshTokens: Json;
    status: Generated<"dnd" | "idle" | "invisible" | "offline" | "online">;
    system: Generated<number>;
    username: string;
    verified: Generated<number>;
}

export interface DB {
    blocked: Blocked;
    channelmessages: Channelmessages;
    channelrecipients: Channelrecipients;
    channels: Channels;
    emojis: Emojis;
    friends: Friends;
    guildmembers: Guildmembers;
    guilds: Guilds;
    invites: Invites;
    messages: Messages;
    requests: Requests;
    roles: Roles;
    users: Users;
}
