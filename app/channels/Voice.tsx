"use client";

import { isLocalParticipant, Room, RoomEvent, Track } from "livekit-client";
import { useActiveVoice, useData, useSettings, useVoice } from "@/store";
import { useRequests } from "@/hooks/useRequests";
import { memo, useEffect, useMemo, useState } from "react";
import styles from "./Voice.module.css";
import {
    useLocalParticipant,
    useRoomContext,
    LiveKitRoom,
    AudioTrack,
    useTracks,
} from "@livekit/components-react";
import { Avatar, Icon, Tooltip, TooltipContent, TooltipTrigger } from "../components";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { usePathname } from "next/navigation";

export function VoiceHandler({ children }: { children: any }) {
    const [token, setToken] = useState<string | null>(null);
    const { channelId, setChannelId } = useVoice();
    const { authorizeVoice } = useRequests();
    const { settings } = useSettings();

    if (channelId === null && token !== null) {
        setToken(null);
    }

    async function getVoiceToken(id: number) {
        try {
            const { token } = await authorizeVoice.send(
                { channelId: id },
                { onComplete: () => console.log("Successfuly retrieved token.") }
            );

            if (!token) {
                console.error("Could not get voice token");
                return;
            }

            setToken(token);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (channelId) {
            setToken(null);
            getVoiceToken(channelId);
        }
    }, [channelId]);

    const childrenMemo = useMemo(() => {
        return children;
    }, [children]);

    return (
        <LiveKitRoom
            connect={!!token}
            token={token || ""}
            audio={settings.microphone}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onError={(err) => console.error("LiveKit error", err)}
            onConnected={() => {
                console.log("Connected to LiveKit");

                const audio = new Audio("/assets/sounds/user-join.mp3");
                audio.volume = 0.5;
                audio.play();
            }}
            onDisconnected={() => {
                console.log("Disconnected from LiveKit");

                const audio = new Audio("/assets/sounds/disconnect.mp3");
                audio.volume = 0.5;
                audio.play();
            }}
        >
            <StateHandlerWall />
            <CallHandler />

            {childrenMemo}
        </LiveKitRoom>
    );
}

