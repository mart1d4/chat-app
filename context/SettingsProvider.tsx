'use client';

import {
    ReactElement,
    ReactNode,
    createContext,
    useEffect,
    useState,
} from 'react';

export const SettingsContext = createContext({});

const SettingsProvider = ({
    children,
}: {
    children: ReactNode;
}): ReactElement => {
    const [userSettings, setUserSettings] = useState<any>(null);

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
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsProvider;
