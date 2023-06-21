'use client';

import { ReactElement, ReactNode, createContext, useState } from 'react';

export const LayerContext = createContext<LayerContextValueType>(null);

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [showSettings, setShowSettings] = useState<boolean | {}>(false);
    const [userProfile, setUserProfile2] = useState<UserProfileObjectType>(null);
    const [popup, setPopup] = useState<PopupObjectType>(null);
    const [fixedLayer, setFixedLayer2] = useState<null | FixedLayerObjectType>(null);

    const setFixedLayer = (content: null | FixedLayerObjectType) => {
        setFixedLayer2(null);
        if (content) {
            setTimeout(() => {
                setFixedLayer2(content);
            }, 100);
        }
    };

    const setUserProfile = (content: UserProfileObjectType | null) => {
        setUserProfile2(null);
        if (content) {
            setTimeout(() => {
                setUserProfile2(content);
            }, 100);
        }
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

    return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export default LayerProvider;
