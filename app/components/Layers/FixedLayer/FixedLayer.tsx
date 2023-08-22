'use client';

import { useEffect, useState, useCallback, ReactElement } from 'react';
import { Menu, Popup, UserCard, UserProfile } from '@components';
import { useLayers } from '@/lib/store';

type TPosition = {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    transform?: string;
};

type TContainer = null | {
    width: number;
    height: number;
};

type TNode = null | HTMLElement;

export const Layers = ({ friends }: { friends: TCleanUser[] }): ReactElement => {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    useEffect(() => {
        console.log(layers);
    }, [layers]);

    useEffect(() => {
        if (!layers) return;

        const handleClickOutside = (e: MouseEvent) => {
            // if (currentNodes && !currentNodes.contains(e.target as Node)) {
            //     if (layers.MENU) {
            //         setLayers({
            //             settings: {
            //                 type: 'MENU',
            //                 setNull: true,
            //             },
            //         });
            //     }
            //     if (layers.POPUP) {
            //         setLayers({
            //             settings: {
            //                 type: 'POPUP',
            //                 setNull: true,
            //             },
            //         });
            //     }
            //     if (layers.USER_CARD) {
            //         setLayers({
            //             settings: {
            //                 type: 'USER_CARD',
            //                 setNull: true,
            //             },
            //         });
            //     }
            //     if (layers.USER_PROFILE) {
            //         setLayers({
            //             settings: {
            //                 type: 'USER_PROFILE',
            //                 setNull: true,
            //             },
            //         });
            //     }
            // }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [layers]);

    let popupHasBackground = false;
    layers.POPUP.forEach((obj, index: number) => {
        if (layers.POPUP[index].content.type === 'PINNED_MESSAGES') {
        } else if (layers.POPUP[index].content.type === 'CREATE_DM') {
        } else {
            popupHasBackground = true;
        }
    });

    const darkBackground = (layers.POPUP.length > 0 && popupHasBackground) || layers.USER_PROFILE !== null;

    let shouldDisplay;
    Object.keys(layers).forEach((key) => {
        if (layers[key as keyof typeof layers]) {
            shouldDisplay = true;
        }
    });

    return (
        <div
            style={{
                position: 'fixed',
                width: '100dvw',
                height: '100dvh',
                zIndex: 1000,
                pointerEvents: darkBackground ? 'all' : 'none',
                visibility: shouldDisplay ? 'visible' : 'hidden',
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    width: '100dvw',
                    height: '100dvh',
                    zIndex: 1001,
                    pointerEvents: darkBackground ? 'all' : 'none',
                    backgroundColor: darkBackground ? 'rgba(0, 0, 0, 0.80)' : '',
                }}
            />

            {Object.keys(layers).map((layer) => {
                if (layer === 'POPUP' && layers[layer]?.length > 0) {
                    return layers[layer]?.map((obj, index: number) => {
                        return (
                            <Layer
                                key={index}
                                settings={layers[layer][index]?.settings}
                                content={layers[layer][index]?.content}
                                friends={friends}
                            />
                        );
                    });
                } else if (layer === 'MENU' || layer === 'USER_CARD' || layer === 'USER_PROFILE') {
                    return (
                        <Layer
                            key={layer}
                            settings={layers[layer]?.settings}
                            content={layers[layer]?.content}
                            friends={friends}
                        />
                    );
                }
            })}
        </div>
    );
};

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
    content: TMenu | TPopup | TUserCard | TUserProfile;
    friends: TCleanUser[];
};

const Layer = ({ settings, content, friends }: TLayer) => {
    const [positions, setPositions] = useState<TPosition>({});
    const [container, setContainer] = useState<TContainer>(null);
    const [currentNode, setCurrentNode] = useState<TNode>(null);

    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const firstSide = settings?.firstSide;
    const secondSide = settings?.secondSide;
    const gap = settings?.gap || 10;

    const layerRef = useCallback(
        (node: any) => {
            if (!settings?.type || !(node !== null)) {
                setPositions({});
                setContainer(null);
                setCurrentNode(null);
            } else {
                // We set the node after it's rendered
                setTimeout(() => setCurrentNode(node), 10);
            }
        },
        [settings?.type]
    );

    useEffect(() => {
        if (!container || !settings?.type) return;

        const mouseX = settings?.event?.pageX;
        const mouseY = settings?.event?.pageY;
        const element = settings?.element;

        let pos: TPosition = {};
        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        if (mouseX && mouseY) {
            // If there's not enough space to the right, open to the left
            if (screenX - 12 - mouseX < container.width) {
                pos = {
                    top: mouseY,
                    left: mouseX - container.width,
                };
            } else {
                pos = {
                    top: mouseY,
                    left: mouseX,
                };
            }

            // If there's not enough space at the bottom, move the menu up
            if (screenY - 12 - mouseY < container.height) {
                pos = {
                    ...pos,
                    top: 'unset',
                    bottom: 12,
                };
            }
        } else if (element) {
            const containerRect = element.getBoundingClientRect();

            if (firstSide === 'LEFT') {
                pos = {
                    top: containerRect.top,
                    left: containerRect.left - container.width - gap,
                };

                if (secondSide === 'TOP') {
                    pos = {
                        ...pos,
                        top: containerRect.bottom - container.height,
                    };
                }
            } else if (firstSide === 'RIGHT') {
                pos = {
                    top: containerRect.top,
                    left: containerRect.right + gap,
                };

                if (secondSide === 'TOP') {
                    pos = {
                        ...pos,
                        top: containerRect.bottom - container.height,
                    };
                }
            } else if (firstSide === 'TOP') {
                pos = {
                    top: containerRect.top - container.height - gap,
                    left: containerRect.left,
                };

                if (secondSide === 'LEFT') {
                    pos = {
                        ...pos,
                        left: containerRect.right - container.width,
                    };
                }
            } else if (firstSide === 'BOTTOM') {
                pos = {
                    top: containerRect.bottom + gap,
                    left: containerRect.left,
                };

                if (secondSide === 'LEFT') {
                    pos = {
                        ...pos,
                        left: containerRect.right - container.width,
                    };
                }
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - (pos.top as number) < container.height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: 'unset',
                };
            } else {
                pos = {
                    ...pos,
                    bottom: 'unset',
                };
            }

            // If there's not enough space to the right, move the menu to the left
            if (window.innerWidth - 10 - (pos.left as number) < container.width) {
                pos = {
                    ...pos,
                    left: containerRect.right - container.width,
                };
            } else {
                pos = {
                    ...pos,
                    right: 'unset',
                };
            }
        } else {
            pos = {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        setPositions(pos);
    }, [container, settings]);

    useEffect(() => {
        if (!currentNode) return;
        setContainer({
            width: (currentNode.firstChild as HTMLElement)?.offsetWidth,
            height: (currentNode.firstChild as HTMLElement)?.offsetHeight,
        });
    }, [currentNode]);

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                zIndex:
                    settings?.type === 'POPUP'
                        ? content?.type === 'PINNED_MESSAGES' || content?.type === 'CREATE_DM'
                            ? 1000
                            : 1002
                        : 1003,
                position: 'fixed',
                width: container?.width,
                height: container?.height,
                visibility: positions.top ? 'visible' : 'hidden',
                pointerEvents: 'all',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            {settings?.type === 'MENU' && (
                <Menu
                    content={content}
                    friends={friends}
                />
            )}

            {settings?.type === 'POPUP' && (
                <Popup
                    content={content}
                    friends={friends}
                />
            )}

            {settings?.type === 'USER_CARD' && (
                <UserCard
                    content={content}
                    friends={friends}
                />
            )}

            {settings?.type === 'USER_PROFILE' && (
                <UserProfile
                    content={content}
                    friends={friends}
                />
            )}
        </div>
    );
};
