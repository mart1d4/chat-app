import { createContext, useEffect, useState } from 'react';

export const UserSettingsContext = createContext({});

export function UserSettingsProvider({ children }) {
    const [userSettings, setUserSettings] = useState(null);

    useEffect(() => {
        const userSettingsLocal = localStorage.getItem('user-settings');

        if (!userSettingsLocal) {
            const userSettingsLocal = {
                language: 'en-US',
                microphone: false,
                sound: true,
                camera: false,
                notifications: true,
                appearance: 'default',
                font: 'default',
                theme: 'dark',
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

    const value = {
        userSettings,
        setUserSettings,
    };

    return (
        <UserSettingsContext.Provider value={value}>
            {children}
        </UserSettingsContext.Provider>
    );
}
