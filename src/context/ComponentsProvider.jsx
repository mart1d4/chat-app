import { createContext, useState } from 'react';

export const ComponentsContext = createContext({});

export function ComponentsProvider({ children }) {
    const [showSettings, setShowSettings] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [menu, setMenu] = useState(null);
    const [popup, setPopup] = useState(null);

    const value = {
        showSettings,
        setShowSettings,
        userProfile,
        setUserProfile,
        menu,
        setMenu,
        popup,
        setPopup,
    };

    return (
        <ComponentsContext.Provider value={value}>
            {children}
        </ComponentsContext.Provider>
    );
}
