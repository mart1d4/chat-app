import { Selectable } from "kysely";
import {
    Channels,
    Messages,
    Invites,
    Guilds,
    Emojis,
    Embeds,
    Roles,
    Users,
} from "@lib/db/db.type.js";

// Environment variables
declare module "bun" {
    interface Env {
        BASE_URL: string;
        NEXT_PUBLIC_API_URL: string;

        DB_NAME: string;
        DB_HOST: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_PORT: number;
        DB_CONNECTION_LIMIT: number;

        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        EMAIL_TOKEN_SECRET: string;

        NEXT_PUBLIC_CDN_URL: string;
        UPLOADTHING_TOKEN: string;

        RESEND_TOKEN: string;
        NEXT_PUBLIC_PUSHER_KEY: string;
    }
}

// User

export type User = Selectable<Users>;
export type OptionalUser = Partial<User>;

export type KnownUser = Pick<
    User,
    "id" | "displayName" | "username" | "avatar" | "customStatus" | "status"
>;

export type UnknownUser = Pick<User, "id" | "displayName" | "avatar">;

export type UserProfile = Pick<
    User,
    | "id"
    | "username"
    | "displayName"
    | "avatar"
    | "banner"
    | "description"
    | "customStatus"
    | "status"
    | "bannerColor"
    | "accentColor"
    | "createdAt"
    | "system"
>;

export type MutualFriend = Pick<User, "id" | "displayName" | "username" | "avatar" | "status">;

export type MutualGuild = Pick<Guild, "id" | "name" | "icon" | "ownerId" | "systemChannelId">;

export type AppUser = UserProfile & { email: string; phone: string; twoFactorEnabled: boolean };

// Channel

export type Channel = Selectable<Channels>;
export type OptionalChannel = Partial<Channel>;

export type DMChannel = Pick<Channel, "id" | "type" | "name" | "icon" | "topic" | "ownerId">;

export type ChannelRecipient = Pick<
    User,
    "id" | "displayName" | "username" | "avatar" | "customStatus" | "status"
> & {
    dbStatus: string;
};

export type DMChannelWithRecipients = DMChannel & {
    recipients: ChannelRecipient[];
};

export type GuildChannel = Pick<
    Channel,
    "id" | "type" | "name" | "topic" | "position" | "parentId" | "nsfw" | "permissionOverwrites"
> & {
    isPrivate: boolean;
};

export type GuildChannelRecipient = Pick<
    User,
    "id" | "username" | "displayName" | "avatar" | "status"
>;

// Guild

export type Guild = Selectable<Guilds>;
export type OptionalGuild = Partial<Guild>;

export type UserGuild = Pick<Guild, "id" | "name" | "icon" | "systemChannelId" | "ownerId"> & {
    roles: GuildRole[];
    members: (GuildMember & {
        dbStatus: string;
    })[];
    channels: GuildChannel[];
};

export type GuildMember = Pick<User, "id" | "displayName" | "avatar" | "status"> & {
    nickname: string | null;
    roles: number[];
    permissions: bigint;
    joinedAt: Date;
};

// Message

export type Message = Selectable<Messages>;
export type OptionalMessage = Partial<Message>;

export type ResponseMessage = Pick<
    Message,
    "id" | "type" | "content" | "embeds" | "edited" | "pinned" | "mentionEveryone" | "createdAt"
> & {
    author: Pick<User, "id" | "displayName" | "avatar">;
    reference:
        | (Pick<Message, "id" | "type" | "content" | "attachments" | "embeds" | "edited"> & {
              author: Pick<User, "id" | "displayName" | "avatar">;
          })
        | null;
    mentions: Pick<User, "id" | "displayName" | "avatar">[];
    channelMentions: Pick<Channel, "id" | "name" | "icon">[];
    attachments: Attachment[];
    reactions: { id: number | null; name: string; count: number; me: boolean }[];
};

export type LocalMessage = Omit<ResponseMessage, "attachments"> & {
    attachments: (Attachment & {
        file: File;
        url: string;
    })[];
    local: boolean;
    error: boolean;
};

type IfImageOrVideo<T, V> = T["type"] extends "image" | "video" ? V : null;

export type Attachment = {
    id: string;
    type: "image" | "video" | "audio" | "file";

    ext: string;
    size: number;
    filename: string;
    spoiler: boolean;
    description: string;
    voiceMessage: boolean;

    height: IfImageOrVideo<this, number>;
    width: IfImageOrVideo<this, number>;
};

// Emoji

export type Emoji = Selectable<Emojis>;
export type OptionalEmoji = Partial<Emoji>;

// Role

export type Role = Selectable<Roles>;
export type OptionalRole = Partial<Role>;

export type GuildRole = Pick<
    Role,
    "id" | "name" | "color" | "position" | "hoist" | "permissions" | "everyone"
>;

// Invite

export type Invite = Selectable<Invites>;
export type OptionalInvite = Partial<Invite>;

export type ChannelInvite = Pick<
    Invite,
    "code" | "uses" | "maxUses" | "expiresAt" | "inviterId"
> & {
    channel: Pick<Channel, "id" | "name" | "icon">;
    guild: Pick<Guild, "id" | "name" | "icon"> | null;
    recipients: Pick<User, "username" | "status">[];
};
