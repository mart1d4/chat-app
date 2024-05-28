"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import type { Channel, ChannelRecipient, Guild } from "@/type";
import { translateCap, sanitizeString } from "@/lib/strings";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLayers, useSettings, useUrls } from "@/store";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import styles from "./MemberList.module.css";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@components";
import { UserItem } from "./UserItem";

const colors = {
    online: "#22A559",
    idle: "#F0B232",
    dnd: "#F23F43",
    invisible: "#80848E",
    offline: "#80848E",
};

const masks = {
    online: "",
    idle: "status-mask-idle",
    dnd: "status-mask-dnd",
    invisible: "status-mask-offline",
    offline: "status-mask-offline",
};

export function MemberList({
    channel,
    guild,
    friend,
}: {
    channel: Channel;
    guild?: Guild;
    friend?: ChannelRecipient | null;
}) {
    const [showFriends, setShowFriends] = useState(false);
    const [showGuilds, setShowGuilds] = useState(false);
    const [originalNote, setOriginalNote] = useState("");
    const [note, setNote] = useState("");

    const [mutualFriends, setMutualFriends] = useState([]);
    const [mutualGuilds, setMutualGuilds] = useState([]);

    const settings = useSettings((state) => state.settings);
    const { sendRequest } = useFetchHelper();
    const noteRef = useRef(null);

    const recipients = useMemo(() => {
        if (guild) return guild.members;
        if (channel) return channel.recipients;
        return [];
    }, [guild, channel]);

    useEffect(() => {
        async function getNote() {
            if (!friend) return;

            const response = await sendRequest({
                query: "GET_NOTE",
                params: { userId: friend.id },
            });

            const data = await response.json();

            if (response?.ok) {
                setNote(data.note);
                setOriginalNote(data.note);
            } else {
                console.error(data.errors);
            }
        }

        async function getMutuals() {
            if (!friend) return;

            const response = await sendRequest({
                query: "GET_USER_PROFILE",
                params: {
                    userId: friend.id,
                    withMutualGuilds: true,
                    withMutualFriends: true,
                },
            });

            const data = await response.json();

            if (response?.ok) {
                const user = data.data.user;
                setMutualFriends(user.mutualFriends ?? []);
                setMutualGuilds(user.mutualGuilds ?? []);
            } else {
                console.error(data.errors);
            }
        }

        getNote();
        getMutuals();
    }, [friend]);

    if (!settings.showUsers) return null;

    if (friend) {
        return (
            <aside
                className={styles.aside}
                style={
                    {
                        "--card-primary-color": friend.primaryColor,
                        "--card-accent-color": friend.accentColor,
                        "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                        "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                        "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                        "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                        "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                        "--card-button-color": getButtonColor(
                            friend.primaryColor,
                            friend.accentColor
                        ),
                        "--card-border-color": friend.primaryColor,
                    } as React.CSSProperties
                }
            >
                <div>
                    <svg
                        className={styles.cardBanner}
                        viewBox="0 0 340 120"
                    >
                        <mask id="card-banner-mask-1">
                            <rect
                                fill="white"
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                            />
                            <circle
                                fill="black"
                                cx="58"
                                cy="112"
                                r="46"
                            />
                        </mask>

                        <foreignObject
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            overflow="visible"
                            mask="url(#card-banner-mask-1)"
                        >
                            <div>
                                <div
                                    className={styles.cardBannerBackground}
                                    style={{
                                        backgroundColor: !friend.banner ? friend.primaryColor : "",
                                        backgroundImage: friend.banner
                                            ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${friend.banner})`
                                            : "",
                                        height: "120px",
                                    }}
                                />
                            </div>
                        </foreignObject>
                    </svg>

                    <div className={styles.cardAvatar}>
                        <div
                            className={styles.avatarImage}
                            style={{
                                backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${friend.avatar})`,
                            }}
                        />

                        <Tooltip>
                            <TooltipTrigger>
                                <div className={styles.cardAvatarStatus}>
                                    <div style={{ backgroundColor: "black" }} />

                                    <svg>
                                        <rect
                                            height="100%"
                                            width="100%"
                                            rx={8}
                                            ry={8}
                                            fill={colors[friend.status ?? "offline"]}
                                            mask={`url(#${masks[friend.status ?? "offline"]})`}
                                        />
                                    </svg>
                                </div>
                            </TooltipTrigger>

                            <TooltipContent>{translateCap(friend.status)}</TooltipContent>
                        </Tooltip>
                    </div>

                    <div className={styles.cardBadges}></div>

                    <div className={styles.cardBody}>
                        <div className={styles.cardSection}>
                            <h4>{friend.displayName}</h4>
                            <div>{friend.username}</div>
                        </div>

                        {friend.customStatus && (
                            <div className={styles.cardSection}>
                                <div>{friend.customStatus}</div>
                            </div>
                        )}

                        <div className={styles.cardDivider} />

                        {friend.description && (
                            <div className={styles.cardSection}>
                                <h4>About me</h4>
                                <div>{friend.description}</div>
                            </div>
                        )}

                        <div className={styles.cardSection}>
                            <h4>Spark Member Since</h4>
                            <div>
                                {new Intl.DateTimeFormat("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                }).format(new Date(friend.createdAt))}
                            </div>
                        </div>

                        <div className={styles.cardDivider} />

                        <div className={styles.cardSection}>
                            <h4>Note</h4>
                            <div>
                                <textarea
                                    className={styles.cardInput + " scrollbar"}
                                    ref={noteRef}
                                    value={note}
                                    placeholder="Click to add a note"
                                    aria-label="Note"
                                    maxLength={256}
                                    autoCorrect="off"
                                    onInput={(e) => {
                                        setNote(e.currentTarget.value);
                                    }}
                                    onBlur={async () => {
                                        if (note !== originalNote) {
                                            const response = await sendRequest({
                                                query: "SET_NOTE",
                                                params: { userId: friend.id },
                                                body: { note: sanitizeString(note) },
                                            });

                                            if (response.success) {
                                                setOriginalNote(sanitizeString(note));
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.cardMutuals}>
                        {mutualGuilds.length > 0 && (
                            <>
                                <button
                                    className={"button"}
                                    onClick={() => setShowGuilds((prev) => !prev)}
                                >
                                    <div>
                                        {mutualGuilds?.length} Mutual Server
                                        {mutualGuilds?.length > 1 && "s"}
                                    </div>

                                    <div>
                                        <Icon
                                            name="caret"
                                            style={{
                                                transform: `rotate(${
                                                    showGuilds ? "90deg" : "0deg"
                                                })`,
                                            }}
                                        />
                                    </div>
                                </button>

                                {showGuilds && (
                                    <ul className={styles.mutualItems}>
                                        {mutualGuilds.map((guild: TGuild) => (
                                            <MutualItem
                                                key={guild.id}
                                                guild={guild}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}

                        {mutualFriends.length > 0 && (
                            <>
                                <button
                                    className={"button"}
                                    onClick={() => setShowFriends((prev) => !prev)}
                                >
                                    <div>
                                        {mutualFriends.length} Mutual Friend
                                        {mutualFriends.length > 1 && "s"}
                                    </div>

                                    <div>
                                        <Icon
                                            name="chevron"
                                            size={24}
                                            style={{
                                                transform: `rotate(${
                                                    !showFriends ? "-90deg" : "0deg"
                                                })`,
                                            }}
                                        />
                                    </div>
                                </button>

                                {showFriends && (
                                    <ul className={styles.mutualItems}>
                                        {mutualFriends.map((friend: TCleanUser) => (
                                            <MutualItem
                                                key={friend.id}
                                                user={friend}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </aside>
        );
    } else {
        let online, offline: TCleanUser[];

        if (guild) {
            online = recipients.filter((r) =>
                ["ONLINE", "IDLE", "DO_NOT_DISTURB"].includes(r.status)
            );
            offline = recipients.filter((r) => r.status === "offline");
        } else {
            online = recipients.filter((r) => ["online", "idle", "dnd"].includes(r.status));
            offline = recipients.filter((r) => r.status === "offline");
        }

        return (
            <aside className={styles.memberList}>
                <div>
                    {!channel?.guildId && <h2>Members—{channel.recipients.length}</h2>}
                    {channel?.guildId && online.length > 0 && <h2>Online — {online.length}</h2>}

                    {online?.length > 0 &&
                        online.map((user: TCleanUser) => (
                            <UserItem
                                key={user.id}
                                user={user}
                                channel={channel}
                                isOwner={
                                    guild ? guild.ownerId === user.id : channel.ownerId === user.id
                                }
                            />
                        ))}

                    {channel?.guildId && offline?.length > 0 && (
                        <h2>Offline — {offline?.length}</h2>
                    )}

                    {offline?.length > 0 &&
                        offline.map((user: TCleanUser) => (
                            <UserItem
                                key={user.id}
                                user={user}
                                channel={channel}
                                offline
                                isOwner={
                                    guild ? guild.ownerId === user.id : channel.ownerId === user.id
                                }
                            />
                        ))}
                </div>
            </aside>
        );
    }
}

function MutualItem({ user, guild }: { user?: TCleanUser; guild?: TGuild }) {
    if (!user && !guild) return <></>;
    const setLayers = useLayers((state) => state.setLayers);
    const urls = useUrls((state) => state.guilds);
    const router = useRouter();

    let url: string | null = null;
    if (guild) {
        const guildUrl = urls.find((u) => u.guildId === guild.id);
        if (guildUrl) url = `/channels/${guild.id}/${guildUrl.channelId}`;
    }

    return (
        <div
            tabIndex={0}
            className={styles.mutualItem}
            onClick={() => {
                if (user) {
                    setLayers({
                        settings: {
                            type: "USER_PROFILE",
                        },
                        content: {
                            user,
                        },
                    });
                } else if (guild) {
                    router.push(url || `/channels/${guild.id}`);
                }
            }}
            onContextMenu={(e) => {
                if (user) {
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "USER",
                            user: user,
                        },
                    });
                } else if (guild) {
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "GUILD_ICON",
                            guild: guild,
                        },
                    });
                }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    if (user) {
                        setLayers({
                            settings: {
                                type: "USER_PROFILE",
                            },
                            content: {
                                user,
                            },
                        });
                    } else if (guild) {
                        router.push(url || `/channels/${guild.id}`);
                    }
                } else if (e.key === "Enter") {
                    if (user) {
                        setLayers({
                            settings: {
                                type: "MENU",
                                element: e.currentTarget,
                                firstSide: "LEFT",
                            },
                            content: {
                                type: "USER",
                                user: user,
                            },
                        });
                    } else if (guild) {
                        setLayers({
                            settings: {
                                type: "MENU",
                                element: e.currentTarget,
                                firstSide: "LEFT",
                            },
                            content: {
                                type: "GUILD_ICON",
                                guild: guild,
                            },
                        });
                    }
                }
            }}
        >
            <div>
                {user && (
                    <Avatar
                        src={user.avatar}
                        alt={user.username}
                        type="avatars"
                        size={40}
                        status={user.status}
                    />
                )}

                {guild && (
                    <div
                        className={styles.guildIcon}
                        style={{ backgroundColor: guild.icon ? "transparent" : "" }}
                    >
                        {guild.icon ? (
                            <Avatar
                                src={guild.icon}
                                alt={guild.name}
                                type="icons"
                                size={40}
                            />
                        ) : (
                            guild.name
                                .toLowerCase()
                                .match(/\b(\w)/g)
                                ?.join("") ?? ""
                        )}
                    </div>
                )}
            </div>

            <div>
                {user && user.displayName}
                {guild && guild.name}
            </div>
        </div>
    );
}
