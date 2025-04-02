"use client";

import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useActiveVoice, useData, useSettings, useShowSettings, useVoice } from "@/store";
import styles from "./UserSection.module.css";
import { getStatusLabel } from "@/lib/utils";
import Link from "next/link";
import {
    useConnectionState,
    useDisconnectButton,
    useIsSpeaking,
    useLocalParticipant,
} from "@livekit/components-react";
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
import { useEffect, useState } from "react";

export function UserSection() {
    const { setSettings, settings } = useSettings();
    const { setShowSettings } = useShowSettings();
    const user = useAuthenticatedUser();
    const local = useLocalParticipant();
    const { channelId } = useVoice();

    const isSpeaking = useIsSpeaking(local.localParticipant);

    return (
        <Popover
            mainOffset={12}
            crossOffset={-26}
            placement="top-start"
        >
            {!!channelId && <VoiceState />}

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
                                    speaking={isSpeaking}
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
                                                /assets/sounds/${
                                                    settings.microphone ? "mute" : "unmute"
                                                }.mp3
                                            `);

                                            audio.volume = 0.5;
                                            audio.play();
                                        }
                                    }}
                                    className={settings.microphone ? "" : styles.cut}
                                >
                                    <div className={styles.toolbar}>
                                        <Icon
                                            size={20}
                                            name={settings.microphone ? "mic" : "micDisabled"}
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
                                            /assets/sounds/${
                                                settings.sound ? "deafen" : "undeafen"
                                            }.mp3
                                        `);

                                        audio.volume = 0.5;
                                        audio.play();
                                    }}
                                    className={settings.sound ? "" : styles.cut}
                                >
                                    <div className={styles.toolbar}>
                                        <Icon
                                            size={20}
                                            name={settings.sound ? "headset" : "headsetDisabled"}
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

function VoiceState() {
    const { channelId, setChannelId } = useVoice();
    const local = useLocalParticipant();
    const krisp = useKrispNoiseFilter();
    const state = useConnectionState();
    const { channels } = useData();

    const currentRoom = useActiveVoice((s) => s.rooms).find((r) => r.channelId === channelId);
    const currentChannel = channels.find((c) => c.id === channelId);

    const [currentTime, setCurrentTime] = useState(
        currentRoom?.hasJoined ? Date.now() - currentRoom.hasJoined * 1000 : 0
    );

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentRoom?.hasJoined) {
                setCurrentTime(Date.now() - currentRoom.hasJoined * 1000);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentRoom]);

    const { buttonProps: disconnectProps } = useDisconnectButton({
        onClick: () => {
            setChannelId(null);
        },
    });

    const isStreaming = local?.isScreenShareEnabled || local?.isCameraEnabled;

    return (
        <>
            {isStreaming && (
                <div className={styles.streamContainer}>
                    <div>
                        <Avatar
                            size={32}
                            type="user"
                            alt="Streaming Source"
                            generateId={2883728273}
                        />
                    </div>

                    <div>
                        <p>Screen 2</p>
                        <p>1440p 60FPS</p>
                    </div>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                onClick={() => {
                                    local.localParticipant.setScreenShareEnabled(false);
                                }}
                            >
                                <Icon name="screen-cross" />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Stop Streaming</TooltipContent>
                    </Tooltip>
                </div>
            )}

            <div className={styles.voiceContainer}>
                <header>
                    <div className={styles.stats}>
                        <div
                            style={{
                                color:
                                    state === "connected"
                                        ? "var(--success-light)"
                                        : state === "connecting"
                                        ? "var(--warning-0)"
                                        : "var(--danger-0)",
                            }}
                        >
                            <Icon
                                size={16}
                                name={state === "connected" ? "signal" : "signal-poor"}
                            />

                            <button>Voice {state.charAt(0).toUpperCase() + state.slice(1)}</button>
                        </div>

                        <Link href={`/channels/me/${channelId}`}>
                            <p>{currentChannel?.name ?? "Unknown channel"}</p>
                            <p>Connected for {new Date(currentTime).toISOString().slice(11, 19)}</p>
                        </Link>
                    </div>

                    <div className={styles.actions}>
                        <Tooltip>
                            <TooltipTrigger>
                                <button>
                                    <Icon
                                        name={
                                            krisp.isNoiseFilterEnabled ? "krisp" : "krisp-disabled"
                                        }
                                        viewBox={
                                            krisp.isNoiseFilterEnabled
                                                ? "0 25 550 500"
                                                : "0 0 24 24"
                                        }
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Noise Suppression powered by Krisp</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger>
                                <button {...disconnectProps}>
                                    <Icon
                                        name="phone-hangup"
                                        viewBox="-12.5 -5 24 9"
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Disconnect</TooltipContent>
                        </Tooltip>
                    </div>
                </header>

                <div className={styles.tools}>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={local.isCameraEnabled ? styles.enabled : ""}
                                onClick={() => {
                                    if (!local.isCameraEnabled) {
                                        local.localParticipant.setCameraEnabled(true);
                                    }
                                }}
                            >
                                <Icon name="video-disabled" />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Turn On Camera</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={local.isScreenShareEnabled ? styles.enabled : ""}
                                onClick={() => {
                                    if (!local.isScreenShareEnabled) {
                                        local.localParticipant.setScreenShareEnabled(true);
                                    }
                                }}
                            >
                                <Icon
                                    name={local.isScreenShareEnabled ? "screen" : "screen-arrow"}
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Share Your Screen</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button>
                                <Icon name="video-disabled" />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Turn On Camera</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button>
                                <Icon name="screen-arrow" />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Share Your Screen</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </>
    );
}
