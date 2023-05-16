'use client';

import { ReactElement, ReactNode, createContext, useEffect, useState } from 'react';

export const SettingsContext = createContext<UserSettingsContextValueType>(null);

const SettingsProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [userSettings, setUserSettings] = useState<UserSettingsObjectType>(null);

    useEffect(() => {
        const userSettingsLocal = localStorage.getItem('user-settings');

        if (!userSettingsLocal) {
            const userSettingsLocal: UserSettingsObjectType = {
                language: 'en-US',
                microphone: false,
                sound: true,
                camera: false,
                notifications: true,
                appearance: 'default',
                font: 'default',
                theme: 'dark',
                friendTab: 'add',
                sendButton: false,
                showUsers: true,
            };
            setUserSettings(userSettingsLocal);
        } else {
            setUserSettings(JSON.parse(userSettingsLocal));
        }
    }, []);

    useEffect(() => {
        if (!userSettings) return;
        localStorage.setItem('user-settings', JSON.stringify(userSettings));
    }, [userSettings]);

    const value: UserSettingsContextValueType = {
        userSettings,
        setUserSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;
