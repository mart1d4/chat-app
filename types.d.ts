// Enums

// enum EChannelType {
//     DM = 0,
//     GROUP_DM = 1,
//     GUILD_TEXT = 2,
//     GUILD_VOICE = 3,
//     GUILD_CATEGORY = 4,
//     GUILD_ANNOUNCEMENT = 5,
//     GUILD_THREAD = 6,
//     FORUM = 7,
// }

// enum EMessageType {
//     DEFAULT = 0,
//     REPLY = 1,
//     RECIPIENT_ADD = 2,
//     RECIPIENT_REMOVE = 3,
//     CALL = 4,
//     CHANNEL_NAME_CHANGE = 5,
//     CHANNEL_ICON_CHANGE = 6,
//     CHANNEL_PINNED_MESSAGE = 7,
//     USER_JOIN = 8,
// }

// enum ENotificationType {
//     REQUEST = "REQUEST",
//     MESSAGE = "MESSAGE",
//     MENTION = "MENTION",
//     CALL = "CALL",
//     OTHER = "OTHER",
// }

// Types

type GuildMember = readonly {
    userId: number;
    nickname?: string | null;
    avatar: string | null;
    rolesIds: JSON;
    joinedAt: DateTime;
    deaf: boolean;
    mute: boolean;
    timeoutUntil: DateTime | null;
    permissions: number[];
};

type Attachment = {
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
};

type Embed = readonly {
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
};

type PermissionOverwrite = readonly {
    id: number;
    type: 0 | 1;
    allow: JSON;
    deny: JSON;
};

type Notification = readonly {
    type: number;
    senderId: number;
    channelId: number | null;
    content: string | null;
    count: number;
    createdAt: Date;
};

type Reaction = readonly {
    count: number;

    messageId: number;
    emoteId: number;
    userIds: JSON;

    createdAt: DateTime;
    updatedAt: DateTime;
};
