"use client";

import { useData, useLayers, useSettings, useTooltip, useShowSettings } from "@/lib/store";
import styles from "./UserSection.module.css";
import { useRef, ReactElement } from "react";
import { translateCap } from "@/lib/strings";
import { Avatar, Icon } from "@components";

export const UserSection = (): ReactElement => {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const setSettings = useSettings((state) => state.setSettings);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const settings = useSettings((state) => state.settings);
    const user = useData((state) => state.user) as TUser;
    const layers = useLayers((state) => state.layers);

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
                            status={user.status}
                        />
                    </div>

                    <div className={styles.contentWrapper}>
                        <div>{user.displayName}</div>
                        <div className={styles.hoverContent}>
                            <div>{user.username}</div>
                            <div>
                                {user.customStatus
                                    ? user.customStatus
                                    : translateCap(
                                          user.status === "offline" ? "invisible" : user.status
                                      )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <button
                        onMouseEnter={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: settings.microphone ? "Mute" : "Unmute",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: settings.microphone ? "Mute" : "Unmute",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onBlur={() => setTooltip(null)}
                        onClick={(e) => {
                            setTooltip({
                                text: !settings.microphone ? "Mute" : "Unmute",
                                element: e.currentTarget,
                                gap: 3,
                            });

                            if (!settings.microphone && !settings.sound) {
                                setSettings("microphone", true);
                                setSettings("sound", true);
                                const audio = new Audio("/assets/sounds/undeafen.mp3");
                                audio.volume = 0.5;
                                audio.play();

                                // Speech
                                // const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
                                // const recognition = new SpeechRecognition();

                                // recognition.continous = true;
                                // recognition.interimResults = true;
                                // recognition.lang = "en-US";
                                // recognition.start();

                                // recognition.onresult = function () {
                                //     console.log("Speech result");
                                // };

                                // recognition.onspeechend = function () {
                                //     console.log("Speech ended");
                                // };
                            } else {
                                setSettings("microphone", !settings.microphone);
                                const audio = new Audio(`
                                    /assets/sounds/${settings.microphone ? "mute" : "unmute"}.mp3
                                `);
                                audio.volume = 0.5;
                                audio.play();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setTooltip({
                                    text: !settings.microphone ? "Mute" : "Unmute",
                                    element: e.currentTarget,
                                    gap: 3,
                                });

                                if (!settings.microphone && !settings.sound) {
                                    setSettings("microphone", true);
                                    setSettings("sound", true);
                                    const audio = new Audio("/assets/sounds/undeafen.mp3");
                                    audio.volume = 0.5;
                                    audio.play();
                                } else {
                                    setSettings("microphone", !settings.microphone);
                                    const audio = new Audio(`
                                        /assets/sounds/${
                                            settings.microphone ? "mute" : "unmute"
                                        }.mp3
                                    `);
                                    audio.volume = 0.5;
                                    audio.play();
                                }
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

                    <button
                        onMouseEnter={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: settings.sound ? "Deafen" : "Undeafen",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: settings.sound ? "Deafen" : "Undeafen",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onBlur={() => setTooltip(null)}
                        onClick={(e) => {
                            setTooltip({
                                text: !settings.sound ? "Deafen" : "Undeafen",
                                element: e.currentTarget,
                                gap: 3,
                            });

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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setTooltip({
                                    text: !settings.sound ? "Deafen" : "Undeafen",
                                    element: e.currentTarget,
                                    gap: 3,
                                });

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
                            }
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

                    <button
                        onMouseEnter={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: "User Settings",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => {
                            setTooltip(null);
                            setTooltip({
                                text: "User Settings",
                                element: e.currentTarget,
                                gap: 3,
                            });
                        }}
                        onBlur={() => setTooltip(null)}
                        onClick={() => {
                            setShowSettings("");
                            setTooltip(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setShowSettings("");
                            }
                        }}
                    >
                        <div className={styles.toolbar}>
                            <Icon
                                name="cog"
                                size={20}
                            />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
