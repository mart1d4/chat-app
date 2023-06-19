'use client';

import { SettingsContext } from '@/context/SettingsProvider';
import { TooltipContext } from '@/context/TooltipProvider';
import { LayerContext } from '@/context/LayerProvider';
import { AuthContext } from '@/context/AuthProvider';
import { useContext } from 'react';

const useContextHook = ({ context }: { context: string }) => {
    if (context === 'auth') {
        return useContext(AuthContext);
    } else if (context === 'layer') {
        return useContext(LayerContext);
    } else if (context === 'settings') {
        return useContext(SettingsContext);
    } else if (context === 'tooltip') {
        return useContext(TooltipContext);
    }

    return null;
};

export default useContextHook;
