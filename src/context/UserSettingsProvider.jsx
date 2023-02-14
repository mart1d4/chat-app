import { createContext, useEffect, useState } from 'react';

export const UserSettingsContext = createContext({});

export function UserSettingsProvider({ children }) {
    const [userSettings, setUserSettings] = useState({});

    useEffect(() => {
        const userSettings = JSON.parse(localStorage.getItem('user-settings'));

        if (userSettings) {
            setUserSettings(userSettings);
        } else {
            const userSettings = {
                theme: localStorage.getItem('theme') || 'dark',
                language: localStorage.getItem('language') || 'en',
                microphone: localStorage.getItem('microphone') || true,
                camera: localStorage.getItem('camera') || true,
                notifications: localStorage.getItem('notifications') || true,
                sound: localStorage.getItem('sound') || true,
                videoQuality: localStorage.getItem('videoQuality') || '720p',
                videoResolution: localStorage.getItem('videoResolution') || '720p',
                videoFrameRate: localStorage.getItem('videoFrameRate') || '30',
                videoBitrate: localStorage.getItem('videoBitrate') || '1000',
                audioBitrate: localStorage.getItem('audioBitrate') || '128',
                audioSampleRate: localStorage.getItem('audioSampleRate') || '44100',
                audioChannelCount: localStorage.getItem('audioChannelCount') || '2',
                appearance: localStorage.getItem('appearance') || 'default',
                size: localStorage.getItem('size') || 'default',
                font: localStorage.getItem('font') || 'default',
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
