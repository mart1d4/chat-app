'use client';

import { SettingsContext } from '@/context/SettingsProvider';
import { LayerContext } from '@/context/LayerProvider';
import { AuthContext } from '@/context/AuthProvider';
import { useContext } from 'react';

const useContextHook = ({ context }: { context: string }) => {
    if (context === 'auth') return useContext(AuthContext);
    if (context === 'layer') return useContext(LayerContext);
    if (context === 'settings') return useContext(SettingsContext);

    return null;
};

export default useContextHook;
