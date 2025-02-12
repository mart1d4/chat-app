"use client";

import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import { useData, useShowSettings, useTriggerDialog, useUrls } from "@/store";
import type { UserProfile, KnownUser, User, UserGuild } from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useEffect, useRef, useState } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import styles from "./UserProfile.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    useDialogContext,
    TooltipContent,
    TooltipTrigger,
    LoadingCubes,
    LoadingDots,
    MenuTrigger,
    MenuContent,
    MenuItem,
    UserMenu,
    Tooltip,
    Avatar,
    Menu,
    Icon,
} from "@components";
import { GuildMenu } from "../../Menu/MenuContents/Guild";
import { doesUserHaveGuildPermission, type PERMISSIONS } from "@/lib/permissions";
import { hasGuildPermission } from "@/lib/db/permissions";

export function UserProfile({
    initUser,
    startingTab,
    focusNote,
}: {
    initUser: User["id"] & Partial<User>;
    startingTab?: 0 | 1 | 2;
    focusNote?: boolean;
}) {
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [activeNavItem, setActiveNavItem] = useState(startingTab ?? 0);
    const [mutualFriendIds, setMutualFriendIds] = useState<number[]>([]);
    const [mutualFriends, setMutualFriends] = useState<KnownUser[]>([]);
    const [mutualGuilds, setMutualGuilds] = useState<UserGuild[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [originalNote, setOriginalNote] = useState("");
    const [note, setNote] = useState("");

    const { setShowSettings } = useShowSettings();
    const { triggerDialog } = useTriggerDialog();
    const currentUser = useAuthenticatedUser();
    const { sendRequest } = useFetchHelper();
    const { setOpen } = useDialogContext();
    const hasRun = useRef(false);
    const router = useRouter();
    const { setUser: setAppUser, channels, received, friends, blocked, sent } = useData();

    const isReceived = received.find((r) => r.id === initUser.id);
    const isBlocked = blocked.find((b) => b.id === initUser.id);
    const isFriend = friends.find((f) => f.id === initUser.id);
    const isSent = sent.find((s) => s.id === initUser.id);
    const isSameUser = currentUser.id === initUser.id;

    async function deleteStatus() {
        try {
            const { data } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    customStatus: "",
                },
            });

            if (data?.user) {
                setAppUser(data.user);
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
            setOriginalNote(data.note);
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
            setMutualFriendIds(data.mutualFriends);
            setMutualGuilds(data.mutualGuilds);
        }
    }

    useEffect(() => {
        if (!mutualFriendIds.length) return;
        setMutualFriends(friends.filter((f) => mutualFriendIds.includes(f.id)));
    }, [friends, mutualFriendIds]);

    async function sendMessage() {
        if (loading.message) return;
        setLoading((prev) => ({ ...prev, message: true }));

        try {
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

            if (channel) {
                setLoading((prev) => ({ ...prev, message: false }));
                setOpen(false);
                return router.push(`/channels/me/${channel.id}`);
            }

            const { errors } = await sendRequest({
                query: "CHANNEL_CREATE",
                body: { recipients: [initUser.id] },
            });

            if (!errors) {
                setLoading((prev) => ({ ...prev, message: false }));
                setOpen(false);
            } else {
                throw new Error("Failed to create channel");
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, message: false }));
    }

    async function addFriend() {
        if (loading.add || !user) return;
        setLoading((prev) => ({ ...prev, add: true }));

        try {
            const { errors } = await sendRequest({
                query: "ADD_FRIEND",
                body: { username: user.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, add: false }));
    }

    async function removeFriend() {
        if (loading.remove || !user) return;
        setLoading((prev) => ({ ...prev, remove: true }));

        try {
            const { errors } = await sendRequest({
                query: "REMOVE_FRIEND",
                body: { username: user.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, remove: false }));
    }

    useEffect(() => {
        if (!hasRun?.current) {
            getNote();
            getProfile();
        }

        return () => {
            hasRun.current = true;
        };
    }, []);

    if (!user || !currentUser) {
        return (
            <div className={styles.loading}>
                <LoadingCubes />
            </div>
        );
    }

    const mFLength = mutualFriends.length;
    const mGLength = mutualGuilds.length;

    const sectionNavItems = isSameUser
        ? ["About Me"]
        : [
              "About Me",
              !!mFLength
                  ? `${mFLength} Mutual Friend${mFLength > 1 ? "s" : ""}`
                  : "No Mutual Friends",
              !!mGLength
                  ? `${mGLength} Mutual Server${mGLength > 1 ? "s" : ""}`
                  : "No Mutual Servers",
          ];

    const showSimple = !user.accentColor;

    return (
        <div
            className={`${styles.container} ${showSimple ? styles.simple : ""}`}
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
            <header>
                <svg
                    viewBox="0 0 600 210"
                    className={styles.banner}
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
                            r="70"
                            cx="86"
                            cy="211"
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
                        <div>
                            <div
                                className={styles.bannerContent}
                                style={{
                                    backgroundColor: !user.banner ? user.bannerColor : "",
                                    backgroundImage: user.banner
                                        ? `url(${getCdnUrl}${user.banner}`
                                        : "",
                                }}
                            />
                        </div>
                    </foreignObject>
                </svg>

                <div className={styles.avatar}>
                    <div>
                        <svg
                            width="138"
                            height="138"
                            viewBox="0 0 138 138"
                        >
                            <mask
                                viewBox="0 0 1 1"
                                id="status-mask-120-2"
                                maskContentUnits="objectBoundingBox"
                            >
                                <circle
                                    r="0.5"
                                    cx="0.5"
                                    cy="0.5"
                                    fill="white"
                                />
                                <circle
                                    fill="black"
                                    cx="0.8333333333333334"
                                    cy="0.8333333333333334"
                                    r="0.16666666666666666"
                                />
                            </mask>

                            <foreignObject
                                x="0"
                                y="0"
                                width="120"
                                height="120"
                                mask="url(#status-mask-120-2)"
                            >
                                <div>
                                    <Image
                                        width={120}
                                        height={120}
                                        draggable={false}
                                        alt={`${user.username}'s avatar`}
                                        src={
                                            user.avatar
                                                ? `${getCdnUrl}${user.avatar}`
                                                : getRandomImage(user.id ?? initUser.id, "avatar")
                                        }
                                    />
                                </div>
                            </foreignObject>

                            <Tooltip
                                gap={10}
                                delay={500}
                            >
                                <TooltipTrigger>
                                    <rect
                                        x="88"
                                        y="88"
                                        rx="50%"
                                        width="24"
                                        height="24"
                                        fill={getStatusColor(user.status)}
                                        mask={`url(#${getStatusMask(user.status)})`}
                                    />
                                </TooltipTrigger>

                                <TooltipContent>{getStatusLabel(user.status)}</TooltipContent>
                            </Tooltip>
                        </svg>
                    </div>
                </div>

                {(isSameUser || user.customStatus) && (
                    <div style={{ height: 0 }}>
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

                <div className={styles.topTools}>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.close}
                                onClick={() => setOpen(false)}
                            >
                                <Icon
                                    size={18}
                                    name="close"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Close</TooltipContent>
                    </Tooltip>

                    {isFriend && (
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
                    )}

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
                            type="profile"
                        />
                    </Menu>
                </div>

                <div className={styles.tools}>
                    {!isSameUser && !isBlocked && !isFriend && !isSent && !isReceived && (
                        <>
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        onClick={sendMessage}
                                        className="button grey"
                                    >
                                        {loading.message ? (
                                            <LoadingDots />
                                        ) : (
                                            <Icon
                                                size={16}
                                                name="message"
                                            />
                                        )}
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Message</TooltipContent>
                            </Tooltip>

                            <button
                                onClick={addFriend}
                                className="button blue"
                            >
                                {loading.add ? (
                                    <LoadingDots />
                                ) : (
                                    <>
                                        <Icon
                                            size={16}
                                            name="user-add"
                                        />
                                        Add Friend{" "}
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {!isSameUser && !isBlocked && (isFriend || isSent || isReceived) && (
                        <>
                            {(isSent || isReceived) && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            disabled
                                            className="button grey disabled"
                                        >
                                            <Icon
                                                size={16}
                                                name="user-pending"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Pending</TooltipContent>
                                </Tooltip>
                            )}

                            <button
                                onClick={sendMessage}
                                className="button grey"
                            >
                                {loading.message ? (
                                    <LoadingDots />
                                ) : (
                                    <>
                                        <Icon
                                            size={16}
                                            name="message"
                                        />
                                        Message
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {isSameUser && (
                        <button
                            className="button grey"
                            onClick={() => {
                                setOpen(false);
                                setShowSettings({ type: "USER", tab: "Profiles" });
                            }}
                        >
                            <Icon
                                size={16}
                                name="edit"
                            />
                            Edit Profile
                        </button>
                    )}
                </div>
            </header>

            <section className={styles.content}>
                <header>
                    <h1>{user.displayName}</h1>
                    <span>{user.username}</span>
                </header>

                {isReceived && (
                    <section className={styles.request}>
                        <p>
                            <strong>{user.displayName}</strong> sent you a friend request.
                        </p>

                        <div>
                            <button
                                onClick={addFriend}
                                className="button blue small"
                            >
                                {loading.add ? <LoadingDots /> : "Accept"}
                            </button>
                            <button
                                onClick={removeFriend}
                                className="button grey small"
                            >
                                {loading.remove ? <LoadingDots /> : "Ignore"}
                            </button>
                        </div>
                    </section>
                )}

                {isBlocked && (
                    <section className={styles.blocked}>
                        <p>
                            <strong>You blocked them</strong>
                        </p>
                    </section>
                )}

                <div>
                    <nav className={styles.nav}>
                        <div>
                            {sectionNavItems.map((item, i) => (
                                <button
                                    key={`nav-${i}`}
                                    className={styles.item}
                                    aria-controls={`section-${i}`}
                                    aria-selected={activeNavItem === i}
                                    tabIndex={sectionNavItems.length > 1 ? 0 : -1}
                                    onClick={() => setActiveNavItem(i as 0 | 1 | 2)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div
                        className={
                            styles.scrollContainer +
                            " scrollbar " +
                            ((activeNavItem === 2 && !!mFLength) ||
                            (activeNavItem === 1 && !!mGLength)
                                ? styles.margin
                                : activeNavItem === 0
                                ? styles.padding
                                : "")
                        }
                    >
                        {activeNavItem === 0 && (
                            <section
                                id="section-0"
                                aria-labelledby="about-me"
                            >
                                {user.description && (
                                    <div className={styles.cardSection}>
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
                                    <div style={{ display: "flex", margin: "0 -4px" }}>
                                        <textarea
                                            value={note}
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = "auto";
                                                    el.style.height = `${el.scrollHeight}px`;
                                                }
                                            }}
                                            maxLength={256}
                                            autoCorrect="off"
                                            aria-label="Note"
                                            autoFocus={!!focusNote}
                                            placeholder="Click to add a note"
                                            className={styles.cardInput + " scrollbar"}
                                            onInput={(e) => setNote(e.currentTarget.value)}
                                            onBlur={async () => {
                                                if (note !== originalNote) {
                                                    const { errors } = await sendRequest({
                                                        query: "SET_NOTE",
                                                        params: { userId: user.id },
                                                        body: { note },
                                                    });

                                                    if (errors) {
                                                        console.error(errors);
                                                    } else {
                                                        setOriginalNote(note);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeNavItem === 1 && (
                            <section
                                id="section-1"
                                aria-labelledby="mutual-friends"
                            >
                                {!!mFLength ? (
                                    mutualFriends.map((friend) => (
                                        <MutualItem
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
                            </section>
                        )}

                        {activeNavItem === 2 && (
                            <section
                                id="section-2"
                                aria-labelledby="mutual-servers"
                            >
                                {!!mGLength ? (
                                    mutualGuilds.map((guild) => (
                                        <MutualItem
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
                            </section>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function MutualItem({ friend, guild }: { friend?: KnownUser; guild?: UserGuild }) {
    const urls = useUrls((state) => state.guilds);
    const { triggerDialog } = useTriggerDialog();
    const appUser = useAuthenticatedUser();
    const { setOpen } = useDialogContext();
    const router = useRouter();

    const appGuild = useData((state) => state.guilds.find((g) => g.id === guild?.id));
    if (guild && !appGuild) return null;

    let url = null;
    if (guild) {
        const guildUrl = urls.find((u) => u.guildId == guild.id);
        if (guildUrl) url = `/channels/${guild.id}/${guildUrl.channelId}`;
    }

    function hasPerm(permission: keyof typeof PERMISSIONS) {
        if (!appGuild) return false;

        return (
            doesUserHaveGuildPermission(
                appGuild.roles,
                appGuild.members.find((m) => m.id === appUser.id),
                permission
            ) || appGuild.ownerId === appUser.id
        );
    }

    return (
        <Menu
            openOnRightClick
            placement="right-start"
        >
            <MenuTrigger>
                <button
                    className={styles.userItem}
                    onClick={() => {
                        if (friend) {
                            triggerDialog({
                                type: "USER_PROFILE",
                                data: { user: friend },
                            });
                        } else if (guild) {
                            setOpen(false);
                            router.push(url || `/channels/${guild.id}`);
                        }
                    }}
                >
                    <div>
                        {friend && (
                            <Avatar
                                type="user"
                                size={40}
                                alt={friend.username}
                                fileId={friend.avatar}
                                generateId={friend.id}
                                status={friend.status}
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
                                        size={40}
                                        type="channel"
                                        alt={guild.name}
                                        fileId={guild.icon}
                                        generateId={guild.id}
                                    />
                                ) : (
                                    guild.name.match(/\b(\w)/g)?.join("") ?? ""
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        {friend && friend.username}
                        {guild && guild.name}
                    </div>
                </button>
            </MenuTrigger>

            {friend && <UserMenu user={friend} />}

            {guild && (
                <GuildMenu
                    guild={appGuild}
                    hasPerm={hasPerm}
                />
            )}
        </Menu>
    );
}
