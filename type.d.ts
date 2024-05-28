import type {
    GuildMembers,
    Guilds,
    Invites,
    MembersProfile,
    Messages,
    Roles,
    Users,
    Channels,
    Attachments,
    Embeds,
} from "./lib/db/types";
import type { Selectable } from "kysely";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type MessageAuthor = Partial<Selectable<Users>> &
    Pick<Users, "id" | "displayName" | "avatar">;

export type Attachment = Attachments & {
    file: File;
};

export type Message = {
    id: number;
    type: number;
    content: string | null;

    attachments: Attachments[];
    embeds: Embeds[];

    edited: Date | null;
    pinned: boolean;

    channelId: number;
    createdAt: Date;

    author: MessageAuthor;
    userMentions: MessageAuthor[];
    reference: Message | null;

    loading?: boolean;
    error?: boolean;
    send?: boolean;

    functions?: {
        edit: (string) => Promise<void>;
        delete: () => Promise<void>;
        pin: () => Promise<void>;
        unpin: () => Promise<void>;
        editState: () => void;
        replyState: () => void;
        deleteLocal: () => void;
        deletePopup: () => void;
        pinPopup: () => void;
        unpinPopup: () => void;
        copyText: () => Promise<void>;
        copyLink: () => Promise<void>;
        copyId: () => Promise<void>;
        speak: () => Promise<void>;
        translate: () => Promise<void>;
        report: () => void;
        retry: () => void;
    };
};

export type InviteGuild = Partial<Selectable<Guilds>> &
    Pick<Guilds, "id" | "name" | "icon"> & {
        memberCount: {
            all: number;
            online: number;
        };
    };

export type InviteChannel = Partial<Selectable<Channels>> & Pick<Channels, "id" | "name">;

export type Invite = Partial<Selectable<Invites>> &
    Pick<Invites, "id" | "code"> & {
        guild: InviteGuild | null;
        channel: InviteChannel;
    };

export type GuildMemberRole = Partial<Selectable<Roles>> & Pick<Roles, "id" | "name" | "color">;

export type GuildMember = Partial<Selectable<Users>> &
    Pick<Users, "id" | "displayName" | "avatar"> & {
        profile: {
            nickname: string;
            roles: GuildMemberRole[];
            permissions: number;
            color: string;
            joinedAt: Date;
        };
    };

export type GuildChannel = Partial<Selectable<Channels>> &
    Pick<Channels, "id" | "name" | "topic" | "position" | "parentId">;

export type Guild = Pick<Guilds, "id" | "name" | "icon" | "systemChannelId"> & {
    members: GuildMember[];
    channels: GuildChannel[];
};

export type ChannelRecipient = Pick<
    Users,
    "id" | "displayName" | "avatar" | "status" | "customStatus"
>;

export type Channel = Pick<Channels, "id" | "type" | "name" | "icon"> & {
    recipients: ChannelRecipient[];
};

export type User = Pick<
    Users,
    | "id"
    | "username"
    | "displayName"
    | "avatar"
    | "banner"
    | "primaryColor"
    | "accentColor"
    | "description"
    | "status"
    | "customStatus"
>;
