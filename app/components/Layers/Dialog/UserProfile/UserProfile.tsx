"use client";

import type { UserProfile, KnownUser, UserGuild, ChannelRecipient, GuildMember } from "@/type";
import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import { useData, useShowSettings, useTriggerDialog, useUrls } from "@/store";
import { useFetchNote, useFetchUser } from "@/hooks/useFetchData";
import { useRelationships } from "@/hooks/useRelationships";
import { useRequests } from "@/hooks/useRequests";
import { getButtonColor } from "@/lib/getColors";
import styles from "./UserProfile.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import Image from "next/image";
import {
    useDialogContext,
    TooltipContent,
    TooltipTrigger,
    LoadingCubes,
    LoadingDots,
    MenuTrigger,
    MenuContent,
    GuildMenu,
    MenuItem,
    UserMenu,
    Tooltip,
    Avatar,
    Masks,
    Menu,
    Icon,
} from "@components";

type InitUser = KnownUser | ChannelRecipient | GuildMember;

export function UserProfile({
    initUser,
    startingTab,
    focusNote,
}: {
    initUser: InitUser;
    startingTab?: 0 | 1 | 2;
    focusNote?: boolean;
}) {
    const { data: fData, isLoading: fLoading } = useFetchUser(initUser.id);

    const user = (
        fData?.user
            ? {
                  ...fData.user,
                  status: initUser.status,
              }
            : initUser
    ) as InitUser | UserProfile;

    const { friends, guilds, setUser } = useData();

    const mutualFriends = friends.filter((f) => fData.mutualFriends?.includes(f.id));
    const mutualGuilds = guilds.filter((g) => fData.mutualGuilds?.includes(g.id));

    const { data: nData } = useFetchNote(initUser.id);
    const [note, setNote] = useState(nData ?? "");

    if (note === "" && nData) {
        setNote(nData);
    }

    const [activeNavItem, setActiveNavItem] = useState(startingTab ?? 0);

    const { isCurrentUser, isFriend, hasRequested, wasRequested, isBlocked } = useRelationships(
        initUser.id
    );
    const { setShowSettings } = useShowSettings();
    const { triggerDialog } = useTriggerDialog();
    const { setOpen } = useDialogContext();
    const router = useRouter();
    const masksId = useId();
    const {
        setNote: updateNote,
        createChannel,
        removeFriend,
        updateUser,
        addFriend,
    } = useRequests();

    if (fLoading) {
        return (
            <div className={styles.loading}>
                <LoadingCubes />
            </div>
        );
    }

    const mFLength = mutualFriends.length;
    const mGLength = mutualGuilds.length;

    const sectionNavItems = isCurrentUser
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

    const accentColor = "accentColor" in user ? user.accentColor : "#1a1a1a";
    const bannerColor = "bannerColor" in user ? user.bannerColor : "#1a1a1a";
    const customStatus = "customStatus" in user ? user.customStatus : null;
    const description = "description" in user ? user.description : null;
    const createdAt = "createdAt" in user ? user.createdAt : null;
    const username = "username" in user ? user.username : null;
    const banner = "banner" in user ? user.banner : null;

    const showSimple = !accentColor;

    return (
        <div
            className={`${styles.container} ${showSimple ? styles.simple : ""}`}
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
            <div>
                <header>
                    <svg
                        viewBox="0 0 600 210"
                        className={styles.banner}
                    >
                        <mask id={`card-banner-mask-${masksId}`}>
                            <rect
                                x="0"
                                y="0"
                                fill="white"
                                width="100%"
                                height="100%"
                            />

                            <circle
                                r="70"
                                fill="black"
                                cx={showSimple ? "86" : "82"}
                                cy={showSimple ? "211" : "207"}
                            />
                        </mask>

                        <foreignObject
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            overflow="visible"
                            mask={`url(#card-banner-mask-${masksId})`}
                        >
                            <div>
                                <div
                                    className={styles.bannerContent}
                                    style={{
                                        backgroundColor: !banner ? bannerColor : "",
                                        backgroundImage: banner ? `url(${getCdnUrl}${banner}` : "",
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
                                <Masks id={masksId} />

                                <mask
                                    viewBox="0 0 1 1"
                                    id={`status-mask-120-2-${masksId}`}
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
                                    mask={`url(#status-mask-120-2-${masksId})`}
                                >
                                    <div>
                                        <Image
                                            width={120}
                                            height={120}
                                            draggable={false}
                                            alt={`${username}'s avatar`}
                                            src={
                                                user.avatar
                                                    ? `${getCdnUrl}${user.avatar}`
                                                    : getRandomImage(
                                                          user.id ?? initUser.id,
                                                          "avatar"
                                                      )
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
                                            mask={`url(#${getStatusMask(user.status)}-${masksId})`}
                                        />
                                    </TooltipTrigger>

                                    <TooltipContent>{getStatusLabel(user.status)}</TooltipContent>
                                </Tooltip>
                            </svg>
                        </div>
                    </div>

                    {(isCurrentUser || customStatus) && (
                        <div style={{ height: 0 }}>
                            <div
                                tabIndex={customStatus ? -1 : 0}
                                role={customStatus ? "div" : "button"}
                                className={`${styles.customStatus} ${
                                    customStatus ? styles.active : ""
                                } ${!isCurrentUser ? styles.disabled : ""}`}
                                onClick={() => {
                                    if (!isCurrentUser) return;
                                    if (!customStatus) {
                                        triggerDialog({ type: "USER_STATUS" });
                                        setOpen(false);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !customStatus) {
                                        if (!isCurrentUser) return;
                                        triggerDialog({ type: "USER_STATUS" });
                                        setOpen(false);
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
                                                <button
                                                    onClick={() => {
                                                        updateUser.send(
                                                            { customStatus: "" },
                                                            {
                                                                onComplete: (data: any) => {
                                                                    if (data.user)
                                                                        setUser(data.user);
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
                        {!isCurrentUser &&
                            !isBlocked &&
                            !isFriend &&
                            !hasRequested &&
                            !wasRequested && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={() => {
                                                    createChannel.send(
                                                        { recipients: [user.id] },
                                                        {
                                                            onComplete: ({ channelId }) => {
                                                                router.push(
                                                                    `/channels/me/${channelId}`
                                                                );
                                                                setOpen(false);
                                                            },
                                                        }
                                                    );
                                                }}
                                                className="button regular grey icon"
                                            >
                                                {createChannel.isLoading ? (
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
                                        className="button regular blue icon"
                                        onClick={() => addFriend.send({ username })}
                                    >
                                        {addFriend.isLoading ? (
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

                        {!isCurrentUser &&
                            !isBlocked &&
                            (isFriend || hasRequested || wasRequested) && (
                                <>
                                    {(hasRequested || wasRequested) && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    disabled
                                                    className="button regular grey disabled icon"
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
                                        onClick={() => {
                                            createChannel.send(
                                                { recipients: [user.id] },
                                                {
                                                    onComplete: ({ channelId }) => {
                                                        router.push(`/channels/me/${channelId}`);
                                                        setOpen(false);
                                                    },
                                                }
                                            );
                                        }}
                                        className="button regular grey icon"
                                    >
                                        {createChannel.isLoading ? (
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

                        {isCurrentUser && (
                            <button
                                className="button regular grey icon"
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
                        <span>{username}</span>
                    </header>

                    {hasRequested && (
                        <section className={styles.request}>
                            <p>
                                <strong>{user.displayName}</strong> sent you a friend request.
                            </p>

                            <div>
                                <button
                                    className="button regular blue small"
                                    onClick={() => addFriend.send({ username })}
                                >
                                    {addFriend.isLoading ? <LoadingDots /> : "Accept"}
                                </button>

                                <button
                                    className="button regular grey small"
                                    onClick={() => removeFriend.send({ username })}
                                >
                                    {removeFriend.isLoading ? <LoadingDots /> : "Ignore"}
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

                    <div className={!showSimple ? styles.color : undefined}>
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
                                    {description && (
                                        <div className={styles.cardSection}>
                                            <div>{description}</div>
                                        </div>
                                    )}

                                    <div className={styles.cardSection}>
                                        <h4>Spark Member Since</h4>
                                        <div>
                                            {new Intl.DateTimeFormat("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }).format(new Date(createdAt))}
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
                                                    if (note !== nData) {
                                                        updateNote.send({ userId: user.id, note });
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
        </div>
    );
}

function MutualItem({ friend, guild: initGuild }: { friend?: KnownUser; guild?: UserGuild }) {
    const { triggerDialog } = useTriggerDialog();
    const { setOpen } = useDialogContext();
    const urls = useUrls((s) => s.guilds);
    const router = useRouter();

    const guild = useData((s) => s.guilds.find((g) => g.id === initGuild?.id));
    if (!friend && !guild) return null;

    let url = null;
    if (guild) {
        const guildUrl = urls.find((u) => u.guildId == guild.id);
        if (guildUrl) url = `/channels/${guild.id}/${guildUrl.channelId}`;
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
            {guild && <GuildMenu guild={guild} />}
        </Menu>
    );
}
