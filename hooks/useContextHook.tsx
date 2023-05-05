// @ts-nocheck

'use client';

import { SettingsContext } from '@/context/SettingsProvider';
import { LayerContext } from '@/context/LayerProvider';
import { AuthContext } from '@/context/AuthProvider';
import { useContext } from 'react';

const useContextHook = ({ context }: { context: string }) => {
    if (context === 'auth') {
        const { auth, setAuth, isLoading, setIsLoading }: AuthContextType =
            useContext<AuthContextType>(AuthContext);
        return useContext(AuthContext);
    } else if (context === 'layer') {
        const {
            showSettings,
            setShowSettings,
            userProfile,
            setUserProfile,
            popup,
            setPopup,
            fixedLayer,
            setFixedLayer,
        } = useContext(LayerContext);
        return useContext(LayerContext);
    } else if (context === 'settings') {
        const { userSettings, setUserSettings } = useContext(SettingsContext);
        return useContext(SettingsContext);
    }

    return null;
};

export default useContextHook;
