"use client";

import { useData, useSettings, useTriggerDialog, useUrls, useWindowSettings } from "@/store";
import { getRandomImage, getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useState, useEffect, useRef, useMemo } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import { getCdnUrl } from "@/lib/uploadthing";
import styles from "./MemberList.module.css";
import { useRouter } from "next/navigation";
import { UserItem } from "./UserItem";
import Image from "next/image";
import {
    type ChannelRecipient,
    type GuildChannel,
    type MutualGuild,
    type GuildMember,
    type UserProfile,
    type Guild,
    type User,
    type KnownUser,
    type UserGuild,
} from "@/type";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    MenuTrigger,
    MenuContent,
    UserMenu,
    MenuItem,
    Tooltip,
    Avatar,
    Icon,
    Menu,
    GuildMenu,
} from "@components";
import { usePermissions } from "@/hooks/usePermissions";

export function MemberList({
    channelId,
    guildId,
    initChannel,
}: {
    channelId: number;
    guildId?: number;
    initChannel?: GuildChannel & { recipients: GuildMember[] };
}) {
    const channel =
        initChannel ?? useData((state) => state.channels).find((c) => c.id === channelId);
    const guild = useData((state) => state.guilds).find((g) => g.id === guildId);
    const user = useAuthenticatedUser();

    const [friend, setFriend] = useState<GuildMember | ChannelRecipient | UserProfile | undefined>(
        channel?.type === 0 ? channel?.recipients.find((r) => r.id !== user!.id) : undefined
    );

    const [showFriends, setShowFriends] = useState(false);
    const [showGuilds, setShowGuilds] = useState(false);

    const [originalNote, setOriginalNote] = useState("");
    const [note, setNote] = useState("");

    const [mutualFriendIds, setMutualFriendIds] = useState<number[]>([]);
    const [mutualFriends, setMutualFriends] = useState<KnownUser[]>([]);
    const [mutualGuilds, setMutualGuilds] = useState<MutualGuild[]>([]);
    const [mutualGuildIds, setMutualGuildIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const { guilds, friends, received, sent, blocked } = useData();
    const { widthThresholds } = useWindowSettings();
    const { triggerDialog } = useTriggerDialog();
    const { sendRequest } = useFetchHelper();
    const { settings } = useSettings();
    const hasRun = useRef(false);

    const { hasPermission } = usePermissions({
        guildId,
        channelId,
    });

    const isWidth1200 = widthThresholds[1200];

    const isFriend = friends.find((f) => f.id === friend?.id);
    const isReceived = received.find((r) => r.id === friend?.id);
    const isSent = sent.find((s) => s.id === friend?.id);
    const isBlocked = blocked.find((b) => b.id === friend?.id);

    const recipients = useMemo(() => {
        let arr: (GuildMember | ChannelRecipient)[] = [];

        if (initChannel) arr = initChannel.recipients;
        if (channel) arr = channel.recipients;
        if (guild) arr = guild.members;

        if (guildId) {
            arr = arr.filter((r) => hasPermission({ permission: "VIEW_CHANNEL", userId: r.id }));
        }

        return arr;
    }, [channel, guild]);

    async function addFriend() {
        if (loading || !user) return;
        setLoading(true);

        try {
            await sendRequest({
                query: "ADD_FRIEND",
                body: { username: user.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    useEffect(() => {
        async function getNote() {
            if (!friend) return;

            const { data } = await sendRequest({
                query: "GET_NOTE",
                params: { userId: friend.id },
            });

            if (data) {
                setNote(data.note);
                setOriginalNote(data.note);
            }
        }

        async function getMutuals() {
            if (!friend || "bannerColor" in friend) return;

            const { data } = await sendRequest({
                query: "GET_USER_PROFILE",
                params: {
                    userId: friend.id,
                    withMutualGuilds: true,
                    withMutualFriends: true,
                },
            });

            if (data) {
                setMutualFriendIds(data.mutualFriends);
                setMutualGuildIds(data.mutualGuilds.map((g: any) => g.id));
                setFriend({
                    ...data.user,
                    status: channel?.recipients.find((r) => r.id === data.user.id)?.status,
                });
            }
        }

        if (!hasRun.current) {
            getNote();
            getMutuals();
        }

        return () => {
            hasRun.current = true;
        };
    }, [friend, channel]);

    useEffect(() => {
        if (!channel || channel.type !== 0) return;
        // @ts-ignore
        setFriend((prev) => ({
            ...prev,
            ...channel.recipients.find((r) => r.id === prev?.id),
        }));
    }, [channel]);

    useEffect(() => {
        if (!mutualFriendIds.length) return;

        setMutualFriends(friends.filter((f) => mutualFriendIds.includes(f.id)));
    }, [friends, mutualFriendIds]);

    useEffect(() => {
        if (!mutualGuildIds.length) return;
        setMutualGuilds(guilds.filter((g) => mutualGuildIds.includes(g.id)));
    }, [guilds, mutualGuildIds]);

    if (!channel || !settings.showUsers) return null;

    if (channel.type === 0) {
        if (!friend || !("banner" in friend) || !isWidth1200) {
            return null;
        }

        return (
            <aside
                className={styles.usercard}
                style={
                    {
                        "--card-primary-color": friend.bannerColor,
                        "--card-accent-color": friend.accentColor,
                        "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                        "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                        "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                        "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                        "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                        "--card-button-color": friend.accentColor
                            ? getButtonColor(friend.bannerColor, friend.accentColor)
                            : "",
                        "--card-border-color": friend.bannerColor,
                    } as React.CSSProperties
                }
            >
                <div>
                    <header className={styles.header}>
                        <svg
                            viewBox="0 0 340 120"
                            className={styles.banner}
                        >
                            <mask id="card-banner-mask-1">
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
                                mask="url(#card-banner-mask-1)"
                            >
                                <div>
                                    <div
                                        className={styles.background}
                                        style={{
                                            backgroundColor: !friend.banner
                                                ? friend.bannerColor
                                                : "",
                                            backgroundImage: friend.banner
                                                ? `url(${getCdnUrl}${friend.banner})`
                                                : "",
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
                                        mask="url(#status-mask-80)"
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
                                                mask={`url(#${getStatusMask(friend.status)})`}
                                            />
                                        </TooltipTrigger>

                                        <TooltipContent>
                                            {getStatusLabel(friend.status)}
                                        </TooltipContent>
                                    </Tooltip>
                                </svg>
                            </div>
                        </div>

                        <div className={styles.spacer} />

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
                                                    triggerDialog({
                                                        type: "REMOVE_FRIEND",
                                                        data: { friend },
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
                                {friend.description && (
                                    <section>
                                        <h3>About me</h3>
                                        <p>{friend.description}</p>
                                    </section>
                                )}

                                <section>
                                    <h3>Member Since</h3>
                                    <p>
                                        {new Intl.DateTimeFormat("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }).format(new Date(friend.createdAt))}
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
                                            onInput={(e) => {
                                                setNote(e.currentTarget.value);
                                            }}
                                            onBlur={async () => {
                                                if (note !== originalNote) {
                                                    const { data } = await sendRequest({
                                                        query: "SET_NOTE",
                                                        params: { userId: friend.id },
                                                        body: { note },
                                                    });

                                                    if (data) {
                                                        setOriginalNote(note);
                                                    }
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
                                                transform: `rotate(${
                                                    showGuilds ? "90deg" : "0deg"
                                                })`,
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
                                                transform: `rotate(${
                                                    showFriends ? "90deg" : "0deg"
                                                })`,
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
    } else {
        const offline = recipients.filter((r) => ("status" in r ? r.status === "offline" : true));
        const online = recipients.filter((r) => !offline.find((o) => o.id === r.id));

        return (
            <aside className={styles.memberList}>
                <div>
                    {!initChannel && <h2>Members—{channel.recipients.length}</h2>}
                    {initChannel && !!online.length && <h2>Online — {online.length}</h2>}

                    {!initChannel &&
                        recipients.map((user) => (
                            <UserItem
                                user={user}
                                key={user.id}
                                channel={channel}
                                isGuild={!!guild}
                                offline={user.status === "offline"}
                                isOwner={
                                    guild
                                        ? guild.ownerId === user.id
                                        : "ownerId" in channel && channel.ownerId === user.id
                                }
                            />
                        ))}

                    {!!initChannel && (
                        <>
                            {!!online.length &&
                                online.map((user) => (
                                    <UserItem
                                        user={user}
                                        key={user.id}
                                        channel={channel}
                                        isGuild={!!guild}
                                        isOwner={
                                            guild
                                                ? guild.ownerId === user.id
                                                : "ownerId" in channel &&
                                                  channel.ownerId === user.id
                                        }
                                    />
                                ))}

                            {initChannel && !!offline.length && (
                                <h2>Offline — {offline?.length}</h2>
                            )}

                            {!!offline.length &&
                                offline.map((user) => (
                                    <UserItem
                                        offline
                                        user={user}
                                        key={user.id}
                                        channel={channel}
                                        isGuild={!!guild}
                                        isOwner={
                                            guild
                                                ? guild.ownerId === user.id
                                                : "ownerId" in channel &&
                                                  channel.ownerId === user.id
                                        }
                                    />
                                ))}
                        </>
                    )}
                </div>
            </aside>
        );
    }
}

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
