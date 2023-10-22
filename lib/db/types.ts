import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
    users: UserTable;
    guilds: GuildTable;
    channels: ChannelTable;
    messages: MessageTable;
    invites: InviteTable;
    roles: RoleTable;
    emotes: EmojiTable;
    friends: FriendTable;
    blocked: BlockedTable;
    requests: RequestTable;
    channelmessages: ChannelMessageTable;
    channelrecipients: ChannelRecipientTable;
    guildmembers: GuildMembersTable;
}

// Tables

export interface RefreshToken {
    token: string;
    expires: Date;
}

export interface Note {
    userId: number;
    content: string;
}

export interface Notification {
    type: 0 | 1 | 2 | 3 | 4;

    content: string | null;
    count: number;

    userId: number | null;
    channelId: number | null;
    guildId: number | null;

    createdAt: Date;
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
    status: "online" | "idle" | "dnd" | "offline" | "invisible";

    password: string;
    refreshTokens: RefreshToken[];

    system: boolean;
    verified: boolean;

    notes: Note[];
    notifications: Notification[];
    hiddenChannelIds: number[];

    createdAt: Generated<Date>;
    isDeleted: boolean;
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

    systemChannelId: number | null;
    afkChannelId: number | null;
    afkTimeout: number | null;

    vanityUrl: string | null;
    vanityUrl_uses: number | null;
    welcome_screen: JSON | null;

    ownerId: number;
    members: JSON;

    createdAt: Generated<Date>;
    isDeleted: boolean;
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
    nsfw: boolean | null;

    position: number | null;
    parentId: number | null;

    lastMessageId: number | null;
    lastPinTimestamp: Date | null;

    bitrate: number | null;
    rateLimit: number | null;
    userLimit: number | null;

    rtcRegion: string | null;
    videoQualityMode: string | null;

    ownerId: number | null;
    guildId: number | null;

    permissionOverwrites: JSON;

    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    isDeleted: boolean;
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
    attachments: JSON | null;
    embeds: JSON | null;

    edited: Date | null;
    pinned: Date | null;

    reactions: JSON | null;
    messageReferenceId: number | null;

    mentionIds: number[] | null;
    mentionRoleIds: number[] | null;
    mentionChannelIds: number[] | null;
    mentionEveryone: boolean;

    authorId: number;
    channelId: number;

    createdAt: Generated<Date>;
}

export type Message = Selectable<MessageTable>;
export type NewMessage = Insertable<MessageTable>;
export type MessageUpdate = Updateable<MessageTable>;

export interface InviteTable {
    id: number;

    code: string;
    uses: number;
    temporary: boolean;

    maxAge: number;
    maxUses: number;

    inviterId: number;
    channelId: number;
    guildId: number | null;

    expiresAt: Date;
    createdAt: Generated<Date>;
}

export type Invite = Selectable<InviteTable>;
export type NewInvite = Insertable<InviteTable>;
export type InviteUpdate = Updateable<InviteTable>;

export interface RoleTable {
    id: number;

    name: string;
    color: string;

    hoist: boolean;
    position: number;

    permissions: JSON;
    mentionable: boolean;

    guildId: number;

    createdAt: Generated<Date>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;

export interface EmojiTable {
    id: number;

    name: string;
    url: string;
    animated: boolean;

    guildId: number;

    createdAt: Generated<Date>;
}

export type Emote = Selectable<EmojiTable>;
export type NewEmote = Insertable<EmojiTable>;
export type EmoteUpdate = Updateable<EmojiTable>;

// Relations

export interface RequestTable {
    requesterId: number;
    requestedId: number;
}

export type Request = Selectable<RequestTable>;
export type NewRequest = Insertable<RequestTable>;
export type RequestUpdate = Updateable<RequestTable>;

export interface FriendTable {
    A: number;
    B: number;
}

export type Friend = Selectable<FriendTable>;
export type NewFriend = Insertable<FriendTable>;
export type FriendUpdate = Updateable<FriendTable>;

export interface BlockedTable {
    blockerId: number;
    blockedId: number;
}

export type Blocked = Selectable<BlockedTable>;
export type NewBlocked = Insertable<BlockedTable>;
export type BlockedUpdate = Updateable<BlockedTable>;

export interface ChannelMessageTable {
    channelId: number;
    messageId: number;
}

export type ChannelMessage = Selectable<ChannelMessageTable>;
export type NewChannelMessage = Insertable<ChannelMessageTable>;
export type ChannelMessageUpdate = Updateable<ChannelMessageTable>;

export interface ChannelRecipientTable {
    channelId: number;
    userId: number;
}

export type ChannelRecipient = Selectable<ChannelRecipientTable>;
export type NewChannelRecipient = Insertable<ChannelRecipientTable>;
export type ChannelRecipientUpdate = Updateable<ChannelRecipientTable>;

export interface GuildMembersTable {
    guildId: number;
    userId: number;
}

export type GuildMembers = Selectable<GuildMembersTable>;
export type NewGuildMembers = Insertable<GuildMembersTable>;
export type GuildMembersUpdate = Updateable<GuildMembersTable>;
