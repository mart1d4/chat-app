'use client';

import { ReactElement, ReactNode, createContext, useEffect, useState, Dispatch, SetStateAction } from 'react';

type TSettings = {
    language: string;
    microphone: boolean;
    sound: boolean;
    camera: boolean;
    appearance: string;
    font: string;
    theme: string;
    friendTab: string;
    sendButton: boolean;
    showUsers: boolean;
};

type ProviderValue = {
    userSettings: TSettings;
    setUserSettings: Dispatch<SetStateAction<TSettings>>;
};

export const SettingsContext = createContext<ProviderValue | null>(null);

const SettingsProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [userSettings, setUserSettings] = useState<TSettings>({
        language: 'en-US',
        microphone: false,
        sound: true,
        camera: false,
        appearance: 'default',
        font: 'default',
        theme: 'dark',
        friendTab: 'add',
        sendButton: false,
        showUsers: true,
    });

    useEffect(() => {
        const userSettingsLocal = localStorage.getItem('user-settings');
        if (userSettingsLocal) setUserSettings(JSON.parse(userSettingsLocal));
    }, []);

    useEffect(() => {
        if (!userSettings) return;
        localStorage.setItem('user-settings', JSON.stringify(userSettings));
    }, [userSettings]);

    const value: ProviderValue = {
        userSettings,
        setUserSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;
