// Enums

enum EPermissionType {
    TEST = 1,
}

enum EUserStatus {
    ONLINE = "ONLINE",
    IDLE = "IDLE",
    DO_NOT_DISTURB = "DO_NOT_DISTURB",
    INVISIBLE = "INVISIBLE",
    OFFLINE = "OFFLINE",
}

enum EChannelType {
    DM = 0,
    GROUP_DM = 1,
    GUILD_TEXT = 2,
    GUILD_VOICE = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    GUILD_THREAD = 6,
    FORUM = 7,
}

enum EMessageType {
    DEFAULT = 0,
    REPLY = 1,
    RECIPIENT_ADD = 2,
    RECIPIENT_REMOVE = 3,
    CALL = 4,
    CHANNEL_NAME_CHANGE = 5,
    CHANNEL_ICON_CHANGE = 6,
    CHANNEL_PINNED_MESSAGE = 7,
    USER_JOIN = 8,
}

enum ENotificationType {
    REQUEST = "REQUEST",
    MESSAGE = "MESSAGE",
    MENTION = "MENTION",
    CALL = "CALL",
    OTHER = "OTHER",
}

// Types

type TUser = readonly {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    phone?: string;

    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;

    description?: string;
    customStatus?: string;

    password: string;
    refreshToken?: string;

    status: EUserStatus;
    system: boolean;
    verified: boolean;

    notifications: TNotification[];

    guildIds: TGuild.id[];
    guilds?: TGuild[];

    channelIds: TChannel.id[];
    channels?: TChannel[];

    hiddenChannelIds: TChannel.id[];
    messages: TMessage[];

    mentionIds: TMessage.id[];
    mentions: TMessage[];

    friendIds: TUser.id[];
    friends?: TUser[];

    friendOfIds: TUser.id[];
    friendOf?: TUser[];

    requestReceivedIds: TUser.id[];
    requestsReceived?: TUser[];

    requestSentIds: TUser.id[];
    requestsSent?: TUser[];

    blockedUserIds: TUser.id[];
    blockedUsers?: TUser[];

    blockedByUserIds: TUser.id[];
    blockedByUsers?: TUser[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TCleanUser = readonly {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    phone?: string;

    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;

    description?: string;
    customStatus?: string;

    status: EUserStatus;
    system?: boolean;
    verified?: boolean;

    notifications?: TNotification[];

    guildIds: TGuild.id[];
    guilds?: TGuild[];

    channelIds: TChannel.id[];
    channels?: TChannel[];

    friendIds: TUser.id[];
    friends?: TUser[];

    requestReceivedIds?: TUser.id[];
    requestsReceived?: TUser[];

    requestSentIds?: TUser.id[];
    requestsSent?: TUser[];

    blockedUserIds?: TUser.id[];
    blockedUsers?: TUser[];

    blockedByUserIds?: TUser.id[];
    blockedByUsers?: TUser[];

    createdAt: DateTime;
};

type TSensitiveUser = readonly {
    id: string;
    username: string;
    displayName: string;

    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor: string;

    createdAt: DateTime;
};

type TGuild = readonly {
    id: string;
    name: string;
    icon?: string;
    banner?: string;
    description?: string;

    welcomeScreen?: TWelcomeScreen;
    vanityUrl?: string;
    vanityUrlUses?: number;
    invites?: TInvite[];

    systemChannelId?: TChannel.id;
    afkChannelId?: TChannel.id;
    afkTimout?: number;

    ownerId: TUser.id;

    rawMemberIds: TUser.id[];
    rawMembers: TUser[];

    members: TMember[];
    channels: TChannel[];
    roles: TRole[];
    emotes: TEmote[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TGuildMember = readonly {
    userId: TUser.id;
    nickname?: string;
    avatar?: string;
    rolesIds: TRole.id[];
    joinedAt: DateTime;
    deaf: boolean;
    mute: boolean;
    timeoutUntil?: DateTime;
    permissions: number[];
};

type TChannel = readonly {
    id: string;
    type: EChannelType;
    name?: string;
    topic?: string;
    icon?: string;

    nsfw?: boolean;
    position?: number;
    parentId?: TChannel.id;

    lastMessageId?: TMessage.id;
    lastPinTimestamp?: DateTime;

    rateLimit?: number;
    userLimit?: number;
    bitrate?: number;

    rtcRegion?: string;
    videoQualityMode?: string;

    ownerId?: TUser.id;

    guildId?: TGuild.id;
    guild?: TGuild;

    recipientIds: TUser.id[];
    recipients: TUser[];

    messages: TMessage[];

    permissionOverwrites: TPermissionOverwrite[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TMessage = readonly {
    id: string;
    type: EMessageType;
    content?: string;
    embeds: TEmbed[];

    edited: boolean;
    pinned?: DateTime;

    reactions: TReaction[];
    mentionEveryone: boolean;
    mentionChannelIds: TChannel.id[];
    mentionRoleIds: TRole.id[];

    mentionIds: TUser.id[];
    mentions: TUser[];

    authorId: TUser.id;
    author: TUser;

    channelId: TChannel.id;
    channel: TChannel;

    messageReferenceId?: TMessage.id;
    messageReference: TMessage;

    referencedBy: TMessage[];

    createdAt: DateTime;
    updatedAt: DateTime;

    error?: boolean;
    waiting?: boolean;
    needsToBeSent?: boolean;
    attachments: TAttachment[];
};

type TAttachment = {
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
    description?: string;
};

type TEmbed = readonly {
    author?: {
        name: string;
        url?: string;
        iconUrl?: string;
    };
    title?: string;
    url?: string;
    thumbnail?: string;
    description: string;
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[];
    image?: string;
    footer?: {
        text: string;
        icon?: string;
    };
    color?: string;
    timestamp?: Date;
};

type TInvite = readonly {
    id: string;
    code: string;
    uses: number;
    maxUses: number;
    maxAge: number;
    temporary: boolean;

    inviterId: TUser.id;
    inviter: TUser;

    guildId?: TGuild.id;
    guild?: TGuild;

    channelId: TChannel.id;
    channel: TChannel;

    expiresAt: DateTime?;
    createdAt: DateTime;
};

type TRole = readonly {
    id: string;
    name: string;
    color: string;
    permissions: string[];
    position: number;
    mentionable: boolean;

    guildId: TGuild.id;
    guild: TGuild;

    memberIds: TUser.id[];
    members: TUser[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TPermissionOverwrite = readonly {
    id: string;
    type: 0 | 1;
    allow: string[];
    deny: string[];
};

type TNotification = readonly {
    type: ENotification;
    senderId: TUser.id;
    channelId?: TChannel.id;
    content?: string;
    count: number;
    createdAt: Date;
};

type TReaction = readonly {
    count: number;

    messageId: TMessage.id;
    emoteId: TEmote.id;
    userIds: TUser.id[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type TEmote = readonly {
    id: string;
    name: string;
    url: string;
    animated: boolean;

    guildId: TGuild.id;
    guild: TGuild;

    createdAt: DateTime;
    updatedAt: DateTime;
};

type MessageEditObject = {
    messageId: TMessage.id;
    content: string;
};

type MessageReplyObject = {
    channelId: TChannel.id;
    messageId: TMessage.id;
    author: TUser;
};

// Context

type TAuth = null | {
    user: TUser;
    accessToken: string;
};

type AuthProviderValue = {
    auth: TAuth;
    setAuth: Dispatch<SetStateAction<TAuth>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};
