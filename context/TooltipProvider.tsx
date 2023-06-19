'use client';

import { ReactElement, createContext, useState, Dispatch, SetStateAction } from 'react';

type TooltipType = null | {
    text: string;
    element: HTMLElement;
    position: 'top' | 'bottom' | 'left' | 'right';
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
};

type TooltipValueType = {
    tooltip: TooltipType;
    setTooltip: Dispatch<SetStateAction<TooltipType>>;
};

export const TooltipContext = createContext<TooltipType>(null);

const TooltipProvider = ({ children }: { children: ReactElement }): ReactElement => {
    const [tooltip, setTooltip] = useState<TooltipType>(null);

    const value: TooltipValueType = {
        tooltip,
        setTooltip,
    };

    // @ts-expect-error
    return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
};

export default TooltipProvider;
