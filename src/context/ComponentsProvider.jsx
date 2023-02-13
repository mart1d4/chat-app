import { createContext, useState } from 'react';

export const ComponentsContext = createContext({});

export function ComponentsProvider({ children }) {
    const [showSettings, setShowSettings] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [menu, setMenu] = useState(null);
    const [modal, setModal] = useState(null);

    const value = {
        showSettings,
        setShowSettings,
        userProfile,
        setUserProfile,
        menu,
        setMenu,
        modal,
        setModal,
    };

    return (
        <ComponentsContext.Provider value={value}>
            {children}
        </ComponentsContext.Provider>
    );
}
