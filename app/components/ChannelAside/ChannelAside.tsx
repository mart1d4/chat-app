"use client";

import {
    type ChannelRecipient,
    type DMChannel,
    type Guild,
    type GuildChannel,
    type GuildMember,
} from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useData, useSettings, useWindowSettings } from "@/store";
import { usePermissions } from "@/hooks/usePermissions";
import styles from "./ChannelAside.module.css";
import { UserAside } from "./UserAside";
import { memo, useMemo, useRef } from "react";
import {
    PopoverContent,
    PopoverTrigger,
    TooltipContent,
    TooltipTrigger,
    MenuTrigger,
    UserCard,
    UserMenu,
    Popover,
    Tooltip,
    Avatar,
    Menu,
} from "@components";

export const ChannelAside = memo(function ChannelAside({
    channelId,
    guildId,
    initChannel,
}: {
    channelId: number;
    guildId?: number;
    initChannel?: GuildChannel & { recipients: GuildMember[] };
}) {
    const channel = initChannel ?? useData((s) => s.channels).find((c) => c.id === channelId);
    const guild = useData((state) => state.guilds).find((g) => g.id === guildId);
    const widthThresholds = useWindowSettings((s) => s.widthThresholds);
    const { hasPermission } = usePermissions({ guildId, channelId });
    const user = useAuthenticatedUser();
    const { settings } = useSettings();

    const recipients = useMemo(() => {
        let arr: (GuildMember | ChannelRecipient)[] = [];

        if (initChannel) arr = initChannel.recipients;
        if (channel) arr = channel.recipients;

        if (guild) {
            arr = guild.members
                .filter((m) => hasPermission({ permission: "VIEW_CHANNEL", userId: m.id }))
                .map((m) => {
                    const userRolesWithColor = guild.roles
                        .filter((r) => m.roles.includes(r.id))
                        .filter((r) => !r.everyone)
                        .sort((a, b) => a.position - b.position);

                    let color = null;

                    if (userRolesWithColor.length) {
                        color = userRolesWithColor[0].color;
                    }

                    return {
                        ...m,
                        color,
                    };
                });
        }

        return arr;
    }, [channel, guild]);

    const isWidth1200 = widthThresholds[1200];
    if (!isWidth1200) return null;

    if (channel?.type === 0) {
        const friend = channel.recipients.find((r) => r.id !== user!.id);
        if (!friend) return null;

        return <UserAside friend={friend as ChannelRecipient} />;
    }

    if (!channel || !settings.showUsers) return null;

    const offline = recipients.filter((r) => ("status" in r ? r.status === "offline" : true));
    const online = recipients.filter((r) => !offline.find((o) => o.id === r.id));

    return (
        <aside className={styles.memberList}>
            <div className="scrollbar">
                {!initChannel && <h2>Members—{channel.recipients.length}</h2>}
                {initChannel && !!online.length && <h2>Online — {online.length}</h2>}

                {!initChannel &&
                    recipients.map((user) => (
                        <UserItem
                            user={user}
                            key={user.id}
                            guild={guild}
                            channel={channel}
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
                                    guild={guild}
                                    channel={channel}
                                    isOwner={
                                        guild
                                            ? guild.ownerId === user.id
                                            : "ownerId" in channel && channel.ownerId === user.id
                                    }
                                />
                            ))}

                        {initChannel && !!offline.length && <h2>Offline — {offline?.length}</h2>}

                        {!!offline.length &&
                            offline.map((user) => (
                                <UserItem
                                    offline
                                    user={user}
                                    key={user.id}
                                    guild={guild}
                                    channel={channel}
                                    isOwner={
                                        guild
                                            ? guild.ownerId === user.id
                                            : "ownerId" in channel && channel.ownerId === user.id
                                    }
                                />
                            ))}
                    </>
                )}
            </div>
        </aside>
    );
});

export const UserItem = memo(function UserItem({
    user,
    guild,
    channel,
    offline,
    isOwner,
}: {
    guild?: Guild;
    user: GuildMember | ChannelRecipient;
    channel: DMChannel | GuildChannel;
    offline?: boolean;
    isOwner?: boolean;
}) {
    const statusRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);

    const statusBigger = useMemo(() => {
        if (!statusRef.current) return false;
        return statusRef.current.scrollWidth > 155;
    }, [statusRef.current]);

    const nameBigger = useMemo(() => {
        if (!nameRef.current) return false;
        return nameRef.current.scrollWidth > 155;
    }, [nameRef.current]);

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="right-start"
        >
            <Popover placement="left-start">
                <PopoverTrigger asChild>
                    <MenuTrigger>
                        <li
                            tabIndex={0}
                            className={styles.liContainer}
                            style={{ opacity: offline ? 0.3 : "" }}
                        >
                            <div className={styles.liWrapper}>
                                <div className={styles.link}>
                                    <div className={styles.layout}>
                                        <div className={styles.layoutAvatar}>
                                            <div>
                                                <Avatar
                                                    size={32}
                                                    type="user"
                                                    showStatusTooltip
                                                    fileId={user.avatar}
                                                    generateId={user.id}
                                                    alt={`${user.displayName}'s avatar`}
                                                    status={offline ? undefined : user.status}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.layoutContent}>
                                            <div
                                                className={styles.contentName}
                                                style={{ color: user.color || undefined }}
                                            >
                                                <Tooltip
                                                    delay={750}
                                                    show={nameBigger}
                                                >
                                                    <TooltipTrigger>
                                                        <div ref={nameRef}>{user.displayName}</div>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {user.displayName}
                                                    </TooltipContent>
                                                </Tooltip>

                                                {isOwner && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                width="14"
                                                                height="14"
                                                                fill="none"
                                                            >
                                                                <path
                                                                    fill="currentColor"
                                                                    d="M5 18a1 1 0 0 0-1 1 3 3 0 0 0 3 3h10a3 3 0 0 0 3-3 1 1 0 0 0-1-1H5ZM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42-4.41-3.07Z"
                                                                />
                                                            </svg>
                                                        </TooltipTrigger>

                                                        <TooltipContent>
                                                            {guild ? "Server" : "Group"} Owner
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>

                                            {"customStatus" in user && (
                                                <Tooltip
                                                    delay={750}
                                                    show={statusBigger}
                                                >
                                                    <TooltipTrigger>
                                                        <div
                                                            ref={statusRef}
                                                            className={styles.contentStatus}
                                                        >
                                                            {user.customStatus}
                                                        </div>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {user.customStatus}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </MenuTrigger>
                </PopoverTrigger>

                <PopoverContent>
                    <UserCard
                        guild={guild}
                        initUser={user}
                    />
                </PopoverContent>
            </Popover>

            <UserMenu
                user={user}
                type="author"
                guild={guild}
                channelId={channel.id}
                channelType={channel.type}
                channelOwnerId={"ownerId" in channel ? channel.ownerId : undefined}
            />
        </Menu>
    );
});
