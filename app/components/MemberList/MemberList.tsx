"use client";

import { useData, useLayers, useSettings, useTooltip, useUrls } from "@/lib/store";
import { translateCap, sanitizeString } from "@/lib/strings";
import { getButtonColor } from "@/lib/getColors";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useState, useEffect, useRef } from "react";
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

interface Props {
    channelId: TChannel;
    channel: TChannel;
    guild?: TGuild;
    user?: TCleanUser;
    friend?: TCleanUser | null;
}

export function MemberList({ channelId, channel, guild, user, friend }: Props) {
    const [showFriends, setShowFriends] = useState<boolean>(false);
    const [showGuilds, setShowGuilds] = useState<boolean>(false);
    const [originalNote, setOriginalNote] = useState<string>("");
    const [note, setNote] = useState<string>("");

    const setTooltip = useTooltip((state) => state.setTooltip);
    const settings = useSettings((state) => state.settings);
    const channels = useData((state) => state.channels);
    const friends = useData((state) => state.friends);
    const noteRef = useRef<HTMLTextAreaElement>(null);
    const guilds = useData((state) => state.guilds);
    const hasRendered = useRef<boolean>(false);
    const { sendRequest } = useFetchHelper();

    const recipients = guild
        ? guilds.find((g) => g.id === guild.id)?.members ?? []
        : channel
        ? channel.recipients ?? []
        : [];

    useEffect(() => {
        if (!friend) return;

        const getNote = async () => {
            const response = await sendRequest({
                query: "GET_NOTE",
                params: {
                    userId: friend.id,
                },
            });

            if (response.success) {
                setNote(response.note);
                setOriginalNote(response.note);
            }
        };

        const env = process.env.NODE_ENV;

        if (env == "development") {
            if (hasRendered.current) getNote();
            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            getNote();
        }
    }, []);

    if (!settings.showUsers) return null;

    if (friend) {
        // const mutualFriends = friends.filter((f: TCleanUser) => friend.friendIds.includes(f.id));
        // const mutualGuilds = guilds.filter((g: TGuild) => friend.guildIds.includes(g.id));

        const mutualFriends = [];
        const mutualGuilds = guilds.filter((g) => g.members.some((m) => m.userId == friend.id));

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
                                            ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${friend.banner}/`
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
                                backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${friend.avatar}/`,
                            }}
                        />

                        <div
                            className={styles.cardAvatarStatus}
                            onMouseEnter={(e) => {
                                setTooltip({
                                    text: translateCap(friend.status),
                                    element: e.currentTarget,
                                    gap: 5,
                                });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <div style={{ backgroundColor: "black" }} />

                            <svg>
                                <rect
                                    height="100%"
                                    width="100%"
                                    rx={8}
                                    ry={8}
                                    // @ts-ignore
                                    fill={colors[friend.status ?? "offline"]}
                                    // @ts-ignore
                                    mask={`url(#${masks[friend.status ?? "offline"]})`}
                                />
                            </svg>
                        </div>
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
                            <h4>Chat App Member Since</h4>
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
                                                params: {
                                                    userId: friend.id,
                                                },
                                                data: {
                                                    newNote: sanitizeString(note),
                                                },
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
