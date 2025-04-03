"use client";

import { Avatar, Icon, Tooltip, TooltipContent, TooltipTrigger } from "@components";
import { LocalParticipant, RemoteParticipant, Track } from "livekit-client";
import { useActiveVoice, useData, useSettings, useVoice } from "@/store";
import { useEffect, useMemo, useState } from "react";
import type {
    ChannelRecipient,
    DMChannelWithRecipients,
    GuildChannel,
    GuildChannelRecipient,
} from "@/type";
import styles from "./Call.module.css";
import {
    useParticipantAttributes,
    useDisconnectButton,
    useLocalParticipant,
    useParticipants,
    VideoTrack,
    useTracks,
    useRemoteParticipant,
} from "@livekit/components-react";
import { useParticipant } from "@livekit/react-core";

export function Call({
    hideChat,
    notInVoice,
    fullscreen,
    setHideChat,
    setFullScreen,
    currentChannel,
    setIsShowingVideos,
}: {
    hideChat: boolean;
    fullscreen: boolean;
    notInVoice: boolean;
    setHideChat: (hide: boolean) => void;
    setFullScreen: (fullScreen: boolean) => void;
    setIsShowingVideos: (showing: boolean) => void;
    currentChannel: DMChannelWithRecipients | GuildChannel;
}) {
    const [showDismiss, setShowDismiss] = useState(false);

    const { setSettings, settings } = useSettings();
    const { channelId, setChannelId } = useVoice();
    const participantsState = useParticipants();
    const local = useLocalParticipant();
    const { channels } = useData();

    const currentVoice = useActiveVoice((s) => s.rooms).find(
        (r) => r.channelId === currentChannel.id
    );

    const { buttonProps: disconnectProps } = useDisconnectButton({
        onClick: () => {
            setChannelId(null);
        },
    });

    const screenTrackRefs = useTracks([Track.Source.ScreenShare]);
    const cameraTrackRefs = useTracks([Track.Source.Camera]);

    const members = useMemo(() => {
        if (notInVoice && currentVoice) {
            return currentChannel.recipients
                .map((m) => {
                    return {
                        ...m,
                        sid: m.id,
                        isSpeaking: false,
                        isCameraEnabled: false,
                        identity: `user-${m.id}`,
                        isScreenShareEnabled: false,
                    };
                })
                .filter((m) => currentVoice.participants.includes(m.id));
        }

        return participantsState.map((p) => {
            const userId = p.identity.split("-")[1];
            const member = currentChannel.recipients.find((m) => m.id === Number(userId));

            return {
                ...p,
                ...member,
            };
        });
    }, [currentVoice, currentChannel, notInVoice, channelId, channels, participantsState]);

    const showingVideo = screenTrackRefs.length > 0 || cameraTrackRefs.length > 0;

    useEffect(() => {
        const isShowing = screenTrackRefs.length > 0 || cameraTrackRefs.length > 0;
        setIsShowingVideos(isShowing);
    }, [screenTrackRefs.length, cameraTrackRefs.length]);

    useEffect(() => {
        if (!currentVoice) {
            setShowDismiss(false);
            return;
        }

        if (currentVoice.hasJoined) {
            setShowDismiss(false);
            return;
        }

        function checkVoiceStarted() {
            if (!currentVoice) {
                setShowDismiss(false);
                return;
            }

            const startedDate = new Date(currentVoice.started * 1000);
            const currentDate = new Date();
            const diff = Math.abs(currentDate.getTime() - startedDate.getTime()) / 1000;

            setShowDismiss(diff < 30);
        }

        checkVoiceStarted();

        const interval = setInterval(() => {
            checkVoiceStarted();
        }, 1000);

        return () => clearInterval(interval);
    }, [currentVoice]);

    if (currentChannel.type === 3 && !currentVoice) {
        return (
            <div className={`${styles.container} ${styles.chatHidden}`}>
                <div className={styles.noone}>
                    <h1>{currentChannel.name}</h1>
                    <p>No one is currently in voice</p>
                    <button
                        className="button green"
                        onClick={() => {
                            setChannelId(currentChannel.id);
                        }}
                    >
                        Join Voice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles.container} ${
                showingVideo || currentVoice?.guildId ? styles.videos : ""
            } ${hideChat || fullscreen || currentVoice?.guildId ? styles.chatHidden : ""}`}
        >
            <div className={styles.participants}>
                {screenTrackRefs.map((trackRef, i) => {
                    const user = members.find((m) => m.sid === trackRef.participant.sid);

                    return (
                        <div
                            className={styles.video}
                            key={trackRef.participant.sid + i}
                        >
                            <span className={styles.live}>Live</span>
                            <VideoTrack trackRef={trackRef} />

                            <div className={styles.user}>
                                <Icon
                                    size={18}
                                    name="screen"
                                />

                                <p>{user?.displayName}</p>
                            </div>
                        </div>
                    );
                })}

                {(showingVideo || currentVoice?.guildId) &&
                    members.map((p) => (
                        <UserTile
                            key={p.sid}
                            participant={p as RemoteParticipant & ChannelRecipient}
                            participantPure={participantsState.find((part) => part.sid === p.sid)}
                        />
                    ))}

                {!showingVideo &&
                    !currentVoice?.guildId &&
                    members.map((p) => (
                        <UserCircle
                            key={p.sid}
                            participant={p as RemoteParticipant & ChannelRecipient}
                            participantPure={participantsState.find((part) => part.sid === p.sid)}
                        />
                    ))}
            </div>

            {notInVoice ? (
                <div className={styles.actions}>
                    <div />

                    <section>
                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    style={{ height: 48 }}
                                    className="button green"
                                    onClick={() => {
                                        setChannelId(currentChannel.id);
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        name="video"
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Join Video Call</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    style={{ height: 48 }}
                                    className="button green"
                                    onClick={() => {
                                        setChannelId(currentChannel.id);
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        name="call"
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Join Call</TooltipContent>
                        </Tooltip>

                        {showDismiss && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        style={{ height: 48 }}
                                        className="button red"
                                        onClick={() => {
                                            // to implement
                                        }}
                                    >
                                        <Icon
                                            size={20}
                                            name="cross"
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Dismiss</TooltipContent>
                            </Tooltip>
                        )}
                    </section>

                    <div />
                </div>
            ) : (
                !!local && (
                    <div className={styles.actions}>
                        {showingVideo ? (
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        className={`${styles.hideChat} ${
                                            hideChat || fullscreen ? styles.hidden : ""
                                        }`}
                                        onClick={() => {
                                            if (!fullscreen || hideChat) {
                                                setHideChat((prev) => !prev);
                                            }
                                            setFullScreen(false);
                                        }}
                                    >
                                        <Icon name="caret" />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {hideChat || fullscreen ? "Show Chat" : "Hide Chat"}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div />
                        )}

                        <section>
                            <div>
                                <div className={settings.microphone ? "" : styles.disabled}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={() => {
                                                    if (!settings.microphone && !settings.sound) {
                                                        setSettings("microphone", true);
                                                        setSettings("sound", true);

                                                        const audio = new Audio(
                                                            "/assets/sounds/undeafen.mp3"
                                                        );
                                                        audio.volume = 0.5;
                                                        audio.play();
                                                    } else {
                                                        setSettings(
                                                            "microphone",
                                                            !settings.microphone
                                                        );

                                                        const audio = new Audio(`
                                                    /assets/sounds/${
                                                        settings.microphone ? "mute" : "unmute"
                                                    }.mp3
                                                `);

                                                        audio.volume = 0.5;
                                                        audio.play();
                                                    }
                                                }}
                                            >
                                                <Icon
                                                    name={
                                                        settings.microphone ? "mic" : "micDisabled"
                                                    }
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>
                                            Turn {settings.microphone ? "Off" : "On"} Microphone
                                        </TooltipContent>
                                    </Tooltip>

                                    <button>
                                        <Icon
                                            size={16}
                                            name="caret"
                                        />
                                    </button>
                                </div>

                                <div className={local.isCameraEnabled ? styles.enabled : ""}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={() => {
                                                    local.localParticipant.setCameraEnabled(
                                                        !local.isCameraEnabled
                                                    );
                                                }}
                                            >
                                                <Icon
                                                    name={
                                                        local.isCameraEnabled
                                                            ? "video"
                                                            : "video-disabled"
                                                    }
                                                    preserveAspectRatio="xMidYMid meet"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>
                                            Turn {local.isCameraEnabled ? "Off" : "On"} Camera
                                        </TooltipContent>
                                    </Tooltip>

                                    <button>
                                        <Icon
                                            size={16}
                                            name="caret"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div>
                                {local.isScreenShareEnabled ? (
                                    <div
                                        className={local.isScreenShareEnabled ? styles.enabled : ""}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    onClick={() => {
                                                        local.localParticipant.setScreenShareEnabled(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    <Icon name="screen-cross" />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Stop Streaming</TooltipContent>
                                        </Tooltip>

                                        <button
                                            onClick={async () => {
                                                const tracks =
                                                    await local.localParticipant.createScreenTracks(
                                                        {
                                                            audio: true,
                                                        }
                                                    );

                                                await local.localParticipant.setScreenShareEnabled(
                                                    false
                                                );

                                                tracks.map((track) =>
                                                    local.localParticipant.publishTrack(track, {
                                                        // The highest possible
                                                        screenShareEncoding: {
                                                            maxBitrate: 510000,
                                                            maxFramerate: 60,
                                                        },
                                                    })
                                                );
                                            }}
                                        >
                                            <Icon
                                                size={16}
                                                name="caret"
                                            />
                                        </button>
                                    </div>
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={async () => {
                                                    const tracks =
                                                        await local.localParticipant.createScreenTracks(
                                                            { audio: true }
                                                        );

                                                    await local.localParticipant.setScreenShareEnabled(
                                                        false
                                                    );

                                                    tracks.map((track) =>
                                                        local.localParticipant.publishTrack(track, {
                                                            screenShareEncoding: {
                                                                maxBitrate: 1_500_000,
                                                                maxFramerate: 60,
                                                            },
                                                            audioPreset: {
                                                                maxBitrate: 510000,
                                                            },
                                                        })
                                                    );
                                                }}
                                            >
                                                <Icon name="screen-arrow" />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Share Your Screen</TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger>
                                        <button>
                                            <Icon name="dots" />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>More Options</TooltipContent>
                                </Tooltip>
                            </div>

                            <Tooltip>
                                <TooltipTrigger>
                                    <button {...disconnectProps}>
                                        <Icon
                                            name="phone-hangup"
                                            viewBox="-14 0 28 1"
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Disconnect</TooltipContent>
                            </Tooltip>
                        </section>

                        {showingVideo ? (
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        className={`${styles.fullscreen} ${
                                            fullscreen ? styles.active : ""
                                        }`}
                                        onClick={() => setFullScreen((prev) => !prev)}
                                    >
                                        <Icon
                                            name={fullscreen ? "exit-fullscreen" : "fullscreen"}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {fullscreen ? "Exit Full Screen" : "Full Screen"}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div />
                        )}
                    </div>
                )
            )}
        </div>
    );
}

function UserCircle({
    participant,
    participantPure,
}: {
    participant: (LocalParticipant | RemoteParticipant) & ChannelRecipient;
    participantPure: LocalParticipant | RemoteParticipant;
}) {
    const { attributes } = useParticipantAttributes({ participant: participantPure });
    const { isMuted, isDeafened } = attributes ?? { isMuted: false, isDeafened: false };

    return (
        <div
            key={participant.sid}
            className={styles.participant}
        >
            <Avatar
                size={80}
                type="user"
                muted={isMuted === "true"}
                alt={participant.username}
                fileId={participant.avatar}
                deafened={isDeafened === "true"}
                speaking={participant.isSpeaking}
                generateId={Number(participant.identity.split("-")[1])}
            />
        </div>
    );
}

function UserTile({
    participant,
    participantPure,
}: {
    participant: (LocalParticipant | RemoteParticipant) & ChannelRecipient;
    participantPure: LocalParticipant | RemoteParticipant;
}) {
    const { attributes } = useParticipantAttributes({ participant: participantPure });
    const { isMuted, isDeafened } = attributes ?? { isMuted: false, isDeafened: false };

    const cameraTrack = useTracks([Track.Source.Camera]).find(
        (t) => t.participant.sid === participant.sid && t.source === Track.Source.Camera
    );

    return (
        <div
            className={`${styles.participantBig} ${participant.isSpeaking ? styles.speaking : ""}`}
        >
            {cameraTrack && participantPure.isCameraEnabled ? (
                <div className={styles.video}>
                    <VideoTrack trackRef={cameraTrack} />
                </div>
            ) : (
                <Avatar
                    size={80}
                    type="user"
                    alt={participant.username}
                    fileId={participant.avatar}
                    generateId={Number(participant.identity.split("-")[1])}
                />
            )}

            <Tooltip>
                <TooltipTrigger>
                    <button>
                        <Icon
                            size={20}
                            name="dots"
                        />
                    </button>
                </TooltipTrigger>

                <TooltipContent>Options</TooltipContent>
            </Tooltip>

            <div
                className={`${styles.user} ${
                    isMuted === "true" || isDeafened === "true" ? styles.show : ""
                }`}
            >
                {isDeafened === "true" ? (
                    <Icon
                        size={18}
                        name="headsetDisabled"
                    />
                ) : isMuted === "true" ? (
                    <Icon
                        size={18}
                        name="micDisabled"
                    />
                ) : null}

                <p>{participant.displayName}</p>
            </div>
        </div>
    );
}
