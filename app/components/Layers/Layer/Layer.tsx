"use client";

import { Menu, Popup, UserCard, UserProfile } from "@components";
import { useEffect, useState, useCallback } from "react";
import styles from "./Layer.module.css";
import { useLayers } from "@/lib/store";

export function Layers() {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    let popupHasBackground = false;
    layers.POPUP.forEach((obj, index: number) => {
        if (!["PINNED_MESSAGES", "CREATE_DM"].includes(layers.POPUP[index].content.type)) {
            popupHasBackground = true;
        }
    });

    const darkBackground =
        (layers.POPUP.length > 0 && popupHasBackground) || layers.USER_PROFILE !== null;

    return (
        <div
            className={styles.container}
            style={{ pointerEvents: darkBackground ? "all" : "none" }}
        >
            <div
                className={styles.filter}
                style={{
                    pointerEvents: darkBackground ? "all" : "none",
                    backgroundColor: darkBackground ? "rgba(0, 0, 0, 0.80)" : "",
                }}
                onMouseDown={() => {
                    if (layers.USER_PROFILE || layers.POPUP.length > 0) {
                        setLayers({
                            settings: {
                                type: layers.POPUP.length > 0 ? "POPUP" : "USER_PROFILE",
                                setNull: true,
                            },
                        });
                    }
                }}
            />

            {layers.POPUP.length > 0 &&
                layers.POPUP.map((obj, index: number) => {
                    return (
                        <Layer
                            key={index}
                            settings={layers.POPUP[index].settings}
                            content={layers.POPUP[index].content}
                        />
                    );
                })}

            {layers.MENU && (
                <Layer
                    settings={layers.MENU.settings}
                    content={layers.MENU.content}
                />
            )}

            {layers.USER_CARD && (
                <Layer
                    settings={layers.USER_CARD.settings}
                    content={layers.USER_CARD.content}
                />
            )}

            {layers.USER_PROFILE && (
                <Layer
                    settings={layers.USER_PROFILE.settings}
                    content={layers.USER_PROFILE.content}
                />
            )}
        </div>
    );
}

type TPositions = {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    transform?: string;
};

type TDimensions = null | {
    width: number;
    height: number;
};

type TMenu = null | any;

type TPopup = null | {
    type: string;
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
        element?: any | null;
        event?: React.MouseEvent | React.KeyboardEvent;
        firstSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        secondSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        gap?: number;
    };
    content?: TMenu | TPopup | TUserCard | TUserProfile;
};

function Layer({ settings, content }: TLayer) {
    const [transform, setTransform] = useState<string>("");
    const [currentNode, setCurrentNode] = useState<HTMLElement | null>(null);

    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const firstSide = settings.firstSide;
    const secondSide = settings.secondSide;
    const gap = settings.gap || 10;

    const layerRef = useCallback(
        (node: HTMLElement | null) => {
            if (!settings?.type || node === null) {
                setCurrentNode(null);
                setTransform("");
            } else {
                const resizeObserver = new ResizeObserver(() => {
                    setCurrentNode(node);
                });
                resizeObserver.observe(node);
            }
        },
        [settings?.type, settings?.event, settings?.element]
    );

    useEffect(() => {
        if (!currentNode) return;

        const width = currentNode.offsetWidth;
        const height = currentNode.offsetHeight;

        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        let top = 0;
        let left = 0;

        if (settings.event) {
            // @ts-expect-error
            const mouseX = settings.event.pageX;
            // @ts-expect-error
            const mouseY = settings.event.pageY;

            top = mouseY;
            left = mouseX;

            // Not enough space to the right, open to the left
            if (screenX - 12 - mouseX < width) {
                left = mouseX - width;
            }

            // Not enough space at the bottom, move the menu up
            if (screenY - 12 - mouseY < height) {
                top = screenY - 12 - height;
            }

            setTransform(`translate(${left}px, ${top}px)`);
        } else if (settings.element) {
            const containerRect = settings.element.getBoundingClientRect();

            if (firstSide === "LEFT") {
                top = containerRect.top;
                left = containerRect.left - width - gap;

                if (secondSide === "TOP") {
                    top = containerRect.bottom - height;
                }
            } else if (firstSide === "RIGHT") {
                top = containerRect.top;
                left = containerRect.right + gap;

                if (secondSide === "TOP") {
                    top = containerRect.bottom - height;
                }
            } else if (firstSide === "TOP") {
                top = containerRect.top - height - gap;
                left = containerRect.left;

                if (secondSide === "LEFT") {
                    left = containerRect.right - width;
                }
            } else if (firstSide === "BOTTOM") {
                top = containerRect.bottom + gap;
                left = containerRect.left;

                if (secondSide === "LEFT") {
                    left = containerRect.right - width;
                }
            }

            // Not enough space to the bottom, move the menu up
            if (screenY - 10 - top < height) {
                top = screenY - height - 10;
            }

            // Not enough space to the right, move the menu to the left
            if (screenX - 10 - (left as number) < width) {
                left = containerRect.right - width;
            }

            setTransform(`translate(${left}px, ${top}px)`);
        } else {
            setTransform("translate(-50%, -50%)");
        }
    }, [currentNode]);

    useEffect(() => {
        if (!currentNode) return;

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

        document.addEventListener("keydown", handleEscKey);
        return () => document.removeEventListener("keydown", handleEscKey);
    }, [currentNode, settings?.type, layers]);

    if (!settings?.type) return null;

    const indexes = {
        MENU: 1004,
        POPUP: 1003,
        USER_CARD: 1001,
        USER_PROFILE: 1003,
    };

    const index = ["PINNED_MESSAGES", "CREATE_DM"].includes(content.type)
        ? 1001
        : indexes[settings.type];

    return (
        <div
            ref={layerRef}
            className={`${styles.layer} ${
                settings.type === "POPUP" || settings.type === "POPUP" ? styles.popup : ""
            }`}
            style={{
                zIndex: index,
                opacity: transform !== "" ? 1 : 0,
                top: !settings?.event && !settings?.element ? "50%" : "",
                left: !settings?.event && !settings?.element ? "50%" : "",
                transform: transform,
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {settings.type === "MENU" && <Menu content={content} />}
            {settings.type === "POPUP" && (
                <Popup
                    content={content}
                    element={settings.element}
                />
            )}
            {settings.type === "USER_CARD" && <UserCard content={content} />}
            {settings.type === "USER_PROFILE" && <UserProfile content={content} />}
        </div>
    );
}
