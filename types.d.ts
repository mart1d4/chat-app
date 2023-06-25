//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//

type UserType = {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor?: string;
    description?: string;
    customStatus?: string;
    password: string;
    refreshToken?: string;
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb' | 'Invisible';
    system: boolean;
    verified: boolean;
    notifications: {
        type?: string;
        message?: string;
        channel?: string;
        count?: number;
        new?: boolean;
    }[];

    guildIds: string[];
    guilds?: GuildType[];

    ownedGuildIds: string[];
    ownedGuilds?: GuildType[];

    channelIds: string[];
    channels?: ChannelType[];

    ownedChannelIds: string[];
    ownedChannels?: ChannelType[];

    messages?: MessageType[];

    friendIds: string[];
    friends?: User[];

    friendOfIds: string[];
    friendOf?: User[];

    requestReceivedIds: string[];
    requestsReceived?: User[];

    requestSentIds: string[];
    requestsSent?: User[];

    blockedUserIds: string[];
    blockedUsers?: User[];

    blockedByUserIds: string[];
    blockedByUsers?: User[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type CleanUserType = {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor?: string;
    description?: string;
    customStatus?: string;
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb' | 'Invisible';
    system: boolean;
    verified: boolean;
    notifications: {
        type?: string;
        message?: string;
        channel?: string;
        count?: number;
        new?: boolean;
    }[];

    guildIds: string[];
    guilds?: GuildType[];

    ownedGuildIds: string[];
    ownedGuilds?: GuildType[];

    channelIds: string[];
    channels?: ChannelType[];

    ownedChannelIds: string[];
    ownedChannels?: ChannelType[];

    friendIds: string[];
    friends?: User[];

    requestReceivedIds: string[];
    requestsReceived?: User[];

    requestSentIds: string[];
    requestsSent?: User[];

    blockedUserIds: string[];
    blockedUsers?: User[];

    createdAt: DateTime;
    updatedAt: DateTime;
};

type CleanOtherUserType = {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    banner?: string;
    primaryColor: string;
    accentColor?: string;
    description?: string;
    customStatus?: string;
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb' | 'Invisible';
    system: boolean;

    guildIds: string[];
    channelIds: string[];
    friendIds: string[];

    createdAt: DateTime;
};

type ChannelType = {
    id: string;
    recipients: CleanOtherUserType[];
    type: 'DM' | 'GROUP_DM' | 'GUILD_TEXT' | 'GUILD_VOICE' | 'GUILD_CATEGORY';
    guild: GuildType._id;
    position?: number;
    name: string;
    topic?: string;
    nsfw?: boolean;
    icon?: string;
    owner?: UserType._id;
    rateLimit?: number;
    permissions?: string[];
    parent?: ChannelType._id;
    messages: string[];
    pinnedMessages: string[];
    createdAt: Date;
};

type GuildType = {
    id: string;
    name: string;
    icon: string;
    banner?: string;
    members: CleanOtherUserType[];
    channels: ChannelType[];
    ownerId: string;
    createdAt: DateTime;
    updatedAt: DateTime;
};

type MessageType = {
    id: string;
    type:
        | 'DEFAULT'
        | 'REPLY'
        | 'RECIPIENT_ADD'
        | 'RECIPIENT_REMOVE'
        | 'CALL'
        | 'CHANNEL_NAME_CHANGE'
        | 'CHANNEL_ICON_CHANGE'
        | 'CHANNEL_PINNED_MESSAGE'
        | 'GUILD_MEMBER_JOIN'
        | 'OWNER_CHANGE';
    content: string;
    attachments: string[];
    embeds: string[];
    messageReference?: string | MessageType;
    edited: boolean;
    pinned: boolean;
    reactions: string[];
    mentionEveryone: boolean;
    mentionChannelIds: string[];
    mentionRoleIds: string[];
    mentionUserIds: string[];

    authorId: string;
    author: CleanOtherUserType;

    channelId: string;
    channel: ChannelType;

    createdAt: Date;
    updatedAt: Date;

    // Not in database
    waiting?: boolean;
    error?: boolean;
};

//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//

// AuthProvider

type AuthObjectType = null | {
    user: UserType;
    accessToken: string;
};

type AuthContextValueType = null | {
    auth: AuthObjectType;
    setAuth: Dispatch<SetStateAction<AuthObjectType>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

// LayerProvider

type UserProfileObjectType = null | {};

type PopupObjectType = null | {};

type FixedLayerObjectType = {
    type: string;
    event: MouseEvent;
    element: Element;
    firstSide: string;
    secondSide: string;
    gap: number;
};

type LayerContextValueType = null | {
    showSettings: boolean | {};
    setShowSettings: Dispatch<SetStateAction<boolean | {}>>;
    userProfile: UserProfileObjectType;
    setUserProfile: Dispatch<SetStateAction<UserProfileObjectType>>;
    popup: PopupObjectType;
    setPopup: Dispatch<SetStateAction<PopupObjectType>>;
    fixedLayer: null | FixedLayerObjectType;
    setFixedLayer: (content: null | FixedLayerObjectType) => void;
};

// SettingsProvider

type UserSettingsObjectType = null | {
    language: string;
    microphone: boolean;
    sound: boolean;
    camera: boolean;
    notifications: boolean;
    appearance: string;
    font: string;
    theme: string;
    friendTab: 'all' | 'online' | 'add' | 'pending' | 'blocked';
    sendButton: boolean;
    showUsers: boolean;
};

type UserSettingsContextValueType = null | {
    userSettings: UserSettingsObjectType;
    setUserSettings: Dispatch<SetStateAction<UserSettingsObjectType>>;
};

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//
