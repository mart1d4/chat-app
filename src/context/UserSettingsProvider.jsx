import { createContext, useEffect, useState } from 'react';

export const UserSettingsContext = createContext({});

export function UserSettingsProvider({ children }) {
    const [userSettings, setUserSettings] = useState({});

    useEffect(() => {
        const userSettings = JSON.parse(localStorage.getItem('user-settings'));

        if (userSettings) {
            setUserSettings(userSettings);
        } else {
            const userSettings = localStorage.getItem('user-settings') || {
                language: 'en-US',
                microphone: false,
                sound: true,
                camera: false,
                notifications: true,
                appearance: 'default',
                font: 'default',
                theme: 'dark',
                sendButton: false,
            };
            setUserSettings(userSettings);
        }
    }, []);

    useEffect(() => {
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
