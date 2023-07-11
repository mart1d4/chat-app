'use client';

import { ReactElement, createContext, useState, Dispatch, SetStateAction } from 'react';

type TTooltip = null | {
    text: string;
    element: HTMLElement;
    position: 'top' | 'bottom' | 'left' | 'right';
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
};

type ProviderValue = {
    tooltip: TTooltip;
    setTooltip: Dispatch<SetStateAction<TTooltip>>;
};

export const TooltipContext = createContext<ProviderValue | null>(null);

const TooltipProvider = ({ children }: { children: ReactElement }): ReactElement => {
    const [tooltip, setTooltip] = useState<TTooltip>(null);

    const value: ProviderValue = {
        tooltip,
        setTooltip,
    };

    return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
};

export default TooltipProvider;
