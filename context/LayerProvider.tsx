'use client';

import { ReactElement, ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';

export const LayerContext = createContext<ProviderValue | null>(null);
type TSettings = boolean | { type: string };

type ProviderValue = {
    showSettings: TSettings;
    setShowSettings: Dispatch<SetStateAction<TSettings>>;
};

const LayerProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [showSettings, setShowSettings] = useState<TSettings>(false);

    const value: ProviderValue = {
        showSettings,
        setShowSettings,
    };

    return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export default LayerProvider;
