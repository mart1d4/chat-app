import { create } from 'zustand';

// Tooltip

type TTooltip = null | {
    text: string;
    element: HTMLElement;
    position?: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
    wide?: boolean;
};

interface TooltipState {
    tooltip: TTooltip;
    setTooltip: (tooltip: TTooltip) => void;
}

export const useTooltip = create<TooltipState>()((set) => ({
    tooltip: null,
    setTooltip: (tooltip) => set(() => ({ tooltip })),
}));

// Layers

enum EPopupType {
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    PIN_MESSAGE = 'PIN_MESSAGE',
    UNPIN_MESSAGE = 'UNPIN_MESSAGE',
    UPDATE_USERNAME = 'UPDATE_USERNAME',
    UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

type TMenu = null | any;

type TPopup = null | {
    type: EPopupType;
    channelId?: string;
    message?: TMessage;
};

type TUserCard = null | {
    user: TCleanUser;
};

type TUserProfile = null | {
    user: TCleanUser;
    focusNote?: boolean;
};

type TLayer = {
    settings: {
        type: 'MENU' | 'POPUP' | 'USER_CARD' | 'USER_PROFILE';
        setNull?: boolean;
        element?: HTMLElement | EventTarget | null;
        event?: React.MouseEvent;
        firstSide?: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'CENTER';
        secondSide?: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'CENTER';
        gap?: number;
    };
    content?: TMenu | TPopup | TUserCard | TUserProfile;
};

interface LayersState {
    layers: {
        ['MENU']: TLayer | null;
        ['POPUP']: TLayer[];
        ['USER_CARD']: TLayer | null;
        ['USER_PROFILE']: TLayer | null;
    };
    setLayers: (layer: TLayer) => void;
}

export const useLayers = create<LayersState>()((set) => ({
    layers: {
        MENU: null,
        POPUP: [],
        USER_CARD: null,
        USER_PROFILE: null,
    },
    setLayers: (layer) => {
        set((state) => {
            if (layer.settings.type === 'POPUP') {
                // If add, add to array, otherwise remove last
                if (!layer.settings.setNull) {
                    // if type already exists in array, don't add it
                    if (
                        (state.layers[layer.settings.type] as TLayer[]).find(
                            (l) => l.content.type === layer.content.type
                        )
                    ) {
                        return state;
                    }

                    return {
                        layers: {
                            ...state.layers,
                            [layer.settings.type]: [...(state.layers[layer.settings.type] as TLayer[]), layer],
                        },
                    };
                } else {
                    const layers = state.layers[layer.settings.type] as TLayer[];

                    return {
                        layers: {
                            ...state.layers,
                            [layer.settings.type]: layers.slice(0, layers.length - 1),
                        },
                    };
                }
            }

            return {
                layers: {
                    ...state.layers,
                    [layer.settings.type]: layer.settings.setNull ? null : layer,
                },
            };
        });
    },
}));
