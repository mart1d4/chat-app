"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useSettings, useShowSettings } from "@/store";
import styles from "./UserSection.module.css";
import { getStatusLabel } from "@/lib/utils";
import {
    PopoverContent,
    PopoverTrigger,
    TooltipContent,
    TooltipTrigger,
    UserCard,
    Tooltip,
    Popover,
    Avatar,
    Icon,
} from "@components";

export function UserSection() {
    const { setSettings, settings } = useSettings();
    const { setShowSettings } = useShowSettings();
    const user = useAuthenticatedUser();

    return (
        <Popover
            mainOffset={12}
            crossOffset={-26}
            placement="top-start"
        >
            <div className={styles.userSectionContainer}>
                <div className={styles.userSection}>
                    <PopoverTrigger>
                        <div
                            tabIndex={0}
                            className={styles.avatarWrapper}
                        >
                            <div>
                                <Avatar
                                    size={32}
                                    type="user"
                                    alt={user.username}
                                    fileId={user.avatar}
                                    status={user.status}
                                    generateId={user.id}
                                />
                            </div>

                            <div className={styles.contentWrapper}>
                                <div>{user.displayName}</div>
                                <div className={styles.hoverContent}>
                                    <div>{user.username}</div>
                                    <div>
                                        {user.customStatus
                                            ? user.customStatus
                                            : getStatusLabel(user.status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PopoverTrigger>

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

                            <TooltipContent>
                                {settings.sound ? "Deafen" : "Undeafen"}
                            </TooltipContent>
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

            <PopoverContent>
                <UserCard
                    me
                    initUser={user}
                />
            </PopoverContent>
        </Popover>
    );
}
