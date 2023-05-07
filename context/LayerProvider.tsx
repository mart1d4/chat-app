'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const LayerContext = createContext<LayerContextValueType>(null);

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfileObjectType>(null);
    const [popup, setPopup] = useState<PopupObjectType>(null);
    const [fixedLayer, setRealFixedLayer] =
        useState<null | FixedLayerObjectType>(null);

    const setFixedLayer = (content: null | FixedLayerObjectType) => {
        setRealFixedLayer(null);
        setTimeout(() => {
            setRealFixedLayer(content);
        }, 5);
    };

    const value: LayerContextValueType = {
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
