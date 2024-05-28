"use client";

import { TooltipContent, TooltipTrigger, Tooltip } from "../Layers/Tooltip/Tooltip";
import { useData, useLayers, useSettings, useShowSettings } from "@/store";
import styles from "./UserSection.module.css";
import { Avatar, Icon } from "@components";
import { statuses } from "@/lib/statuses";
import { useRef } from "react";

export function UserSection() {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const setSettings = useSettings((state) => state.setSettings);
    const setLayers = useLayers((state) => state.setLayers);
    const settings = useSettings((state) => state.settings);
    const layers = useLayers((state) => state.layers);
    const user = useData((state) => state.user);

    const userSection = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.userSectionContainer}>
            <div className={styles.userSection}>
                <div
                    tabIndex={0}
                    ref={userSection}
                    className={
                        styles.avatarWrapper +
                        " " +
                        (layers.USER_CARD?.settings.element === userSection.current &&
                            styles.active)
                    }
                    onClick={(e) => {
                        if (layers.USER_CARD?.settings.element === e.currentTarget) return;
                        setLayers({
                            settings: {
                                type: "USER_CARD",
                                element: e.currentTarget,
                                firstSide: "TOP",
                                secondSide: "RIGHT",
                                gap: 14,
                            },
                            content: {
                                user: user,
                                animation: "off",
                                settings: true,
                            },
                        });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (layers.USER_CARD?.settings.element === e.currentTarget) return;
                            setLayers({
                                settings: {
                                    type: "USER_CARD",
                                    element: e.currentTarget,
                                    firstSide: "TOP",
                                    secondSide: "RIGHT",
                                    gap: 14,
                                },
                                content: {
                                    user: user,
                                    animation: "off",
                                    settings: true,
                                },
                            });
                        }
                    }}
                >
                    <div>
                        <Avatar
                            src={user.avatar}
                            alt={user.username}
                            size={32}
                            type="avatars"
                            status={user.status}
                        />
                    </div>

                    <div className={styles.contentWrapper}>
                        <div>{user.displayName}</div>
                        <div className={styles.hoverContent}>
                            <div>{user.username}</div>
                            <div>
                                {user.customStatus ? user.customStatus : statuses[user.status]}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                onClick={() => {
                                    if (!settings.microphone && !settings.sound) {
                                        setSettings("microphone", true);
                                        setSettings("sound", true);
                                        const audio = new Audio("/assets/sounds/undeafen.mp3");
                                        audio.volume = 0.5;
                                        audio.play();
                                    } else {
                                        setSettings("microphone", !settings.microphone);
                                        const audio = new Audio(`
                                    /assets/sounds/${settings.microphone ? "mute" : "unmute"}.mp3
                                `);
                                        audio.volume = 0.5;
                                        audio.play();
                                    }
                                }}
                                className={settings.microphone ? "" : styles.cut}
                            >
                                <div className={styles.toolbar}>
                                    <Icon
                                        name={settings.microphone ? "mic" : "micDisabled"}
                                        size={20}
                                    />
                                </div>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>
                            {settings.microphone ? "Turn Off Microphone" : "Turn On Microphone"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                onClick={() => {
                                    if (settings.microphone && settings.sound) {
                                        setSettings("microphone", false);
                                        setSettings("sound", false);
                                    } else {
                                        setSettings("sound", !settings.sound);
                                    }

                                    const audio = new Audio(`
                                    /assets/sounds/${settings.sound ? "deafen" : "undeafen"}.mp3
                                `);
                                    audio.volume = 0.5;
                                    audio.play();
                                }}
                                className={settings.sound ? "" : styles.cut}
                            >
                                <div className={styles.toolbar}>
                                    <Icon
                                        name={settings.sound ? "headset" : "headsetDisabled"}
                                        size={20}
                                    />
                                </div>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>{settings.sound ? "Deafen" : "Undeafen"}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button onClick={() => setShowSettings({ type: "USER" })}>
                                <div className={styles.toolbar}>
                                    <Icon
                                        name="cog"
                                        size={20}
                                    />
                                </div>
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>User Settings</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
