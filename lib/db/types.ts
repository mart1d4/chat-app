import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
    users: UserTable;
    guilds: GuildTable;
    channels: ChannelTable;
    messages: MessageTable;
    invites: InviteTable;
    roles: RoleTable;
    emotes: EmoteTable;
}

export interface Notification {
    type: 0 | 1 | 2 | 3 | 4;
    content: string | null;
    count: number;

    senderId: number;
    channelId: number | null;

    createdAt: Generated<Date>;
}

export interface UserTable {
    id: number;
    username: string;
    displayName: string;
    email: string | null;
    phone: string | null;

    avatar: string;
    banner: string | null;
    primaryColor: string;
    accentColor: string;

    description: string | null;
    customStatus: string | null;

    password: string;
    refreshTokens: string[];
    hiddenChannelIds: number[] | null;

    status: "online" | "idle" | "dnd" | "offline" | "invisible";
    system: boolean;
    verified: boolean;

    notifications: Notification[];

    guildIds: number[];
    channelIds: number[];
    friendIds: number[];
    requestIds: number[];
    blockedIds: number[];

    createdAt: Generated<Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface WelcomeScreen {
    title: string;
    subtitle: string;
    content: string[];

    links: string[];
    buttons: {
        text: string;
        color: string;
        url: string | null;
    }[];

    primaryColor: string | null;
    accentColor: string | null;

    backgroundUrl: string | null;
}

export interface GuildMember {
    userId: number;
    nickname: string | null;
    avatar: string | null;
    roleIds: number[];

    deaf: boolean;
    mute: boolean;
    timeoutUntil: Date | null;

    joinedAt: Generated<Date>;
}

export interface GuildTable {
    id: number;
    name: string;
    icon: string | null;
    banner: string | null;
    description: string | null;

    welcome_screen: WelcomeScreen | null;
    vanityUrl: string | null;
    vanityUrl_uses: number;
    inviteIds: number[];

    systemChannelId: number | null;
    afkChannelId: number | null;
    afkTimeout: number;

    ownerId: number;
    userIds: number[];
    members: GuildMember[];

    channelIds: number[];
    roleIds: number[];
    emoteIds: number[];

    createdAt: Generated<Date>;
}

export type Guild = Selectable<GuildTable>;
export type NewGuild = Insertable<GuildTable>;
export type GuildUpdate = Updateable<GuildTable>;

export interface PermissionOverwrite {
    id: string;
    type: 0 | 1;
    allow: string[];
    deny: string[];
}

export interface ChannelTable {
    id: number;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    name: string | null;
    topic: string | null;
    icon: string | null;

    nsfw: boolean;
    position: number | null;
    parentId: number | null;

    lastMessageId: number | null;
    lastPinTimestamp: Date | null;

    rateLimit: number | null;
    userLimit: number | null;
    bitrate: number | null;

    rtcRegion: string | null;
    videoQualityMode: string | null;

    ownerId: number | null;
    guildId: number | null;

    recipientIds: number[] | null;

    permissionOverwrites: PermissionOverwrite[] | null;

    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

export type Channel = Selectable<ChannelTable>;
export type NewChannel = Insertable<ChannelTable>;
export type ChannelUpdate = Updateable<ChannelTable>;

export interface Attachment {
    id: string;
    url: string;
    name: string;

    dimensions: {
        width: number;
        height: number;
    };
    size: number;

    isSpoiler: boolean;
    isImage: boolean;

    description: string | null;
}

export interface Embed {
    author: {
        name: string;
        url: string | null;
        iconUrl: string | null;
    } | null;

    title: string | null;
    url: string | null;
    thumbnail: string | null;
    description: string;

    fields:
        | {
              name: string;
              value: string;
              inline: boolean;
          }[]
        | null;

    image: string | null;
    footer: {
        text: string;
        icon: string | null;
    } | null;

    color: string | null;
    timestamp: Date | null;
}

export interface Reaction {
    count: number;
    emoteId: number;
    userIds: number[];
}

export interface MessageTable {
    id: number;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    content: string | null;
    attachments: Attachment[];
    embeds: Embed[];

    edited: Date | null;
    pinned: Date | null;

    reactions: Reaction[];
    mentionEveryone: boolean;
    mentionChannelIds: number[];
    mentionRoleIds: number[];
    mentionIds: number[];

    authorId: number;
    channelId: number;

    messageReferenceId: number | null;

    createdAt: Generated<Date>;
}

export type Message = Selectable<MessageTable>;
export type NewMessage = Insertable<MessageTable>;
export type MessageUpdate = Updateable<MessageTable>;

export interface InviteTable {
    id: number;
    code: string;
    uses: number;
    max_uses: number;
    maxAge: number;
    temporary: boolean;

    inviterId: number;
    channelId: number;
    guildId: number | null;

    expiresAt: Generated<Date>;
    createdAt: Generated<Date>;
}

export type Invite = Selectable<InviteTable>;
export type NewInvite = Insertable<InviteTable>;
export type InviteUpdate = Updateable<InviteTable>;

export interface RoleTable {
    id: number;
    name: string;
    color: string;
    permissions: string[];
    position: number;
    mentionable: boolean;

    guildId: number;
    memberIds: number[];

    createdAt: Generated<Date>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;

export interface EmoteTable {
    id: number;
    name: string;
    url: string;
    animated: boolean;

    guildId: number;

    createdAt: Generated<Date>;
}

export type Emote = Selectable<EmoteTable>;
export type NewEmote = Insertable<EmoteTable>;
export type EmoteUpdate = Updateable<EmoteTable>;
