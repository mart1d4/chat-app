"use client";

import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import type { ChannelRecipient, KnownUser, UserGuild } from "@/type";
import { useFetchNote, useFetchUser } from "@/hooks/useFetchData";
import { useData, useSettings, useTriggerDialog, useUrls } from "@/store";
import { useRelationships } from "@/hooks/useRelationships";
import { useRequests } from "@/hooks/useRequests";
import { getButtonColor } from "@/lib/getColors";
import styles from "./ChannelAside.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { memo, useId, useMemo, useState } from "react";
import Image from "next/image";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    MenuContent,
    MenuTrigger,
    LoadingDots,
    GuildMenu,
    UserMenu,
    MenuItem,
    Tooltip,
    Avatar,
    Masks,
    Icon,
    Menu,
} from "@components";

export const UserAside = memo(function UserAside({
    friend: initFriend,
}: {
    friend: ChannelRecipient;
}) {
    const { data: fData, isLoading: fLoading } = useFetchUser(initFriend.id);
    const { settings } = useSettings();

    const friend = fData?.user
        ? {
              ...fData.user,
              status: initFriend.status,
          }
        : initFriend;

    const { friends, guilds } = useData();

    const mutualFriends = useMemo(
        () => friends.filter((f) => fData.mutualFriends?.includes(f.id)),
        [friends, fData.mutualFriends]
    );

    const mutualGuilds = useMemo(
        () => guilds.filter((g) => fData.mutualGuilds?.find((g2) => g2.id === g.id)),
        [guilds, fData.mutualGuilds]
    );

    const [showFriends, setShowFriends] = useState(false);
    const [showGuilds, setShowGuilds] = useState(false);

    const { data: nData } = useFetchNote(initFriend.id);
    const [note, setNote] = useState(nData ?? "");

    if (note === "" && nData) {
        setNote(nData);
    }

    const { isFriend, hasRequested, wasRequested, isBlocked } = useRelationships(friend.id);
    const { addFriend, setNote: updateNote } = useRequests();
    const { triggerDialog } = useTriggerDialog();
    const masksId = useId();

    const accentColor = "accentColor" in friend ? friend.accentColor : "#1a1a1a";
    const bannerColor = "bannerColor" in friend ? friend.bannerColor : "#1a1a1a";
    const description = "description" in friend ? friend.description : null;
    const createdAt = "createdAt" in friend ? friend.createdAt : 0;
    const banner = "banner" in friend ? friend.banner : null;

    if (!settings.showUsers) return null;

    return (
        <aside
            className={styles.usercard}
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
                <header className={styles.header}>
                    <svg
                        viewBox="0 0 340 120"
                        className={styles.banner}
                    >
                        <Masks id={masksId} />

                        <mask id={`card-banner-mask-1-${masksId}`}>
                            <rect
                                x="0"
                                y="0"
                                fill="white"
                                width="100%"
                                height="100%"
                            />
                            <circle
                                r="46"
                                cx="58"
                                cy="112"
                                fill="black"
                            />
                        </mask>

                        <foreignObject
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            overflow="visible"
                            mask={`url(#card-banner-mask-1-${masksId})`}
                        >
                            <div>
                                <div
                                    className={styles.background}
                                    style={{
                                        backgroundColor: !banner ? bannerColor : "",
                                        backgroundImage: banner ? `url(${getCdnUrl}${banner})` : "",
                                    }}
                                />
                            </div>
                        </foreignObject>
                    </svg>

                    <div className={styles.avatar}>
                        <div>
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
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className={styles.overlay}
                                        onClick={() => {
                                            triggerDialog({
                                                type: "USER_PROFILE",
                                                data: { user: friend },
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                triggerDialog({
                                                    type: "USER_PROFILE",
                                                    data: { user: friend },
                                                });
                                            }
                                        }}
                                    >
                                        <Image
                                            width={80}
                                            height={80}
                                            draggable={false}
                                            alt={`${friend.username}'s avatar`}
                                            src={
                                                friend.avatar
                                                    ? `${getCdnUrl}${friend.avatar}`
                                                    : getRandomImage(friend.id, "avatar")
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
                                            x="60"
                                            y="60"
                                            rx="50%"
                                            width="16"
                                            height="16"
                                            fill={getStatusColor(friend.status)}
                                            mask={`url(#${getStatusMask(
                                                friend.status
                                            )}-${masksId})`}
                                        />
                                    </TooltipTrigger>

                                    <TooltipContent>{getStatusLabel(friend.status)}</TooltipContent>
                                </Tooltip>
                            </svg>
                        </div>
                    </div>

                    <div className={styles.spacer} />

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
                                                onClick={() =>
                                                    addFriend.send({ username: friend.username })
                                                }
                                            >
                                                {addFriend.isLoading ? (
                                                    <LoadingDots />
                                                ) : (
                                                    <Icon
                                                        size={18}
                                                        name="user-add"
                                                    />
                                                )}
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
                                                triggerDialog({
                                                    type: "REMOVE_FRIEND",
                                                    data: { user: friend },
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
                                type="card"
                                user={friend}
                            />
                        </Menu>
                    </div>
                </header>

                <section>
                    <div className={styles.body}>
                        <div className={styles.heading}>
                            <h2
                                tabIndex={0}
                                onClick={() => {
                                    triggerDialog({
                                        type: "USER_PROFILE",
                                        data: { user: friend },
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user: friend },
                                        });
                                    }
                                }}
                            >
                                {friend.displayName}
                            </h2>

                            <p
                                tabIndex={0}
                                onClick={() => {
                                    triggerDialog({
                                        type: "USER_PROFILE",
                                        data: { user: friend },
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        triggerDialog({
                                            type: "USER_PROFILE",
                                            data: { user: friend },
                                        });
                                    }
                                }}
                            >
                                {friend.username}
                            </p>
                        </div>

                        <div className={styles.panel}>
                            {description && (
                                <section>
                                    <h3>About me</h3>
                                    <p>{description}</p>
                                </section>
                            )}

                            <section>
                                <h3>Member Since</h3>
                                <p>
                                    {new Intl.DateTimeFormat("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }).format(new Date(createdAt))}
                                </p>
                            </section>

                            <section>
                                <h3>Note</h3>
                                <div>
                                    <textarea
                                        value={note}
                                        ref={(el) => {
                                            if (el) {
                                                el.style.height = "auto";
                                                el.style.height = `${el.scrollHeight}px`;
                                            }
                                        }}
                                        maxLength={256}
                                        aria-label="Note"
                                        autoCorrect="off"
                                        placeholder="Click to add a note"
                                        className={styles.cardInput + " scrollbar"}
                                        onInput={(e) => setNote(e.currentTarget.value)}
                                        onBlur={async () => {
                                            if (note !== nData) {
                                                updateNote.send({ userId: friend.id, note });
                                            }
                                        }}
                                    />
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className={styles.mutuals}>
                        {!!mutualGuilds.length && (
                            <section>
                                <button
                                    className={styles.button}
                                    onClick={() => setShowGuilds((prev) => !prev)}
                                >
                                    Mutual Servers — {mutualGuilds.length}
                                    <Icon
                                        name="caret"
                                        style={{
                                            transform: `rotate(${showGuilds ? "90deg" : "0deg"})`,
                                        }}
                                    />
                                </button>

                                {showGuilds && (
                                    <ul className={styles.mutualItems}>
                                        {mutualGuilds.map((guild) => (
                                            <MutualItem
                                                guild={guild}
                                                key={guild.id}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}

                        {!!mutualGuilds.length && !!mutualFriends.length && <hr />}

                        {!!mutualFriends.length && (
                            <section>
                                <button
                                    className={styles.button}
                                    onClick={() => setShowFriends((prev) => !prev)}
                                >
                                    Mutual Friends — {mutualFriends.length}
                                    <Icon
                                        name="caret"
                                        style={{
                                            transform: `rotate(${showFriends ? "90deg" : "0deg"})`,
                                        }}
                                    />
                                </button>

                                {showFriends && (
                                    <ul className={styles.mutualItems}>
                                        {mutualFriends.map((friend) => (
                                            <MutualItem
                                                user={friend}
                                                key={friend.id}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}

                        {fLoading && (
                            <section>
                                <div className={styles.mutualSkeleton}>
                                    <div />
                                    <div />
                                </div>
                            </section>
                        )}
                    </div>
                </section>
            </div>

            <button
                type="button"
                className={styles.fullProfile}
                onClick={() => {
                    triggerDialog({
                        type: "USER_PROFILE",
                        data: { user: friend },
                    });
                }}
            >
                View Full Profile
            </button>
        </aside>
    );
});

function MutualItem({ user, guild }: { user?: KnownUser; guild?: UserGuild }) {
    if (!user && !guild) return null;

    const urls = useUrls((state) => state.guilds);
    const { triggerDialog } = useTriggerDialog();
    const router = useRouter();

    let url: string | null = null;

    if (guild) {
        const guildUrl = urls.find((u) => u.guildId === guild.id);
        if (guildUrl) url = `/channels/${guild.id}/${guildUrl.channelId}`;
    }

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="right-start"
        >
            <MenuTrigger>
                <InteractiveElement
                    element="li"
                    className={styles.mutualItem}
                    onClick={() => {
                        if (user) {
                            triggerDialog({
                                type: "USER_PROFILE",
                                data: { user },
                            });
                        } else if (guild) {
                            router.push(url || `/channels/${guild.id}`);
                        }
                    }}
                >
                    <div>
                        {user && (
                            <Avatar
                                size={40}
                                type="user"
                                alt={user.username}
                                status={user.status}
                                fileId={user.avatar}
                                generateId={user.id}
                            />
                        )}

                        {guild && (
                            <div
                                className={styles.guildIcon}
                                style={{ backgroundColor: guild.icon ? "transparent" : "" }}
                            >
                                {guild.icon ? (
                                    <Avatar
                                        size={40}
                                        type="guild"
                                        alt={guild.name}
                                        fileId={guild.icon}
                                        generateId={guild.id}
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
                </InteractiveElement>
            </MenuTrigger>

            {user && <UserMenu user={user} />}
            {guild && <GuildMenu guild={guild} />}
        </Menu>
    );
}
