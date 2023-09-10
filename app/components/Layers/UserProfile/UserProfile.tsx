"use client";

import { useEffect, useRef, useState, ReactElement } from "react";
import { useData, useLayers, useTooltip, useUrls } from "@/lib/store";
import { getButtonColor } from "@/lib/colors/getColors";
import useContextHook from "@/hooks/useContextHook";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./UserProfile.module.css";
import { translateCap } from "@/lib/strings";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@components";

const colors = {
    ONLINE: "#22A559",
    IDLE: "#F0B232",
    DO_NOT_DISTURB: "#F23F43",
    INVISIBLE: "#80848E",
    OFFLINE: "#80848E",
};

const masks = {
    ONLINE: "",
    IDLE: "status-mask-idle",
    DO_NOT_DISTURB: "status-mask-dnd",
    INVISIBLE: "status-mask-offline",
    OFFLINE: "status-mask-offline",
};

export const UserProfile = ({ content }: any): ReactElement => {
    const [activeNavItem, setActiveNavItem] = useState<number>(0);
    const [note, setNote] = useState<string>("");

    const { setShowSettings }: any = useContextHook({ context: "layer" });
    const requestsReceived = useData((state) => state.requestsReceived);
    const currentUser = useData((state) => state.user) as TCleanUser;
    const requestsSent = useData((state) => state.requestsSent);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const friends = useData((state) => state.friends);
    const blocked = useData((state) => state.blocked);
    const guilds = useData((state) => state.guilds);
    const { sendRequest } = useFetchHelper();

    const user = content.user;
    const mutualFriends = friends.filter((friend: TCleanUser) => user.friendIds.includes(friend.id));
    const mutualGuilds = guilds.filter((guild: TGuild) => user.guildIds.includes(guild.id));

    const cardRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const isSameUser = () => user?.id === currentUser.id;

    useEffect(() => {
        if (content.focusNote) noteRef.current?.focus();
        setActiveNavItem(0);
        setNote("");
    }, [user]);

    const sectionNavItems = isSameUser() ? ["User Info"] : ["User Info", "Mutual Servers", "Mutual Friends"];
    if (!user) return <></>;

    return (
        <div
            ref={cardRef}
            className={styles.cardContainer}
            style={
                {
                    "--card-primary-color": user.primaryColor,
                    "--card-accent-color": user.accentColor,
                    "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                    "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                    "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                    "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                    "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                    "--card-button-color": getButtonColor(user.primaryColor, user.accentColor as string),
                    "--card-border-color": user.primaryColor,
                } as React.CSSProperties
            }
        >
            <div>
                {isSameUser() && (
                    <button
                        className={styles.editProfileButton}
                        aria-label="Edit Profile"
                        role="button"
                        onMouseEnter={(e) => {
                            setTooltip({
                                text: "Edit Profile",
                                element: e.currentTarget,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) => {
                            setTooltip({
                                text: "Edit Profile",
                                element: e.currentTarget,
                            });
                        }}
                        onBlur={() => setTooltip(null)}
                        onClick={() => {
                            setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                    setNull: true,
                                },
                            });
                            setTooltip(null);
                            setShowSettings({
                                type: "Profiles",
                            });
                        }}
                    >
                        <Icon
                            name="edit"
                            size={24}
                        />
                    </button>
                )}

                <svg
                    className={styles.cardBanner}
                    viewBox={`0 0 600 ${user.banner ? "212" : "108"}`}
                    style={{
                        minHeight: user.banner ? "212px" : "108px",
                        minWidth: "600px",
                    }}
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
                            cx="82"
                            cy={user.banner ? 207 : 101}
                            r="68"
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
                                className={styles.cardBannerBackground}
                                style={{
                                    backgroundColor: !user.banner ? user.primaryColor : "",
                                    backgroundImage: user.banner
                                        ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}/`
                                        : "",
                                    height: user.banner ? "212px" : "106px",
                                }}
                            />
                        </div>
                    </foreignObject>
                </svg>

                <div
                    className={styles.cardAvatar}
                    style={{ top: user.banner ? "151px" : "46px" }}
                >
                    <div
                        className={styles.avatarImage}
                        style={{
                            backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`,
                        }}
                    />

                    <div
                        className={styles.cardAvatarStatus}
                        onMouseEnter={(e) => {
                            setTooltip({
                                text: translateCap(user.status ?? "Offline"),
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
                                rx={12}
                                ry={12}
                                // @ts-ignore
                                fill={colors[user.status || "OFFLINE"]}
                                // @ts-ignore
                                mask={`url(#${masks[user.status || "OFFLINE"]})`}
                            />
                        </svg>
                    </div>
                </div>

                <div className={styles.cardHeader}>
                    <div className={styles.cardBadges}></div>

                    {!isSameUser() && (
                        <div className={styles.cardTools}>
                            {!blocked.map((u) => u.id).includes(user.id) && (
                                <>
                                    {requestsReceived.map((u) => u.id).includes(user.id) ? (
                                        <>
                                            <button
                                                className="green"
                                                onClick={() =>
                                                    sendRequest({
                                                        query: "ADD_FRIEND",
                                                        params: {
                                                            username: user.username,
                                                        },
                                                    })
                                                }
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="grey"
                                                onClick={() =>
                                                    sendRequest({
                                                        query: "REMOVE_FRIEND",
                                                        params: {
                                                            username: user.username,
                                                        },
                                                    })
                                                }
                                            >
                                                Ignore
                                            </button>
                                        </>
                                    ) : friends.map((u) => u.id).includes(user.id) ? (
                                        <button
                                            className="green"
                                            onClick={() => {
                                                sendRequest({
                                                    query: "CHANNEL_CREATE",
                                                    data: {
                                                        recipients: [user.id],
                                                    },
                                                });
                                                setLayers({
                                                    settings: {
                                                        type: "USER_PROFILE",
                                                        setNull: true,
                                                    },
                                                });
                                            }}
                                        >
                                            Send Message
                                        </button>
                                    ) : (
                                        <div>
                                            <button
                                                className={
                                                    requestsSent.map((u) => u.id).includes(user.id)
                                                        ? "green disabled"
                                                        : "green"
                                                }
                                                onClick={() => {
                                                    if (requestsSent.map((u) => u.id).includes(user.id)) {
                                                        return;
                                                    }
                                                    sendRequest({
                                                        query: "ADD_FRIEND",
                                                        params: {
                                                            username: user.username,
                                                        },
                                                    });
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!requestsSent.map((u) => u.id).includes(user.id)) return;
                                                    setTooltip({
                                                        text: "You sent a friend request to this user.",
                                                        element: e.currentTarget,
                                                        gap: 5,
                                                    });
                                                }}
                                                onMouseLeave={() => setTooltip(null)}
                                            >
                                                {requestsSent.map((u) => u.id).includes(user.id)
                                                    ? "Friend Request Sent"
                                                    : "Send Friend Request"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                className={styles.moreButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLayers({
                                        settings: {
                                            type: "MENU",
                                            event: e,
                                        },
                                        content: {
                                            type: "USER",
                                            user: user,
                                            userprofile: true,
                                        },
                                    });
                                }}
                            >
                                <Icon name="more" />
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.cardSection + " " + styles.name}>
                        <h4>{user.displayName}</h4>
                        <div>{user.username}</div>
                    </div>

                    {user.customStatus && (
                        <div className={styles.cardSection}>
                            <div>{user.customStatus}</div>
                        </div>
                    )}

                    {!isSameUser() && (
                        <div className={styles.contentNav}>
                            <div>
                                {sectionNavItems.map((item, index) => (
                                    <button
                                        className={styles.contentNavItem}
                                        key={index}
                                        style={{
                                            color:
                                                activeNavItem === index ? "var(--foreground-1)" : "var(--foreground-3)",
                                            borderColor:
                                                activeNavItem === index ? "var(--foreground-1)" : "transparent",
                                            cursor: activeNavItem === index ? "default" : "pointer",
                                        }}
                                        onClick={() => setActiveNavItem(index)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div
                        className={
                            styles.scrollContainer +
                            " scrollbar " +
                            ((activeNavItem === 2 && mutualFriends.length > 0) ||
                            (activeNavItem === 1 && mutualGuilds.length > 0)
                                ? styles.margin
                                : activeNavItem === 0
                                ? styles.padding
                                : "")
                        }
                    >
                        {activeNavItem === 0 && (
                            <>
                                {user.description && (
                                    <div className={styles.cardSection}>
                                        <h4>About me</h4>
                                        <div>{user.description}</div>
                                    </div>
                                )}

                                <div className={styles.cardSection}>
                                    <h4>Chat App Member Since</h4>
                                    <div>
                                        {new Intl.DateTimeFormat("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }).format(new Date(user.createdAt))}
                                    </div>
                                </div>

                                <div className={styles.cardSection}>
                                    <h4>Note</h4>
                                    <div style={{ overflow: "visible" }}>
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
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeNavItem === 1 && (
                            <>
                                {mutualGuilds.length > 0 ? (
                                    mutualGuilds.map((guild) => (
                                        <FriendItem
                                            key={guild.id}
                                            guild={guild}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.empty + " " + styles.noFriends}>
                                        <div />
                                        <div>No servers in common</div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeNavItem === 2 && (
                            <>
                                {mutualFriends.length > 0 ? (
                                    mutualFriends.map((friend) => (
                                        <FriendItem
                                            key={friend.id}
                                            friend={friend}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.empty + " " + styles.noFriends}>
                                        <div />
                                        <div>No friends in common</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FriendItem = ({ friend, guild }: { friend?: TCleanUser; guild?: TGuild }): ReactElement => {
    if (!friend && !guild) return <></>;
    const setLayers = useLayers((state) => state.setLayers);
    const urls = useUrls((state) => state.guilds);
    const router = useRouter();

    let url: string | null = null;
    if (guild) {
        const guildUrl = urls.find((u) => u.guildId === guild.id);
        if (guildUrl) url = `/channels/${guild.id}/${guildUrl.channelId}`;
    }

    return (
        <button
            className={styles.userItem}
            onClick={() => {
                if (friend) {
                    setLayers({
                        settings: {
                            type: "USER_PROFILE",
                        },
                        content: {
                            user: friend,
                        },
                    });
                } else if (guild) {
                    router.push(url || `/channels/${guild.id}`);
                    setLayers({
                        settings: {
                            type: "USER_PROFILE",
                            setNull: true,
                        },
                    });
                }
            }}
            onContextMenu={(e) => {
                setLayers({
                    settings: {
                        type: "MENU",
                        event: e,
                    },
                    content: {
                        type: friend ? "USER" : "GUILD_ICON",
                        user: friend,
                        guild: guild,
                    },
                });
            }}
        >
            <div>
                {friend && (
                    <Avatar
                        src={friend.avatar}
                        alt={friend.username}
                        size={40}
                        status={friend.status ?? "Offline"}
                    />
                )}

                {guild && (
                    <div
                        className={styles.guildIcon}
                        style={{
                            backgroundColor: guild.icon ? "transparent" : "",
                        }}
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
                {friend && friend.username}
                {guild && guild.name}
            </div>
        </button>
    );
};
