//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//

type UncleanUserType= {
    _id?: string;
    username: string;
    password: string;
    avatar: string;
    banner: undefined | string;
    description: undefined | string;
    customStatus: undefined | string;
    status: "Online" | "Offline" | "Idle" | "Do Not Disturb";
    accentColor: string;
    system: boolean;
    verified: boolean;
    requests: {
            user: UserType;
            type: 0 | 1;
        }[];
    friends: UserType[];
    blocked: UserType[];
    channels: ChannelType[];
    guilds: GuildType[];
    createdAt?: Date;
    updatedAt?: Date;
    accessToken?: string | null;
    refreshToken: string | null;
};

type UserType = {
    _id: string;
    username: string;
    avatar: string;
    banner: undefined | string;
    description: undefined | string;
    customStatus: undefined | string;
    status: "Online" | "Offline" | "Idle" | "Do Not Disturb";
    accentColor: string;
    system: boolean;
    verified: boolean;
    requests: {
            user: UserType;
            type: 0 | 1;
        }[];
    friends: UserType[];
    blocked: UserType[];
    channels: ChannelType[];
    guilds: GuildType[];
    createdAt: Date;
};

type ChannelType = {
    _id: string;
};

type GuildType = {
    _id: string;
};

type MessageType = {
    _id: string;
};

//#//#//#//#//#//#//
// Database Types //
//#//#//#//#//#//#//



//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//

type AuthObjectType = {
    user?: UserType;
    accessToken?: string;
};

type AuthContextType = undefined | {
    auth: AuthType;
    setAuth: Dispatch<SetStateAction<AuthObjectType>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
};

//#//#//#//#//#//#//
// Context. Types //
//#//#//#//#//#//#//
