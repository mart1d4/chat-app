"use client";

import { useEffect, useState, useCallback, ReactElement } from "react";
import { Menu, Popup, UserCard, UserProfile } from "@components";
import { useLayers } from "@/lib/store";

export const Layers = (): ReactElement => {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    let popupHasBackground = false;
    layers.POPUP.forEach((obj, index: number) => {
        if (layers.POPUP[index].content.type === "PINNED_MESSAGES") {
        } else if (layers.POPUP[index].content.type === "CREATE_DM") {
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
                position: "fixed",
                width: "100dvw",
                height: "100dvh",
                zIndex: 1000,
                pointerEvents: darkBackground ? "all" : "none",
                visibility: shouldDisplay ? "visible" : "hidden",
            }}
        >
            <div
                style={{
                    position: "fixed",
                    width: "100dvw",
                    height: "100dvh",
                    zIndex: 1002,
                    pointerEvents: darkBackground ? "all" : "none",
                    backgroundColor: darkBackground ? "rgba(0, 0, 0, 0.80)" : "",
                }}
                onMouseDown={() => {
                    if (layers.USER_PROFILE || layers.POPUP.length > 0) {
                        setLayers({
                            settings: {
                                type: layers.USER_PROFILE ? "USER_PROFILE" : "POPUP",
                                setNull: true,
                            },
                        });
                    }
                }}
            />

            {Object.keys(layers).map((layer) => {
                if (layer === "POPUP" && layers[layer]?.length > 0) {
                    return layers[layer]?.map((obj, index: number) => {
                        return (
                            <Layer
                                key={index}
                                settings={layers[layer][index]?.settings}
                                content={layers[layer][index]?.content}
                            />
                        );
                    });
                } else if (layer === "MENU" || layer === "USER_CARD" || layer === "USER_PROFILE") {
                    return (
                        <Layer
                            key={layer}
                            // @ts-expect-error
                            settings={layers[layer]?.settings}
                            content={layers[layer]?.content}
                        />
                    );
                }
            })}
        </div>
    );
};

enum EPopupType {
    DELETE_MESSAGE = "DELETE_MESSAGE",
    PIN_MESSAGE = "PIN_MESSAGE",
    UNPIN_MESSAGE = "UNPIN_MESSAGE",
    UPDATE_USERNAME = "UPDATE_USERNAME",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
}

type TPositions = {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    transform?: string;
};

type TNode = HTMLElement | null;

type TDimensions = null | {
    width: number;
    height: number;
};

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
        type: "MENU" | "POPUP" | "USER_CARD" | "USER_PROFILE";
        setNull?: boolean;
        element?: HTMLElement | null;
        event?: React.MouseEvent;
        firstSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        secondSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        gap?: number;
    };
    content: TMenu | TPopup | TUserCard | TUserProfile;
};

const Layer = ({ settings, content }: TLayer) => {
    const [positions, setPositions] = useState<TPositions>({});
    const [dimensions, setDimensions] = useState<TDimensions>(null);
    const [currentNode, setCurrentNode] = useState<TNode>(null);

    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const firstSide = settings?.firstSide;
    const secondSide = settings?.secondSide;
    const gap = settings?.gap || 10;

    const layerRef = useCallback(
        (node: TNode) => {
            if (!settings?.type || node === null) {
                setPositions({});
                setDimensions(null);
            } else {
                const resizeObserver = new ResizeObserver(() => {
                    setDimensions({
                        width: node.offsetWidth,
                        height: node.offsetHeight,
                    });
                    setCurrentNode(node);
                });
                resizeObserver.observe(node);
            }
        },
        [settings?.type]
    );

    useEffect(() => {
        if (!dimensions) return;

        const width = dimensions.width;
        const height = dimensions.height;

        const mouseX = settings?.event?.pageX;
        const mouseY = settings?.event?.pageY;
        const element = settings?.element;

        let pos: TPositions = {};
        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        if (mouseX && mouseY) {
            // If there's not enough space to the right, open to the left
            if (screenX - 12 - mouseX < width) {
                pos = {
                    top: mouseY,
                    left: mouseX - width,
                };
            } else {
                pos = {
                    top: mouseY,
                    left: mouseX,
                };
            }

            // If there's not enough space at the bottom, move the menu up
            if (screenY - 12 - mouseY < height) {
                pos = {
                    ...pos,
                    top: "unset",
                    bottom: 12,
                };
            }
        } else if (element) {
            const containerRect = element.getBoundingClientRect();

            if (firstSide === "LEFT") {
                pos = {
                    top: containerRect.top,
                    left: containerRect.left - width - gap,
                };

                if (secondSide === "TOP") {
                    pos = {
                        ...pos,
                        top: containerRect.bottom - height,
                    };
                }
            } else if (firstSide === "RIGHT") {
                pos = {
                    top: containerRect.top,
                    left: containerRect.right + gap,
                };

                if (secondSide === "TOP") {
                    pos = {
                        ...pos,
                        top: containerRect.bottom - height,
                    };
                }
            } else if (firstSide === "TOP") {
                pos = {
                    top: containerRect.top - height - gap,
                    left: containerRect.left,
                };

                if (secondSide === "LEFT") {
                    pos = {
                        ...pos,
                        left: containerRect.right - width,
                    };
                }
            } else if (firstSide === "BOTTOM") {
                pos = {
                    top: containerRect.bottom + gap,
                    left: containerRect.left,
                };

                if (secondSide === "LEFT") {
                    pos = {
                        ...pos,
                        left: containerRect.right - width,
                    };
                }
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - (pos.top as number) < height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: "unset",
                };
            } else {
                pos = {
                    ...pos,
                    bottom: "unset",
                };
            }

            // If there's not enough space to the right, move the menu to the left
            if (window.innerWidth - 10 - (pos.left as number) < width) {
                pos = {
                    ...pos,
                    left: containerRect.right - width,
                };
            } else {
                pos = {
                    ...pos,
                    right: "unset",
                };
            }
        } else {
            pos = {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            };
        }

        setPositions(pos);
    }, [dimensions, settings?.event, settings?.element]);

    useEffect(() => {
        if (!settings?.type || !currentNode) return;

        const handleOutsideClick = (e: MouseEvent) => {
            e.stopPropagation();
            console.log(currentNode);
            // @ts-expect-error
            if (currentNode.contains(e)) return;

            setLayers({
                settings: {
                    type: settings.type,
                    setNull: true,
                },
            });
        };

        const handleEscKey = (e: any) => {
            if (e.key === "Escape") {
                if (settings.type === "POPUP") return;
                if (settings.type !== "MENU" && layers.MENU) return;
                setLayers({
                    settings: {
                        type: settings.type,
                        setNull: true,
                    },
                });
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleEscKey);

        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleEscKey);
        };
    }, [currentNode, settings?.type, layers]);

    const index =
        settings?.type === "USER_CARD"
            ? 1001
            : settings?.type === "USER_PROFILE"
            ? 1003
            : settings?.type === "POPUP"
            ? content?.type === "PINNED_MESSAGES" || content?.type === "CREATE_DM"
                ? 1001
                : 1003
            : 1004;

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                zIndex: index,
                position: "fixed",
                visibility: positions.top ? "visible" : "hidden",
                pointerEvents: "all",
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {settings?.type === "MENU" && <Menu content={content} />}
            {settings?.type === "POPUP" && <Popup content={content} />}
            {settings?.type === "USER_CARD" && <UserCard content={content} />}
            {settings?.type === "USER_PROFILE" && <UserProfile content={content} />}
        </div>
    );
};