function CallHandler({}) {
    const [currentCallingRoom, setCurrentCallingRoom] = useState<{
        channelId: number;
        guildId: number | null;
        started: number;
        startedBy: number;
        participants: number[];
    } | null>(null);

    const { rooms, setHasJoined } = useActiveVoice();
    const { channelId, setChannelId } = useVoice();
    const user = useAuthenticatedUser();
    const { channels } = useData();

    const pathname = usePathname();

    const isInChannel =
        currentCallingRoom && pathname.includes(currentCallingRoom.channelId.toString());
    const currentCallingChannel = channels.find((c) => c.id == channelId);

    const channel = useMemo(() => {
        if (currentCallingRoom) {
            return channels.find((channel) => channel.id == currentCallingRoom.channelId);
        }

        return null;
    }, [currentCallingRoom, channels]);

    const everyoneDismissed = useMemo(() => {
        const room = rooms.find((room) => room.channelId == channelId);

        let isEveryoneDismissed = false;

        // If every user except the caller have dismissed the call, stop outgoing call sound
        if (room && channel?.recipients && room.startedBy == user.id) {
            isEveryoneDismissed = channel.recipients
                .filter((r) => r.id != user.id)
                .every((r) => {
                    return room.haveDismissed.includes(r.id.toString());
                });
        }

        return isEveryoneDismissed;
    }, [user, rooms, currentCallingChannel]);

    useEffect(() => {
        const room = rooms.find((room) => {
            const started = room.started ? new Date(room.started * 1000) : null;
            return started && started.getTime() > Date.now() - 30 * 1000;
        });

        if (room && (!room.hasJoined || room.startedBy == user.id)) {
            setCurrentCallingRoom({
                ...room,
                started: room.started * 1000,
            });
        } else {
            setCurrentCallingRoom(null);
        }
    }, [rooms, user, channelId]);

    useEffect(() => {
        if (currentCallingRoom && !everyoneDismissed && !currentCallingRoom.guildId) {
            // While started is less than 30 seconds ago, play the ring sound
            const audio = new Audio(
                `/assets/sounds/${
                    currentCallingRoom.startedBy == user.id ? "outgoing" : "incoming"
                }-ring.mp3`
            );

            audio.volume = 0.5;
            audio.loop = true;
            audio.play();

            // Stop playing the sound after 30 seconds
            const interval = setInterval(() => {
                const started = currentCallingRoom.started
                    ? new Date(currentCallingRoom.started)
                    : null;

                if (started && started.getTime() < Date.now() - 30 * 1000) {
                    console.log("Stopping sound after 30 seconds");
                    audio.pause();
                    clearInterval(interval);
                    setCurrentCallingRoom(null);
                }
            }, 1000);

            return () => {
                audio.pause();
                clearInterval(interval);
                setCurrentCallingRoom(null);
            };
        }
    }, [user, currentCallingRoom, everyoneDismissed]);

    useEffect(() => {
        if (channelId) {
            setHasJoined(channelId, Date.now() / 1000);
        }
    }, [channelId]);

    useEffect(() => {
        console.log("Rooms: ", rooms);
    }, [rooms]);

    if (
        currentCallingRoom &&
        currentCallingRoom?.channelId != channelId &&
        channel &&
        !isInChannel
    ) {
        return (
            <div className={styles.callOverlay}>
                <div>
                    <Avatar
                        size={80}
                        alt={channel.name}
                        fileId={channel.icon}
                    />

                    <div>
                        <p>{channel.name}</p>
                        <p>Incoming Call...</p>
                    </div>
                </div>

                <div>
                    <Tooltip>
                        <TooltipTrigger>
                            <button onClick={() => setCurrentCallingRoom(null)}>
                                <Icon
                                    size={20}
                                    name="cross"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Dismiss</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                onClick={() => {
                                    setCurrentCallingRoom(null);
                                    setChannelId(currentCallingRoom.channelId);
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
                </div>
            </div>
        );
    }

    return null;
}

function StateHandlerWall() {
    const room = useRoomContext();
    return <StateHandler room={room} />;
}

function StateHandler({ room }: { room: Room }) {
    const [isScreenShareEnabled, setScreenShareEnabled] = useState(false);
    const local = useLocalParticipant();
    const { settings } = useSettings();

    const tracks = useTracks([
        Track.Source.Microphone,
        Track.Source.ScreenShareAudio,
        Track.Source.Unknown,
    ]).filter(
        (ref) => !isLocalParticipant(ref.participant) && ref.publication.kind === Track.Kind.Audio
    );

    useEffect(() => {
        function onJoin() {
            const audio = new Audio("/assets/sounds/user-join.mp3");
            audio.volume = 0.5;
            audio.play();
        }

        function onLeave() {
            const audio = new Audio("/assets/sounds/user-leave.mp3");
            audio.volume = 0.5;
            audio.play();
        }

        room.addListener(RoomEvent.ParticipantConnected, onJoin);
        room.addListener(RoomEvent.ParticipantDisconnected, onLeave);

        room.addListener(RoomEvent.TrackPublished, (track) => {
            if (track.kind === Track.Kind.Video) {
                const audio = new Audio("/assets/sounds/stream-started.mp3");
                audio.volume = 0.5;
                audio.play();
            }
        });

        room.addListener(RoomEvent.TrackUnpublished, (track) => {
            if (track.kind === Track.Kind.Video) {
                const audio = new Audio("/assets/sounds/stream-stopped.mp3");
                audio.volume = 0.5;
                audio.play();
            }
        });

        return () => {
            room.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (local && room.state === "connected") {
            local.localParticipant.setMicrophoneEnabled(settings.microphone);
            local.localParticipant.setAttributes({ isMuted: String(!settings.microphone) });
        }
    }, [local, settings.microphone]);

    useEffect(() => {
        if (local && room.state === "connected") {
            local.localParticipant.setAttributes({ isDeafened: String(!settings.sound) });
        }
    }, [local, settings.sound]);

    useEffect(() => {
        if (local.isScreenShareEnabled && !isScreenShareEnabled) {
            setScreenShareEnabled(true);

            const audio = new Audio("/assets/sounds/stream-started.mp3");
            audio.volume = 0.5;
            audio.play();
        } else if (!local.isScreenShareEnabled && isScreenShareEnabled) {
            setScreenShareEnabled(false);

            const audio = new Audio("/assets/sounds/stream-stopped.mp3");
            audio.volume = 0.5;
            audio.play();
        }
    }, [local.isScreenShareEnabled, isScreenShareEnabled]);

    return (
        <div style={{ display: "none" }}>
            {tracks.map((trackRef, i) => (
                <AudioTrack
                    volume={1.0}
                    trackRef={trackRef}
                    muted={!settings.sound}
                    key={trackRef.participant.sid + i}
                />
            ))}
        </div>
    );
}
