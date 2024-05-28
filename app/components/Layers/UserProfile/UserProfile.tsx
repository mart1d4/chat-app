"use client";

import { TLayer, useData, useLayers, useShowSettings, useUrls } from "@/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";
import { useEffect, useRef, useState } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import { sanitizeString } from "@/lib/strings";
import styles from "./UserProfile.module.css";
import { masks, colors } from "@/lib/avatars";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@components";
import { statuses } from "@/lib/statuses";

export const UserProfile = ({
    content,
    closing,
}: {
    content: TLayer["content"];
    closing: boolean;
}) => {
    const [activeNavItem, setActiveNavItem] = useState(0);
    const [originalNote, setOriginalNote] = useState("");
    const [note, setNote] = useState("");

    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const requestsReceived = useData((state) => state.received);
    const currentUser = useData((state) => state.user);
    const requestsSent = useData((state) => state.sent);
    const setLayers = useLayers((state) => state.setLayers);
    const friends = useData((state) => state.friends);
    const blocked = useData((state) => state.blocked);
    const layers = useLayers((state) => state.layers);
    const guilds = useData((state) => state.guilds);
    const { sendRequest } = useFetchHelper();

    const user = content.user;

    // const mutualFriends = friends.filter((friend: User) => user.friendIds.includes(friend.id));
    // const mutualGuilds = guilds.filter((guild: Guild) => user.guildIds.includes(guild.id));

    const mutualFriends: Partial<User>[] = [];
    const mutualGuilds: Partial<Guild>[] = guilds.filter((g) =>
        g.members.map((m) => m.userId).includes(user.id)
    );

    const noteRef = useRef<HTMLTextAreaElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const isSameUser = user.id === currentUser.id;

    useEffect(() => {
        if (content.guilds) setActiveNavItem(1);
        else setActiveNavItem(0);
        setNote("");
    }, [user]);

    useEffect(() => {
        const getNote = async () => {
            const response = await sendRequest({
                query: "GET_NOTE",
                params: { userId: user.id },
            });

            if (response?.ok) {
                const data = await response.json();
                setNote(data.note);
                setOriginalNote(data.note);
            }
        };

        getNote();
    }, []);

    const sectionNavItems = isSameUser
        ? ["User Info"]
        : ["User Info", "Mutual Servers", "Mutual Friends"];
    if (!user || layers.POPUP.length > 0) return null;

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
                    "--card-button-color": getButtonColor(
                        user.primaryColor,
                        user.accentColor as string
                    ),
                    "--card-border-color": user.primaryColor,
                    animationName: closing ? styles.popOut : "",
                } as React.CSSProperties
            }
        >
            <div>
                {isSameUser && (
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.editProfileButton}
                                onClick={() => setShowSettings({ type: "USER", tab: "Profiles" })}
                            >
                                <Icon
                                    name="edit"
                                    size={24}
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Edit Profile</TooltipContent>
                    </Tooltip>
                )}

                <svg
                    className={styles.cardBanner}
                    viewBox={`0 0 600 ${user.banner ? "212" : "106"}`}
                    style={{
                        minHeight: user.banner ? "212px" : "106px",
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
                                        ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}`
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
                            backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}`,
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
                                        rx={12}
                                        ry={12}
                                        fill={colors[user.status || "OFFLINE"]}
                                        mask={`url(#${masks[user.status || "OFFLINE"]})`}
                                    />
                                </svg>
                            </div>
                        </TooltipTrigger>

                        <TooltipContent>{statuses[user.status]}</TooltipContent>
                    </Tooltip>
                </div>

                <div className={styles.cardHeader}>
                    <div className={styles.cardBadges}></div>

                    {!isSameUser && (
                        <div className={styles.cardTools}>
                            {!blocked.map((u) => u.id).includes(user.id) && (
                                <>
                                    {requestsReceived.map((u) => u.id).includes(user.id) ? (
                                        <>
                                            <button
                                                className="button green"
                                                onClick={() =>
                                                    sendRequest({
                                                        query: "ADD_FRIEND",
                                                        body: { username: user.username },
                                                    })
                                                }
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="button grey"
                                                onClick={() =>
                                                    sendRequest({
                                                        query: "REMOVE_FRIEND",
                                                        body: {
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
                                            className="button green"
                                            onClick={() => {
                                                sendRequest({
                                                    query: "CHANNEL_CREATE",
                                                    body: {
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
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <button
                                                        className={
                                                            requestsSent
                                                                .map((u) => u.id)
                                                                .includes(user.id)
                                                                ? "button green disabled"
                                                                : "button green"
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !requestsSent
                                                                    .map((u) => u.id)
                                                                    .includes(user.id)
                                                            ) {
                                                                sendRequest({
                                                                    query: "ADD_FRIEND",
                                                                    body: {
                                                                        username: user.username,
                                                                    },
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {requestsSent
                                                            .map((u) => u.id)
                                                            .includes(user.id)
                                                            ? "Friend Request Sent"
                                                            : "Send Friend Request"}
                                                    </button>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    {!requestsSent
                                                        .map((u) => u.id)
                                                        .includes(user.id)
                                                        ? "You sent a friend request to this user."
                                                        : null}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                className={styles.moreButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLayers({
                                        settings: { type: "MENU", event: e },
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

                    {isSameUser && <div className={styles.divider} />}

                    {!isSameUser && (
                        <div className={styles.contentNav}>
                            <div>
                                {sectionNavItems.map((item, index) => (
                                    <button
                                        className={styles.contentNavItem}
                                        key={index}
                                        style={{
                                            color:
                                                activeNavItem === index
                                                    ? "var(--foreground-1)"
                                                    : "var(--foreground-3)",
                                            borderColor:
                                                activeNavItem === index
                                                    ? "var(--foreground-1)"
                                                    : "transparent",
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
                                    <h4>Spark Member Since</h4>
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
                                    <div
                                        style={{
                                            margin: "0 -4px",
                                            height: noteRef.current?.scrollHeight || 44,
                                            display: "flex",
                                        }}
                                    >
                                        <textarea
                                            className={styles.cardInput + " scrollbar"}
                                            ref={noteRef}
                                            value={note}
                                            autoFocus={!!content.focusNote}
                                            placeholder="Click to add a note"
                                            aria-label="Note"
                                            maxLength={256}
                                            autoCorrect="off"
                                            onInput={(e) => setNote(e.currentTarget.value)}
                                            onBlur={async () => {
                                                if (note !== originalNote) {
                                                    const trimmed = sanitizeString(note);
                                                    const response = await sendRequest({
                                                        query: "SET_NOTE",
                                                        params: { userId: user.id },
                                                        data: { note: trimmed },
                                                    });

                                                    if (response.success) setOriginalNote(trimmed);
                                                }
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
                                    <div className={styles.empty}>
                                        <div
                                            style={{
                                                backgroundImage: `url(/assets/system/no-servers.svg)`,
                                            }}
                                        />
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
                                        <div
                                            style={{
                                                backgroundImage: `url(/assets/system/no-friends.svg)`,
                                            }}
                                        />
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

function FriendItem({ friend, guild }: { friend?: User; guild?: Guild }) {
    if (!friend && !guild) return <></>;
    const setLayers = useLayers((state) => state.setLayers);
    const urls = useUrls((state) => state.guilds);
    const router = useRouter();

    let url: string | null = null;
    if (guild) {
        const guildUrl = urls.find((u) => u.guildId == guild.id);
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
                        type="avatars"
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
                {friend && friend.username}
                {guild && guild.name}
            </div>
        </button>
    );
}
