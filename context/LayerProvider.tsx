'use client';

import { ReactElement, ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';

export const LayerContext = createContext<ProviderValue | null>(null);

enum EPopupType {
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    PIN_MESSAGE = 'PIN_MESSAGE',
    UNPIN_MESSAGE = 'UNPIN_MESSAGE',
    UPDATE_USERNAME = 'UPDATE_USERNAME',
    UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

enum EFixedLayerType {
    MENU = 'MENU',
    POPOUT = 'POPOUT',
    USER_CARD = 'USER_CARD',
}

enum EDirection {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
}

type TSettings = boolean | { type: string };

type TUserProfile = null | {
    user: TCleanUser;
    focusNote?: boolean;
};

type TPopup = null | {
    type: EPopupType;
    channelId?: string;
    message?: TMessage;
};

type TFixedLayer = null | {
    type: EFixedLayerType;
    element?: HTMLElement;
    event?: {
        mouseX: number;
        mouseY: number;
    };
    firstSide?: EDirection;
    secondSide?: EDirection;
    gap?: number;
};

type ProviderValue = {
    userProfile: TUserProfile;
    setUserProfile: (content: TUserProfile) => void;
    showSettings: TSettings;
    setShowSettings: Dispatch<SetStateAction<TSettings>>;
    fixedLayer: TFixedLayer;
    setFixedLayer: (content: TFixedLayer) => void;
    popup: TPopup;
    setPopup: Dispatch<SetStateAction<TPopup>>;
};

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [userProfile, setUserProfile2] = useState<TUserProfile>(null);
    const [showSettings, setShowSettings] = useState<TSettings>(false);
    const [fixedLayer, setFixedLayer2] = useState<TFixedLayer>(null);
    const [popup, setPopup] = useState<TPopup>(null);

    const setUserProfile = (content: TUserProfile) => {
        setUserProfile2(null);
        content && setTimeout(() => setUserProfile2(content), 100);
    };

    const setFixedLayer = (content: TFixedLayer) => {
        setFixedLayer2(null);
        content && setTimeout(() => setFixedLayer2(content), 10);
    };

    const value: ProviderValue = {
        userProfile,
        setUserProfile,
        showSettings,
        setShowSettings,
        fixedLayer,
        setFixedLayer,
        popup,
        setPopup,
    };

    return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export default LayerProvider;
