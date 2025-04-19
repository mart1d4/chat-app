"use client";

import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import { useData, useShowSettings, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useFetchNote, useFetchUser } from "@/hooks/useFetchData";
import type { AppUser, GuildRole, User, UserGuild } from "@/type";
import { useRelationships } from "@/hooks/useRelationships";
import { usePermissions } from "@/hooks/usePermissions";
import { useRequests } from "@/hooks/useRequests";
import { useState, Fragment, useId, useMemo } from "react";
import { getButtonColor } from "@/lib/getColors";
import { Popover, PopoverContent, PopoverTrigger, usePopoverContext } from "../Popover";
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
    Masks,
    Icon,
    Menu,
    Input,
} from "@components";

export function UserCard({
    initUser,
    me,
    mode,
    guild,
    onAvatarClick,
    onBannerClick,
}: {
    initUser: typeof mode extends "edit" ? AppUser : User["id"] & Partial<User>;
    me?: boolean;
    mode?: "edit";
    guild?: UserGuild;
    onAvatarClick?: () => void;
    onBannerClick?: () => void;
}) {
    const {
        data: fData,
        isLoading: fLoading,
        mutate,
    } = mode === "edit" ? {} : useFetchUser(initUser.id);

    const user = fData?.user
        ? {
              ...fData.user,
              status: initUser.status,
          }
        : initUser;

    const { channels, friends, guilds, setUser } = useData();

    const mutualFriends = friends.filter((f) => fData?.mutualFriends?.includes(f.id));
    const mutualGuilds = guilds.filter((g) => fData?.mutualGuilds?.includes(g.id));

    const { data: nData } = useFetchNote(initUser.id);
    const [note, setNote] = useState(nData ?? "");

    if (note === "" && nData) {
        setNote(nData);
    }

    const [usernameCopied, setUsernameCopied] = useState(false);
    const [message, setMessage] = useState("");

    const { updateUser, addFriend, removeFriend, sendMessage, createChannel, updateMember } =
        useRequests();
    const { setOpen } = !mode ? usePopoverContext() : { setOpen: () => {} };
    const { hasPermission } = usePermissions({ guildId: guild?.id });
    const { setShowSettings } = useShowSettings();
    const { triggerDialog } = useTriggerDialog();
    const currentUser = useAuthenticatedUser();
    const router = useRouter();
    const masksId = useId();

    const { isCurrentUser, isFriend, hasRequested, wasRequested, isBlocked } = useRelationships(
        initUser.id
    );

    const profileMe = guild?.members.find((m) => m.id === currentUser.id);

    const roles =
        guild?.roles.filter((r) => !r.everyone).sort((a, b) => a.position - b.position) || [];
    const userRoles = roles.filter((r: GuildRole) => initUser?.roles?.includes(r.id)) || [];
    const canManageRoles = hasPermission({ permission: "MANAGE_ROLES" });

    const meRoles = roles.filter((r: GuildRole) => profileMe?.roles.includes(r.id)) || [];
    const highestRole = meRoles.length ? meRoles[0] : null;
    const isMeOwner = guild?.ownerId === currentUser.id;

    async function handleSendMessage() {
        if (message.length > 0) {
            const sameChannel = channels.find((c) => {
                return (
                    c.type === 0 &&
                    c.recipients.every((r) => [initUser.id, currentUser.id].includes(r.id))
                );
            });

            let channelId = sameChannel?.id;
            if (!channelId) {
                createChannel.send(
                    { recipients: [initUser.id] },
                    { onComplete: (data) => (channelId = data.channelId) }
                );
            }

            if (!channelId) return;

            sendMessage.send(
                {
                    channelId,
                    message: { content: message },
                    senderShouldReceive: true,
                },
                {
                    onComplete: () => {
                        setMessage("");
                        setOpen(false);
                        router.push(`/channels/me/${channelId}`);
                    },
                }
            );
        }
    }

    const accentColor = "accentColor" in user ? user.accentColor : "#1a1a1a";
    const bannerColor = "bannerColor" in user ? user.bannerColor : "#1a1a1a";
    const customStatus = "customStatus" in user ? user.customStatus : null;

    if (fLoading) {
        return (
            <div className={styles.loading}>
                <LoadingCubes />
            </div>
        );
    }

    return (
        <div
            className={styles.container}
            style={
                {
                    "--card-primary-color": bannerColor,
                    "--card-accent-color": accentColor,
                    "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                    "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                    "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                    "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                    "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                    "--card-button-color": accentColor
                        ? getButtonColor(bannerColor, accentColor)
                        : "",
                    "--card-border-color": bannerColor,
                } as React.CSSProperties
            }
        >
            <header style={{ paddingBottom: isCurrentUser || customStatus ? "0" : "" }}>
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
                    <Masks id={masksId} />

                    <mask id={`card-banner-mask-3-${masksId}`}>
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
                        mask={`url(#card-banner-mask-3-${masksId})`}
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

                        setOpen(false);

                        triggerDialog({
                            type: "USER_PROFILE",
                            data: { user },
                        });
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
                                mask={`url(#status-mask-80-${masksId})`}
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
                                                : getRandomImage(user.id ?? initUser.id, "avatar")
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
                                        mask={`url(#${getStatusMask(user.status)}-${masksId})`}
                                    />
                                </TooltipTrigger>

                                <TooltipContent>{getStatusLabel(user.status)}</TooltipContent>
                            </Tooltip>
                        </svg>
                    </div>
                </InteractiveElement>

                {(isCurrentUser || customStatus) && (
                    <div style={{ maxHeight: "58px" }}>
                        <div
                            tabIndex={customStatus ? -1 : 0}
                            role={customStatus ? "div" : "button"}
                            className={`${styles.customStatus} ${
                                customStatus ? styles.active : ""
                            } ${!isCurrentUser ? styles.disabled : ""}`}
                            onClick={() => {
                                if (!isCurrentUser) return;
                                if (!customStatus) {
                                    setOpen(false);
                                    triggerDialog({ type: "USER_STATUS" });
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !customStatus) {
                                    if (!isCurrentUser) return;
                                    setOpen(false);
                                    triggerDialog({ type: "USER_STATUS" });
                                }
                            }}
                        >
                            <div>
                                <span className={styles.statusContent}>
                                    <div>
                                        {!customStatus && (
                                            <Icon
                                                size={18}
                                                name="add-circle"
                                            />
                                        )}

                                        <div>{customStatus || "Add Status"}</div>
                                    </div>
                                </span>
                            </div>

                            {isCurrentUser && customStatus && (
                                <div className={styles.statusTools}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={() => {
                                                    setOpen(false);
                                                    triggerDialog({ type: "USER_STATUS" });
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
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateUser.send(
                                                        { customStatus: null },
                                                        {
                                                            onComplete: () => {
                                                                setUser({
                                                                    ...currentUser,
                                                                    customStatus: null,
                                                                });
                                                            },
                                                        }
                                                    );
                                                }}
                                            >
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

            {!isCurrentUser && (
                <div className={styles.topTools}>
                    {!isBlocked &&
                        (!isFriend ? (
                            hasRequested || wasRequested ? (
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
                                        <button
                                            onClick={() => {
                                                addFriend.send({ username: user.username });
                                            }}
                                        >
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
                                setOpen(false);
                                triggerDialog({
                                    type: "USER_PROFILE",
                                    data: { user },
                                });
                            }}
                        >
                            {user.displayName}
                        </InteractiveElement>

                        {!mode && (
                            <Tooltip background={usernameCopied ? "var(--success-fg)" : undefined}>
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
                                                setOpen(false);
                                                triggerDialog({
                                                    type: "USER_PROFILE",
                                                    data: { user, focusNote: true },
                                                });
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
                                setOpen(false);
                                triggerDialog({
                                    type: "USER_PROFILE",
                                    data: { user },
                                });
                            }}
                        >
                            {user.username}
                        </InteractiveElement>
                    </div>
                </div>

                {hasRequested && (
                    <section className={styles.received}>
                        <div>
                            <strong>{user.displayName}</strong> sent you a friend request.
                        </div>
                        <div>
                            <button
                                className="button regular blue small"
                                onClick={() => addFriend.send({ username: user.username })}
                            >
                                Accept
                            </button>

                            <button
                                className="button regular grey small"
                                onClick={() => removeFriend.send({ username: user.username })}
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
                                        setOpen(false);
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user, startingTab: 1 },
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setOpen(false);
                                            triggerDialog({
                                                type: "USER_PROFILE",
                                                data: { user, startingTab: 1 },
                                            });
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
                                        setOpen(false);
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user, startingTab: 2 },
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setOpen(false);
                                            triggerDialog({
                                                type: "USER_PROFILE",
                                                data: { user, startingTab: 2 },
                                            });
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

                {(!!userRoles.length || canManageRoles) && (
                    <section className={styles.roles}>
                        {userRoles.map((role) => {
                            const canRemove =
                                canManageRoles &&
                                (highestRole?.position < role.position || isMeOwner);

                            return (
                                <div
                                    key={role.id}
                                    className={styles.role}
                                >
                                    {canRemove ? (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    style={{
                                                        backgroundColor: role.color || "#99AAB5",
                                                    }}
                                                    onClick={() => {
                                                        let newRoles = initUser.roles;

                                                        if (initUser.roles.includes(role.id)) {
                                                            newRoles = initUser.roles.filter(
                                                                (r) => r !== role.id
                                                            );
                                                        } else {
                                                            newRoles = [...initUser.roles, role.id];
                                                        }

                                                        updateMember.send({
                                                            guildId: guild!.id,
                                                            memberId: initUser.id,
                                                            updates: { roles: newRoles },
                                                        });
                                                    }}
                                                >
                                                    <Icon
                                                        size={10}
                                                        name="cross"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Remove Role</TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <div style={{ backgroundColor: role.color || "#99AAB5" }} />
                                    )}

                                    <span>{role.name}</span>
                                </div>
                            );
                        })}

                        {canManageRoles && (
                            <Popover>
                                <PopoverTrigger>
                                    <div className={styles.roleAdd}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button>
                                                    <Icon
                                                        size={16}
                                                        name="add"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Add Role</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent>
                                    <RoleAdd
                                        guildId={guild!.id}
                                        isMeOwner={isMeOwner}
                                        memberId={initUser.id}
                                        roleList={guild!.roles}
                                        memberRoles={initUser.roles}
                                        highestRolePosition={highestRole?.position}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </section>
                )}
            </div>

            {me ? (
                <div className={styles.menus}>
                    <section>
                        <button
                            autoFocus
                            className="button regular"
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
                                <button className="button regular">
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
                                        <MenuItem
                                            onClick={() => {
                                                updateUser.send(
                                                    { status },
                                                    {
                                                        onComplete: () => {
                                                            if (mutate && fData) {
                                                                mutate(
                                                                    {
                                                                        ...fData,
                                                                        // @ts-expect-error - id is there
                                                                        user: {
                                                                            ...fData.user,
                                                                            status,
                                                                        },
                                                                    },
                                                                    false
                                                                );
                                                            }

                                                            if (isCurrentUser) {
                                                                setUser({
                                                                    ...currentUser,
                                                                    status,
                                                                });
                                                            }
                                                        },
                                                    }
                                                );
                                            }}
                                        >
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
                                <button className="button regular">
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
                            className="button regular"
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
                            className="button regular"
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
                            handleSendMessage();
                        }}
                    >
                        <input
                            autoFocus
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
    const id = useId();

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            {...props}
        >
            <Masks id={id} />

            <foreignObject
                x="0"
                y="0"
                width={size}
                height={size}
                overflow="visible"
                mask={`url(#${getStatusMask(status)}-${id})`}
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

function RoleAdd({
    roleList,
    memberRoles,
    guildId,
    memberId,
    isMeOwner,
    highestRolePosition,
}: {
    roleList: GuildRole[];
    memberRoles: number[];
    guildId: number;
    memberId: number;
    isMeOwner: boolean;
    highestRolePosition: number | undefined;
}) {
    const [search, setSearch] = useState("");

    const { setOpen } = usePopoverContext();
    const { updateMember } = useRequests();

    const roles = useMemo(
        () =>
            roleList
                .filter((r) => !memberRoles.includes(r.id))
                .filter((r) => r.position > (highestRolePosition ?? 0) || isMeOwner)
                .filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
        [roleList, memberRoles, highestRolePosition, isMeOwner, search]
    );

    return (
        <div className={styles.roleSearch}>
            <Input
                autoFocus
                hideLabel
                size="small"
                label="Role"
                value={search}
                placeholder="Role"
                onChange={(v) => setSearch(v)}
                rightItem={
                    search.length ? (
                        <button
                            onClick={() => setSearch("")}
                            className={styles.clearButton}
                        >
                            <Icon
                                size={16}
                                name="cross"
                            />
                        </button>
                    ) : (
                        <Icon
                            name="search"
                            size={16}
                        />
                    )
                }
            />

            {roles.length ? (
                <ol className="scrollbar">
                    {roles.map((role) => (
                        <div key={role.id}>
                            <button
                                className={styles.roleItem}
                                onClick={() => {
                                    const newRoles = [...memberRoles, role.id];

                                    updateMember.send(
                                        {
                                            guildId,
                                            memberId,
                                            updates: { roles: newRoles },
                                        },
                                        {
                                            onComplete: () => {
                                                setOpen(false);
                                            },
                                        }
                                    );
                                }}
                            >
                                <div style={{ backgroundColor: role.color || "#99AAB5" }} />
                                <p>{role.name}</p>
                            </button>
                        </div>
                    ))}
                </ol>
            ) : (
                <ol className={`${styles.empty} select-none`}>
                    <h1>Nope!</h1>
                    <p>Did you make a typo?</p>
                </ol>
            )}
        </div>
    );
}
