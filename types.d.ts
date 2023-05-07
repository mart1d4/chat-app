//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//

type UncleanUserType = {
    _id: string;
    username: string;
    password: string;
    avatar: string;
    banner?: string;
    description?: string;
    customStatus?: string;
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb';
    accentColor: string;
    system: boolean;
    verified: boolean;
    requests: {
        user: string;
        type: 0 | 1;
    }[];
    friends: string[];
    blocked: string[];
    channels: string[];
    guilds: string[];
    createdAt: Date;
    updatedAt: Date;
    accessToken?: string;
    refreshToken?: string;
};

type UserType = {
    _id: string;
    username: string;
    avatar: string;
    banner?: string;
    description?: string;
    customStatus?: string;
    status: 'Online' | 'Offline' | 'Idle' | 'Do Not Disturb';
    accentColor: string;
    system: boolean;
    verified: boolean;
    requests: {
        user: string;
        type: 0 | 1;
    }[];
    friends: string[];
    blocked: string[];
    channels: string[];
    guilds: string[];
    createdAt: Date;
};

type ChannelType = {
    _id: string;
    recipients: string[];
    type: 0 | 1 | 2 | 3 | 4;
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
    _id: string;
};

type MessageType = {
    _id: string;
};

type PermissionType = {
    _id: string;
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
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
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
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
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
