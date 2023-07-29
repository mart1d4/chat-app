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

type TTooltip = null | {
    text: string;
    element: HTMLElement;
    position: 'top' | 'bottom' | 'left' | 'right';
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
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
    showSettings: TSettings;
    fixedLayer: TFixedLayer;
    tooltip: TTooltip;
    popup: TPopup;
    setUserProfile: (content: TUserProfile) => void;
    setShowSettings: Dispatch<SetStateAction<TSettings>>;
    setFixedLayer: (content: TFixedLayer) => void;
    setTooltip: Dispatch<SetStateAction<TTooltip>>;
    setPopup: Dispatch<SetStateAction<TPopup>>;
};

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [userProfile, setUserProfile2] = useState<TUserProfile>(null);
    const [showSettings, setShowSettings] = useState<TSettings>(false);
    const [fixedLayer, setFixedLayer2] = useState<TFixedLayer>(null);
    const [tooltip, setTooltip] = useState<TTooltip>(null);
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
        showSettings,
        fixedLayer,
        tooltip,
        popup,
        setUserProfile,
        setShowSettings,
        setFixedLayer,
        setTooltip,
        setPopup,
    };

    return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export default LayerProvider;
