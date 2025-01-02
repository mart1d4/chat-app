"use client";

import { TooltipContent, TooltipTrigger, Tooltip, LoadingCubes, Avatar, Icon } from "@components";
import type { User, UserProfileResponse } from "@/type";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import { sanitizeString } from "@/lib/strings";
import { usePopoverContext } from "../Popover";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { colors, masks, statuses } from "@/lib/statuses";
import { useData } from "@/store";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

export function UserCard({
    user: userObj,
    animate,
    fromSettings,
}: {
    user: User;
    animate?: boolean;
    fromSettings?: boolean;
}) {
    const [user, setUser] = useState<null | UserProfileResponse>(null);
    const [message, setMessage] = useState<string>("");
    const [note, setNote] = useState<string>("");

    const channels = useData((state) => state.channels);
    const currentUser = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();
    const { setOpen } = usePopoverContext();
    const router = useRouter();

    useEffect(() => {
        async function handleKeyDown(e: KeyboardEvent) {
            if (!userObj || !currentUser) return;

            if (e.key === "Enter") {
                if (message.length > 0) {
                    setOpen(false);

                    // Check whether channel exists
                    const channel = channels.find((channel) => {
                        if (channel.type === 0) {
                            return channel.recipients.every((r) =>
                                [userObj.id, currentUser.id].includes(r.id)
                            );
                        }
                        return false;
                    });

                    let channelId;
                    if (!channel) {
                        const { data } = await sendRequest({
                            query: "CHANNEL_CREATE",
                            body: { recipients: [userObj.id] },
                        });

                        if (data?.channel) {
                            channelId = data.channel.id;
                        }
                    }

                    if (!channelId && !channel) return;

                    await sendRequest({
                        query: "SEND_MESSAGE",
                        params: {
                            channelId: channelId || channel?.id,
                        },
                        body: {
                            message: {
                                content: sanitizeString(message),
                                attachments: [],
                                messageReference: null,
                            },
                        },
                    });

                    router.push(`/channels/me/${channel?.id || channelId}`);
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [message, userObj.id, currentUser, channels, sendRequest]);

    useEffect(() => {
        async function getNote() {
            if (!userObj) return;

            const { data } = await sendRequest({
                query: "GET_NOTE",
                params: { userId: userObj.id },
            });

            if (data) {
                setNote(data.note);
            }
        }

        async function getProfile() {
            if (!userObj) return;

            const { data } = await sendRequest({
                query: "GET_USER_PROFILE",
                params: {
                    userId: userObj.id,
                    withMutualGuilds: true,
                    withMutualFriends: true,
                },
            });

            if (data) {
                setUser({
                    ...data.user,
                    mutualFriends: data.mutualFriends,
                    mutualGuilds: data.mutualGuilds,
                });
            }
        }

        getNote();
        getProfile();
    }, [userObj.id]);

    if (!user || !currentUser) {
        return (
            <div className={styles.loading}>
                <LoadingCubes />
            </div>
        );
    }

    return (
        <div
            className={`${styles.container} ${animate ? styles.animate : ""}`}
            style={
                {
                    "--card-primary-color": user.primaryColor,
                    "--card-accent-color": user.accentColor,
                    "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                    "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                    "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                    "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                    "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                    "--card-button-color": getButtonColor(user.primaryColor, user.accentColor),
                    "--card-border-color": user.primaryColor,
                } as React.CSSProperties
            }
        >
            <header>
                <svg
                    className={styles.banner}
                    viewBox="0 0 300 105"
                >
                    <mask id="card-banner-mask">
                        <rect
                            fill="white"
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                        />
                        <circle
                            fill="black"
                            cx="56"
                            cy="101"
                            r="46"
                        />
                    </mask>

                    <foreignObject
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        overflow="visible"
                        mask="url(#card-banner-mask)"
                    >
                        <div>
                            <div
                                className={styles.background}
                                style={{
                                    backgroundColor: !user.banner ? user.primaryColor : "",
                                    backgroundImage: user.banner
                                        ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}`
                                        : "",
                                    height: "105px",
                                }}
                            />
                        </div>
                    </foreignObject>
                </svg>

                <div className={styles.avatar}>
                    <div
                        aria-hidden="false"
                        aria-label={`${user.username}, ${statuses[user.status]}`}
                        style={{
                            width: "80px",
                            height: "80px",
                        }}
                    >
                        <svg
                            width="92"
                            height="92"
                            viewBox="0 0 92 92"
                        >
                            <foreignObject
                                mask="url(#status-mask-80)"
                                height="80"
                                width="80"
                                y="0"
                                x="0"
                            >
                                <div className={styles.overlay}>
                                    <img
                                        src={`${cdnUrl}${user.avatar}`}
                                        alt={`${user.username}, ${statuses[user.status]}`}
                                    />
                                </div>
                            </foreignObject>

                            <Tooltip>
                                <TooltipTrigger>
                                    <rect
                                        mask={`url(#${masks[user.status]})`}
                                        fill={colors[user.status]}
                                        height="16"
                                        width="16"
                                        rx="8"
                                        x="60"
                                        y="60"
                                    />
                                </TooltipTrigger>

                                <TooltipContent>{statuses[user.status]}</TooltipContent>
                            </Tooltip>
                        </svg>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <div>
                    <div>
                        <h1>{user.displayName}</h1>

                        <Tooltip>
                            <TooltipTrigger>
                                <button className={styles.note}>
                                    {note ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="16"
                                            width="16"
                                        >
                                            <path
                                                d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm1 4a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H6Zm-1 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6Z"
                                                fill="currentColor"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="16"
                                            width="16"
                                        >
                                            <path
                                                d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h9c.1 0 .12-.11.04-.15a3 3 0 0 1-2.03-3.16c.04-.34-.2-.69-.55-.69H6a1 1 0 1 1 0-2h9.5a.5.5 0 0 0 .5-.5V15a3 3 0 0 1 .19-1.05c.15-.4-.11-.95-.54-.95H6a1 1 0 1 1 0-2h12a1 1 0 0 1 .88.52c.13.24.35.48.62.52A3 3 0 0 1 21.83 14v.02c.02.06.17.05.17-.02V5a3 3 0 0 0-3-3H5Zm1 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H6Z"
                                                fill="currentColor"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                            />
                                            <path
                                                d="M19 14a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 1 1 0-2h3v-3a1 1 0 0 1 1-1Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>{note || "Add Note"}</TooltipContent>
                        </Tooltip>
                    </div>

                    <div>
                        <p>{user.username}</p>
                    </div>
                </div>

                {user.description && (
                    <div className={styles.description}>
                        <p>{user.description}</p>
                    </div>
                )}

                {(!!user.mutualFriends.length || !!user.mutualGuilds.length) && (
                    <div className={styles.mutuals}>
                        {!!user.mutualFriends.length && (
                            <section>
                                <div className={styles.avatars}>
                                    {Array.from(user.mutualFriends)
                                        .splice(0, 3)
                                        .map((friend) => (
                                            <div key={friend.id}>
                                                <Avatar
                                                    size={16}
                                                    src={friend.avatar}
                                                    alt={friend.displayName}
                                                />
                                            </div>
                                        ))}
                                </div>

                                <p>
                                    {user.mutualFriends.length} Mutual Friend
                                    {user.mutualFriends.length > 1 && "s"}
                                </p>
                            </section>
                        )}

                        {!!user.mutualFriends.length && !!user.mutualGuilds.length && (
                            <div className={styles.dot} />
                        )}

                        {!!user.mutualGuilds.length && (
                            <p>
                                {user.mutualGuilds.length} Mutual Server
                                {user.mutualGuilds.length > 1 && "s"}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {currentUser.id === user.id ? (
                <div className={styles.editProfile}>
                    <button className="button">
                        <Icon
                            name="edit"
                            size={16}
                        />
                        Edit Profile
                    </button>
                </div>
            ) : (
                <div className={styles.message}>
                    <input
                        type="text"
                        value={message}
                        placeholder={`Message @${user.displayName}`}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
