'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const LayerContext = createContext({});

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState(null);
    const [popup, setPopup] = useState(null);
    const [fixedLayer, setFixedLayer2] = useState(null);

    const setFixedLayer = (content: any) => {
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
        <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
    );
};

export default LayerProvider;
