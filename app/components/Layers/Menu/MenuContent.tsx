// @ts-nocheck

"use client";

import { useData, useLayers, useMention, useSettings, useShowSettings } from "@/store";
import { useEffect, useRef, useMemo, ReactElement } from "react";
import { Icon, LoadingCubes, LoadingDots } from "@components";
import useFetchHelper from "@/hooks/useFetchHelper";
import { MenuItems } from "./MenuItems";
import styles from "./Menu.module.css";

const colors = ["#22A559", "", "#F0B232", "#F23F43", "#80848E"];
const masks = ["", "", "status-mask-idle", "status-mask-dnd", "status-mask-offline"];

export function Menu({
    content,
    element,
}: {
    content: {
        [x: string]: any;
        type: any;
    };
    element: ReactElement;
}) {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const setSettings = useSettings((state) => state.setSettings);
    const setMention = useMention((state) => state.setMention);

    const settings = useSettings((state) => state.settings);

    const received = useData((state) => state.received);
    const currentUser = useData((state) => state.user);
    const friends = useData((state) => state.friends);
    const blocked = useData((state) => state.blocked);
    const sent = useData((state) => state.sent);

    const getItems = MenuItems();

    const container = useRef(null);
    const firstItem = useRef(null);
    const lastItem = useRef(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (container.current && !container.current.contains(e.target as Node)) {
                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         setNull: true,
                //     },
                // });
            }
        }

        function handlekeyDown(e: KeyboardEvent) {
            if (["Tab", "Escape", "ArrowDown", "ArrowUp"].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key == "Escape") {
                if (element) {
                    element.focus();
                }

                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         setNull: true,
                //     },
                // });
            } else if (e.key == "ArrowDown") {
                if (!container.current.contains(document.activeElement)) {
                    firstItem.current.focus();
                } else {
                    const currentFocused = document.activeElement;

                    if (currentFocused === lastItem.current) {
                        firstItem.current.focus();
                        return;
                    }

                    let nextItem = currentFocused.nextSibling;
                    if (nextItem?.nodeName === "HR") {
                        nextItem = nextItem.nextSibling;
                    }

                    if (nextItem) nextItem.focus();
                }
            } else if (e.key == "ArrowUp") {
                if (!container.current.contains(document.activeElement)) {
                    lastItem.current.focus();
                } else {
                    const currentFocused = document.activeElement;

                    if (currentFocused === firstItem.current) {
                        lastItem.current.focus();
                        return;
                    }

                    let prevItem = currentFocused.previousSibling;
                    if (prevItem?.nodeName === "HR") {
                        prevItem = prevItem.previousSibling;
                    }

                    if (prevItem) prevItem.focus();
                }
            }
        }

        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handlekeyDown);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handlekeyDown);
        };
    }, []);

    const relationships = useMemo(() => {
        if (content.user) {
            return {
                self: content.user.id == currentUser.id,
                friend: !!friends.find((f) => f.id == content.user.id),
                blocked: !!blocked.find((f) => f.id == content.user.id),
                sent: !!sent.find((f) => f.id == content.user.id),
                received: !!received.find((f) => f.id == content.user.id),
            };
        }

        return {};
    }, [content.user, currentUser, friends, blocked, sent, received]);

    const items = useMemo(() => {
        const typeItemGenerators = {
            FILE_INPUT: getItems.getFileInput,
            GUILD_CHANNEL_LIST: getItems.getGuildChannelList,
            GUILD_CHANNEL: getItems.getGuildChannel,
            GUILD: getItems.getGuild,
            INPUT: getItems.getInput,
            IMAGE: getItems.getImage,
            MESSAGE: getItems.getMessage,
            USER_SMALL: getItems.getUserSmall,
            USER: getItems.getChannel,
            CHANNEL: getItems.getChannel,
            USER_GROUP: getItems.getUserGroup,
            STATUS: getItems.getStatus,
        };

        const generateItems = typeItemGenerators[content.type];

        if (generateItems) {
            return generateItems({
                content,
                relationships,
                settings,
            });
        }

        return [];
    }, [content, relationships, settings]);

    return (
        <div
            id={content.type == "STATUS" ? "status-menu" : ""}
            ref={container}
            className={`${styles.container} ${content.type === "GUILD" ? styles.big : ""}`}
            onMouseLeave={() => {
                if (content.type == "STATUS") {
                    // setLayers({
                    //     settings: {
                    //         type: "MENU",
                    //         setNull: true,
                    //     },
                    // });
                }
            }}
        >
            <ul>
                {!items.length && (
                    <div className={styles.loading}>
                        <LoadingCubes />
                    </div>
                )}

                {items.map((item, i) => {
                    if (!item.name) {
                        return null;
                    } else if (item.name === "Divider") {
                        return (
                            <hr
                                className={styles.divider}
                                key={`${content.type}-${i}`}
                            />
                        );
                    } else {
                        const classNames = [
                            styles.item,
                            item.danger && styles.danger,
                            item.disabled && styles.disabled,
                        ]
                            .filter(Boolean)
                            .join(" ");

                        const ref = i === 0 ? firstItem : i === items.length - 1 ? lastItem : null;

                        return (
                            <li
                                ref={ref}
                                tabIndex={0}
                                role="button"
                                className={classNames}
                                key={`${content.type}-${i}`}
                                onClick={(e) => {
                                    if (item.disabled) return;

                                    if (e.shiftKey && item.funcShift) item.funcShift();
                                    else if (item.func) item.func();

                                    if (item.hideCard) {
                                        // setLayers({
                                        //     settings: {
                                        //         type: "USER_CARD",
                                        //         setNull: true,
                                        //     },
                                        // });
                                    }

                                    if (!("checked" in item)) {
                                        // setLayers({
                                        //     settings: {
                                        //         type: "MENU",
                                        //         setNull: true,
                                        //     },
                                        // });
                                    }
                                }}
                            >
                                <div style={{ justifyContent: item.leftIcon && "flex-start" }}>
                                    {item.leftIcon && (
                                        <div className={styles.leftIcon}>
                                            <Icon name={item.leftIcon} />
                                        </div>
                                    )}

                                    {content.type == "STATUS" && (
                                        <div className={styles.statusIcon}>
                                            <svg
                                                width={10}
                                                height={10}
                                            >
                                                <rect
                                                    height="10px"
                                                    width="10px"
                                                    rx={8}
                                                    ry={8}
                                                    fill={colors[i]}
                                                    mask={`url(#${masks[i]})`}
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    <div
                                        className={styles.label}
                                        style={{ fontSize: item.leftIcon ? "14px" : "" }}
                                    >
                                        {item.name}
                                    </div>

                                    {(item.icon || "checked" in item || "items" in item) && (
                                        <div
                                            className={`${styles.icon} ${
                                                "checked" in item && item.checked
                                                    ? styles.revert
                                                    : ""
                                            }`}
                                        >
                                            <Icon
                                                name={
                                                    "checked" in item
                                                        ? item.checked
                                                            ? "checkboxFilled"
                                                            : "checkbox"
                                                        : "items" in item
                                                        ? "caret"
                                                        : item.icon ?? ""
                                                }
                                                size={item.items ? 16 : 18}
                                                viewbox={
                                                    item.icon == "boost"
                                                        ? "0 0 8 12"
                                                        : item.icon == "translate"
                                                        ? "0 96 960 960"
                                                        : ""
                                                }
                                            />
                                        </div>
                                    )}

                                    {item.textTip && (
                                        <div className={styles.text}>{item.textTip}</div>
                                    )}
                                </div>

                                {item.tip && (
                                    <div
                                        className={styles.tip}
                                        style={{
                                            marginLeft: content.type == "STATUS" ? "18px" : "",
                                        }}
                                    >
                                        {item.tip}
                                        {item.tipIcon && (
                                            <Icon
                                                name={item.tipIcon}
                                                size={16}
                                            />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}
