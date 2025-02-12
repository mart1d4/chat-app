"use client";

import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import type { AppUser, KnownUser, User, UserGuild, UserProfile } from "@/type";
import { useData, useShowSettings, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useState, useEffect, Fragment } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import { sanitizeString } from "@/lib/strings";
import { usePopoverContext } from "../Popover";
import { getCdnUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import Image from "next/image";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    LoadingCubes,
    MenuContent,
    MenuDivider,
    MenuTrigger,
    UserMenu,
    MenuItem,
    Tooltip,
    Avatar,
    Icon,
    Menu,
} from "@components";

export function UserCard({
    initUser,
    me,
    mode,
    onAvatarClick,
    onBannerClick,
}: {
    initUser: typeof mode extends "edit" ? AppUser : User["id"] & Partial<User>;
    me?: boolean;
    mode?: "edit";
    onAvatarClick?: () => void;
    onBannerClick?: () => void;
}) {
    const [mutualFriends, setMutualFriends] = useState<KnownUser[]>([]);
    const [mutualGuilds, setMutualGuilds] = useState<UserGuild[]>([]);
    const [usernameCopied, setUsernameCopied] = useState(false);
    const [user, setUser] = useState<null | UserProfile | AppUser>(
        mode === "edit" ? initUser : null
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [note, setNote] = useState("");

    const { channels, updateUser, friends, received, sent, blocked } = useData();
    const { setOpen } = !mode ? usePopoverContext() : { setOpen: () => {} };
    const { setShowSettings } = useShowSettings();
    const { triggerDialog } = useTriggerDialog();
    const currentUser = useAuthenticatedUser();
    const { sendRequest } = useFetchHelper();
    const router = useRouter();

    const isFriend = friends.find((friend) => friend.id === initUser.id);
    const isSent = sent.find((friend) => friend.id === initUser.id);
    const isReceived = received.find((friend) => friend.id === initUser.id);
    const isBlocked = blocked.find((friend) => friend.id === initUser.id);

    async function handleChangeStatus(status: User["status"]) {
        if (loading || !user) return;
        setLoading(true);

        try {
            const { data } = await sendRequest({
                query: "UPDATE_USER",
                body: { status },
            });

            if (data?.user) {
                setUser((prev) => ({ ...(prev as UserProfile), status }));
                updateUser({ status });
            } else {
                console.error("Failed to update user status");
            }
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    async function sendMessage() {
        if (loading) return;
        setLoading(true);

        if (message.length > 0) {
            // Check whether channel exists
            const channel = channels.find((channel) => {
                if (channel.type === 0) {
                    const first = channel.recipients[0];
                    const second = channel.recipients[1];

                    return (
                        (first.id === initUser.id && second.id === currentUser.id) ||
                        (first.id === currentUser.id && second.id === initUser.id)
                    );
                }

                return false;
            });

            let channelId;
            if (!channel) {
                const { data } = await sendRequest({
                    query: "CHANNEL_CREATE",
                    body: { recipients: [initUser.id] },
                });

                if (data?.channel) {
                    channelId = data.channel.id;
                }
            }

            if (!channelId && !channel) return;

            const { errors } = await sendRequest({
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

            if (!errors) {
                setMessage("");
                router.push(`/channels/me/${channelId || channel?.id}`);
                setOpen(false);
            }
        }

        setLoading(false);
    }

    async function deleteStatus() {
        try {
            const { data } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    customStatus: "",
                },
            });

            if (data?.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function getNote() {
        if (!initUser) return;

        const { data } = await sendRequest({
            query: "GET_NOTE",
            params: { userId: initUser.id },
        });

        if (data) {
            setNote(data.note);
        }
    }

    async function getProfile() {
        if (!initUser) return;

        const { data } = await sendRequest({
            query: "GET_USER_PROFILE",
            params: {
                userId: initUser.id,
                withMutualGuilds: true,
                withMutualFriends: true,
            },
        });

        if (data?.user) {
            setUser(data.user);
            setMutualFriends(data.mutualFriends);
            setMutualGuilds(data.mutualGuilds);
        }
    }

    async function addFriend() {
        if (loading || !user) return;
        setLoading(true);

        try {
            const { errors } = await sendRequest({
                query: "ADD_FRIEND",
                body: { username: user.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    async function removeFriend() {
        if (loading || !user) return;
        setLoading(true);

        try {
            const { errors } = await sendRequest({
                query: "REMOVE_FRIEND",
                body: { username: user.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    useEffect(() => {
        if (mode === "edit") return;

        getNote();
        getProfile();
    }, [mode]);

    useEffect(() => {
        if (mode === "edit") {
            setUser(initUser);
        }
    }, [initUser]);

    if (!user || !currentUser) {
        return (
            <div className={styles.loading}>
                <LoadingCubes />
            </div>
        );
    }

    const isSameUser = currentUser.id === user.id;

    return (
        <div
            className={styles.container}
            style={
                {
                    "--card-primary-color": user.bannerColor,
                    "--card-accent-color": user.accentColor,
                    "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                    "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                    "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                    "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                    "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                    "--card-button-color": user.accentColor
                        ? getButtonColor(user.bannerColor, user.accentColor)
                        : "",
                    "--card-border-color": user.bannerColor,
                } as React.CSSProperties
            }
        >
            <header style={{ paddingBottom: isSameUser || user.customStatus ? "0" : "" }}>
                <InteractiveElement
                    element="svg"
                    viewBox="0 0 300 105"
                    tabIndex={mode ? 0 : -1}
                    className={styles.banner}
                    onClick={() => {
                        if (onBannerClick) {
                            onBannerClick();
                        }
                    }}
                >
                    <mask id="card-banner-mask">
                        <rect
                            x="0"
                            y="0"
                            fill="white"
                            width="100%"
                            height="100%"
                        />
                        <circle
                            r="46"
                            cx="56"
                            cy="101"
                            fill="black"
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
                        <div
                            className={`${mode === "edit" ? styles.overlay : ""} ${styles.banner}`}
                        >
                            <div
                                className={styles.background}
                                style={{
                                    height: "105px",
                                    backgroundImage: user.banner
                                        ? user.banner instanceof File
                                            ? `url(${URL.createObjectURL(user.banner)}`
                                            : `url(${getCdnUrl}${user.banner}`
                                        : "",
                                    backgroundColor: !user.banner ? user.bannerColor : "",
                                }}
                            />

                            {mode === "edit" && <p>Change Banner</p>}
                        </div>
                    </foreignObject>
                </InteractiveElement>

                <InteractiveElement
                    element="div"
                    className={styles.avatar}
                    onClick={() => {
                        if (onAvatarClick) {
                            onAvatarClick();
                            return;
                        }

                        triggerDialog({
                            type: "USER_PROFILE",
                            data: { user },
                        });
                        setOpen(false);
                    }}
                >
                    <div
                        aria-hidden="false"
                        style={{ width: "80px", height: "80px" }}
                        aria-label={`${user.username}, ${getStatusLabel(user.status)}`}
                    >
                        <svg
                            width="92"
                            height="92"
                            viewBox="0 0 92 92"
                        >
                            <foreignObject
                                x="0"
                                y="0"
                                width="80"
                                height="80"
                                mask="url(#status-mask-80)"
                            >
                                <div className={styles.overlay}>
                                    <Image
                                        width={80}
                                        height={80}
                                        draggable={false}
                                        src={
                                            user.avatar
                                                ? user.avatar instanceof File
                                                    ? URL.createObjectURL(user.avatar)
                                                    : `${getCdnUrl}${user.avatar}`
                                                : getRandomImage(user.id, "avatar")
                                        }
                                        alt={`${user.username}, ${getStatusLabel(user.status)}`}
                                    />

                                    {mode === "edit" && (
                                        <div>
                                            <Icon
                                                size={20}
                                                name="edit"
                                            />
                                        </div>
                                    )}
                                </div>
                            </foreignObject>

                            <Tooltip
                                gap={10}
                                delay={500}
                            >
                                <TooltipTrigger>
                                    <rect
                                        x="60"
                                        y="60"
                                        rx="8"
                                        width="16"
                                        height="16"
                                        fill={getStatusColor(user.status)}
                                        mask={`url(#${getStatusMask(user.status)})`}
                                    />
                                </TooltipTrigger>

                                <TooltipContent>{getStatusLabel(user.status)}</TooltipContent>
                            </Tooltip>
                        </svg>
                    </div>
                </InteractiveElement>

                {(isSameUser || user.customStatus) && (
                    <div style={{ maxHeight: "58px" }}>
                        <div
                            tabIndex={user.customStatus ? -1 : 0}
                            role={user.customStatus ? "div" : "button"}
                            className={`${styles.customStatus} ${
                                user.customStatus ? styles.active : ""
                            } ${!isSameUser ? styles.disabled : ""}`}
                            onClick={() => {
                                if (!isSameUser) return;
                                if (!user.customStatus) {
                                    triggerDialog({ type: "USER_STATUS" });
                                    setOpen(false);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !user.customStatus) {
                                    if (!isSameUser) return;
                                    triggerDialog({ type: "USER_STATUS" });
                                    setOpen(false);
                                }
                            }}
                        >
                            <div>
                                <span className={styles.statusContent}>
                                    <div>
                                        {!user.customStatus && (
                                            <Icon
                                                size={18}
                                                name="add-circle"
                                            />
                                        )}

                                        <div>{user.customStatus || "Add Status"}</div>
                                    </div>
                                </span>
                            </div>

                            {isSameUser && user.customStatus && (
                                <div className={styles.statusTools}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={() => {
                                                    triggerDialog({ type: "USER_STATUS" });
                                                    setOpen(false);
                                                }}
                                            >
                                                <Icon
                                                    size={16}
                                                    name="edit"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button onClick={deleteStatus}>
                                                <Icon
                                                    size={16}
                                                    name="delete"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Clear</TooltipContent>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {!isSameUser && (
                <div className={styles.topTools}>
                    {!isBlocked &&
                        (!isFriend ? (
                            isReceived || isSent ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button disabled>
                                            <Icon
                                                size={18}
                                                name="user-pending"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Pending</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button onClick={addFriend}>
                                            <Icon
                                                size={18}
                                                name="user-add"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Add Friend</TooltipContent>
                                </Tooltip>
                            )
                        ) : (
                            <Menu placement="right-start">
                                <Tooltip>
                                    <MenuTrigger>
                                        <TooltipTrigger>
                                            <button>
                                                <Icon
                                                    size={18}
                                                    name="user-friend"
                                                />
                                            </button>
                                        </TooltipTrigger>
                                    </MenuTrigger>

                                    <TooltipContent>Friends</TooltipContent>
                                </Tooltip>

                                <MenuContent>
                                    <MenuItem
                                        danger
                                        onClick={() => {
                                            setOpen(false);
                                            triggerDialog({
                                                type: "REMOVE_FRIEND",
                                                data: { user },
                                            });
                                        }}
                                    >
                                        Remove Friend
                                    </MenuItem>
                                </MenuContent>
                            </Menu>
                        ))}

                    <Menu placement="right-start">
                        <Tooltip>
                            <MenuTrigger>
                                <TooltipTrigger>
                                    <button>
                                        <Icon
                                            size={18}
                                            name="dots"
                                        />
                                    </button>
                                </TooltipTrigger>
                            </MenuTrigger>

                            <TooltipContent>More</TooltipContent>
                        </Tooltip>

                        <UserMenu
                            user={user}
                            type="card"
                        />
                    </Menu>
                </div>
            )}

            <div className={styles.content}>
                <div>
                    <div>
                        <InteractiveElement
                            element="h1"
                            tabIndex={mode ? -1 : 0}
                            className={mode ? styles.disabled : ""}
                            onClick={() => {
                                if (mode) return;
                                triggerDialog({
                                    type: "USER_PROFILE",
                                    data: { user },
                                });
                                setOpen(false);
                            }}
                        >
                            {user.displayName}
                        </InteractiveElement>

                        {!mode && (
                            <Tooltip
                                background={usernameCopied ? "var(--success-light)" : undefined}
                            >
                                <TooltipTrigger>
                                    <button
                                        className={styles.note}
                                        onClick={() => {
                                            if (me) {
                                                try {
                                                    navigator.clipboard.writeText(user.username);
                                                    setUsernameCopied(true);
                                                    setTimeout(
                                                        () => setUsernameCopied(false),
                                                        2000
                                                    );
                                                } catch (error) {
                                                    console.error(error);
                                                }
                                            } else {
                                                triggerDialog({
                                                    type: "USER_PROFILE",
                                                    data: { user, focusNote: true },
                                                });
                                                setOpen(false);
                                            }
                                        }}
                                    >
                                        <Icon
                                            size={16}
                                            name={me ? "copy" : note ? "note" : "note-add"}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {me
                                        ? usernameCopied
                                            ? "Copied!"
                                            : "Copy Username"
                                        : note || "Add Note"}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    <div>
                        <InteractiveElement
                            element="p"
                            tabIndex={mode ? -1 : 0}
                            className={mode ? styles.disabled : ""}
                            onClick={() => {
                                if (mode) return;
                                triggerDialog({
                                    type: "USER_PROFILE",
                                    data: { user },
                                });
                                setOpen(false);
                            }}
                        >
                            {user.username}
                        </InteractiveElement>
                    </div>
                </div>

                {isReceived && (
                    <section className={styles.received}>
                        <div>
                            <strong>{user.displayName}</strong> sent you a friend request.
                        </div>
                        <div>
                            <button
                                onClick={addFriend}
                                className="button blue small"
                            >
                                Accept
                            </button>

                            <button
                                onClick={removeFriend}
                                className="button grey small"
                            >
                                Ignore
                            </button>
                        </div>
                    </section>
                )}

                {isBlocked && (
                    <section className={styles.blocked}>
                        <div>You blocked them</div>
                    </section>
                )}

                {!isBlocked && user.description && (
                    <div className={styles.description}>
                        <p>{user.description}</p>
                    </div>
                )}

                {!isBlocked &&
                    currentUser.id !== user.id &&
                    (!!mutualFriends.length || !!mutualGuilds.length) && (
                        <div className={styles.mutuals}>
                            {!!mutualFriends.length && (
                                <section
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => {
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user, startingTab: 1 },
                                        });
                                        setOpen(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            triggerDialog({
                                                type: "USER_PROFILE",
                                                data: { user, startingTab: 1 },
                                            });
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    <div className={styles.avatars}>
                                        {Array.from(mutualFriends)
                                            .splice(0, 3)
                                            .map((friend) => (
                                                <div key={friend.id}>
                                                    <Avatar
                                                        size={16}
                                                        type="user"
                                                        fileId={friend.avatar}
                                                        generateId={friend.id}
                                                        alt={friend.displayName}
                                                    />
                                                </div>
                                            ))}
                                    </div>

                                    <p>
                                        {mutualFriends.length} Mutual Friend
                                        {mutualFriends.length > 1 && "s"}
                                    </p>
                                </section>
                            )}

                            {!!mutualFriends.length && !!mutualGuilds.length && (
                                <div className={styles.dot} />
                            )}

                            {!!mutualGuilds.length && (
                                <section
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => {
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user, startingTab: 2 },
                                        });
                                        setOpen(false);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            triggerDialog({
                                                type: "USER_PROFILE",
                                                data: { user, startingTab: 2 },
                                            });
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    {!mutualFriends.length && (
                                        <div className={styles.avatars}>
                                            {Array.from(mutualGuilds)
                                                .splice(0, 3)
                                                .map((guild) => (
                                                    <div key={guild.id}>
                                                        <Avatar
                                                            size={16}
                                                            type="guild"
                                                            alt={guild.name}
                                                            generateId={guild.id}
                                                            guildName={guild.name}
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    <p>
                                        {mutualGuilds.length} Mutual Server
                                        {mutualGuilds.length > 1 && "s"}
                                    </p>
                                </section>
                            )}
                        </div>
                    )}
            </div>

            {me ? (
                <div className={styles.menus}>
                    <section>
                        <button
                            className="button"
                            onClick={() => {
                                setShowSettings({ type: "USER", tab: "Profiles" });
                                setOpen(false);
                            }}
                        >
                            <Icon
                                size={16}
                                name="edit"
                            />

                            <span>Edit profile</span>
                        </button>

                        <div className={styles.divider} />

                        <Menu
                            gap={12}
                            openOnHover
                            openOnFocus
                            placement="right-start"
                        >
                            <MenuTrigger>
                                <button className="button">
                                    <StatusIcon status={user.status} />

                                    <span>{getStatusLabel(user.status)}</span>

                                    <Icon
                                        size={16}
                                        name="caret"
                                    />
                                </button>
                            </MenuTrigger>

                            <MenuContent>
                                {["online", "idle", "dnd", "invisible"].map((status, i) => (
                                    <Fragment key={`status-${status}`}>
                                        <MenuItem onClick={() => handleChangeStatus(status)}>
                                            <div className={styles.statusItem}>
                                                <StatusIcon
                                                    size={10}
                                                    status={status}
                                                    className={styles.icon}
                                                />

                                                <p className={styles.status}>
                                                    {getStatusLabel(status)}
                                                </p>

                                                {i === 2 && (
                                                    <span className={styles.description}>
                                                        You will not receive any desktop
                                                        notifications.
                                                    </span>
                                                )}

                                                {i === 3 && (
                                                    <span className={styles.description}>
                                                        You will not appear online, but will have
                                                        full access to all of Spark.
                                                    </span>
                                                )}
                                            </div>
                                        </MenuItem>

                                        {i === 0 && <MenuDivider />}
                                    </Fragment>
                                ))}
                            </MenuContent>
                        </Menu>
                    </section>

                    <section>
                        <Menu
                            gap={12}
                            openOnHover
                            openOnFocus
                            placement="right-start"
                        >
                            <MenuTrigger>
                                <button className="button">
                                    <Icon
                                        size={16}
                                        name="user-circle"
                                    />

                                    <span>Switch Accounts</span>

                                    <Icon
                                        size={16}
                                        name="caret"
                                    />
                                </button>
                            </MenuTrigger>

                            <MenuContent>
                                <MenuItem>
                                    <div
                                        style={{
                                            gap: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Avatar
                                            size={24}
                                            type="user"
                                            alt={currentUser.username}
                                            fileId={currentUser.avatar}
                                            generateId={currentUser.id}
                                        />

                                        <span>{currentUser.username}</span>
                                    </div>
                                </MenuItem>
                            </MenuContent>
                        </Menu>

                        <div className={styles.divider} />

                        <button
                            className="button"
                            onClick={() => {
                                try {
                                    navigator.clipboard.writeText(user.id);
                                    setOpen(false);
                                } catch (error) {
                                    console.error(error);
                                }
                            }}
                        >
                            <Icon
                                name="id"
                                size={16}
                            />

                            <span>Copy User ID</span>
                        </button>
                    </section>
                </div>
            ) : !isBlocked ? (
                currentUser.id === user.id ? (
                    <div className={styles.editProfile}>
                        <button
                            disabled={!!mode}
                            className="button"
                            onClick={() => {
                                setOpen(false);
                                setShowSettings({ type: "USER", tab: "Profiles" });
                            }}
                        >
                            {!mode && (
                                <Icon
                                    size={16}
                                    name="edit"
                                />
                            )}

                            <span>{!mode ? "Edit profile" : "Example Button"}</span>
                        </button>
                    </div>
                ) : (
                    <form
                        className={styles.message}
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                    >
                        <input
                            type="text"
                            value={message}
                            placeholder={`Message @${user.displayName}`}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </form>
                )
            ) : null}
        </div>
    );
}

export function StatusIcon({
    status,
    size = 12,
    ...props
}: {
    status: User["status"];
    size?: number;
    [key: string]: any;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            {...props}
        >
            <foreignObject
                x="0"
                y="0"
                width={size}
                height={size}
                overflow="visible"
                mask={`url(#${getStatusMask(status)})`}
            >
                <div
                    data-type="status"
                    style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(status),
                    }}
                />
            </foreignObject>
        </svg>
    );
}
