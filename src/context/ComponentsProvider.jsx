import { createContext, useState } from 'react';

export const ComponentsContext = createContext({});

export function ComponentsProvider({ children }) {
    const [showSettings, setShowSettings] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [popup, setPopup] = useState(null);
    const [fixedLayer, setFixedLayer2] = useState(null);

    const setFixedLayer = (content) => {
        setFixedLayer2(null);
        setTimeout(() => {
            setFixedLayer2(content);
        }, 1);
    };

    const value = {
        showSettings,
        setShowSettings,
        userProfile,
        setUserProfile,
        popup,
        setPopup,
        fixedLayer,
        setFixedLayer,
    };

    return (
        <ComponentsContext.Provider value={value}>
            {children}
        </ComponentsContext.Provider>
    );
}
