"use client";

import type { GuildChannel, GuildMember, KnownUser, UserGuild } from "@/type";
import { GuildMenu } from "../Layers/Menu/MenuContents/Guild";
import { useParams, usePathname } from "next/navigation";
import { useNotifications } from "@/store/notifications";
import { useCallback, useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import styles from "./GuildChannels.module.css";
import { useSocket } from "@/store/socket";
import Link from "next/link";
import {
    CreateGuildChannel,
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogTrigger,
    InviteDialog,
    UserSection,
    MenuTrigger,
    Tooltip,
    Dialog,
    Icon,
    Menu,
} from "@components";
import {
    useCollapsedCategories,
    useWindowSettings,
    useShowChannels,
    useShowSettings,
    useData,
} from "@/store";

export const GuildChannels = ({
    guildId,
    channels: initChannels,
    members: initMembers = [],
}: {
    guildId: number;
    channels: GuildChannel[];
    members?: GuildMember[];
}) => {
    const guild = useData((state) => state.guilds).find((g) => g.id === guildId);

    const [showMenu, setShowMenu] = useState(false);

    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
    const { collapsed, setCollapsed } = useCollapsedCategories();
    const { notifications } = useNotifications();
    const { showChannels } = useShowChannels();
    const { updateGuild } = useData();
    const params = useParams();

    const { hasPermission } = usePermissions({ guildId });

    useEffect(() => {
        updateGuild(guildId, { channels: initChannels, members: initMembers });
    }, []);

    const channels =
        guild?.channels?.filter((c) =>
            hasPermission({ permission: "VIEW_CHANNEL", specificChannelId: c.id })
        ) || [];

    const isCategoryHidden = useCallback(
        (categoryId: number) => collapsed.includes(categoryId),
        [collapsed]
    );

    if (!guild) return null;
    if (!showChannels && !widthLimitPassed) return null;

    const canManageChannels = hasPermission({ permission: "MANAGE_CHANNELS" });

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <Menu
                    open={showMenu}
                    placement="bottom"
                    onOpenChange={setShowMenu}
                >
                    <MenuTrigger>
                        <div>
                            <InteractiveElement
                                element="div"
                                className={styles.guildSettings}
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <div>
                                    <div>{guild.name}</div>

                                    <div>
                                        <Icon name={showMenu ? "close" : "caret"} />
                                    </div>
                                </div>
                            </InteractiveElement>
                        </div>
                    </MenuTrigger>

                    <GuildMenu
                        guild={guild}
                        type="settings"
                    />
                </Menu>

                <div
                    className={styles.scroller + " scrollbar"}
                    onContextMenu={() => {
                        // setLayers({
                        //     settings: {
                        //         type: "MENU",
                        //         event: e,
                        //     },
                        //     content: {
                        //         type: "GUILD_CHANNEL_LIST",
                        //         guild: guild,
                        //     },
                        // });
                    }}
                >
                    <ul className={styles.channelList}>
                        {channels[0]?.type !== 4 && <div></div>}

                        {channels.length > 0 ? (
                            channels.map((channel) => {
                                if (channel.type === 4) {
                                    return (
                                        <ChannelItem
                                            guild={guild}
                                            key={channel.id}
                                            channel={channel}
                                            canManage={canManageChannels}
                                            hidden={isCategoryHidden(channel.id)}
                                            setHidden={() => setCollapsed(channel.id)}
                                        />
                                    );
                                }

                                const hasUnread = notifications.channels.find(
                                    (c) => c.id === channel.id && c.hasUnread
                                );

                                const isHidden = isCategoryHidden(channel.parentId || 0);

                                if (isHidden && params.channelId != channel.id && !hasUnread) {
                                    return null;
                                }

                                if (channel.parentId) {
                                    const category = channels.find(
                                        (c) => c.id === channel.parentId
                                    );

                                    return (
                                        <ChannelItem
                                            guild={guild}
                                            key={channel.id}
                                            channel={channel}
                                            category={category}
                                            canManage={canManageChannels}
                                        />
                                    );
                                } else {
                                    return (
                                        <ChannelItem
                                            guild={guild}
                                            key={channel.id}
                                            channel={channel}
                                            canManage={canManageChannels}
                                        />
                                    );
                                }
                            })
                        ) : (
                            <img
                                src="/assets/system/no-channels.svg"
                                alt="No Channels"
                            />
                        )}
                    </ul>
                </div>
            </div>

            <UserSection />
        </div>
    );
};

function ChannelItem({
    channel,
    category,
    guild,
    hidden,
    setHidden,
    canManage,
}: {
    channel: GuildChannel;
    category?: GuildChannel;
    guild: UserGuild;
    hidden?: boolean;
    setHidden?: any;
    canManage: boolean;
}) {
    const { setShowChannels } = useShowChannels();
    const { setShowSettings } = useShowSettings();
    const { notifications } = useNotifications();
    const pathname = usePathname();
    const params = useParams();

    const hasUnread = notifications.channels.find((c) => c.id === channel.id && c.hasUnread);
    const pings = notifications.channels.find((c) => c.id === channel.id)?.pings || 0;
    const active = params.channelId == channel.id;

    const { hasPermission } = usePermissions({
        channelId: channel.id,
        guildId: guild.id,
    });

    const canInvite = hasPermission({ permission: "CREATE_INSTANT_INVITE" });

    if (channel.type === 4) {
        return (
            <li
                tabIndex={0}
                className={`${styles.category} ${hidden ? styles.hide : ""}`}
                onClick={() => setHidden && setHidden()}
                onContextMenu={() => {
                    // setLayers({
                    //     settings: {
                    //         type: "MENU",
                    //         event: e,
                    //     },
                    //     content: {
                    //         type: "GUILD_CHANNEL",
                    //         guild: guild,
                    //         channel: channel,
                    //     },
                    // });
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        if (!setHidden) return;
                        if (!hidden) {
                            setHidden((prev: string[]) => [...prev, channel.id]);
                        } else {
                            setHidden((prev: string[]) => prev.filter((id) => id !== channel.id));
                        }
                    } else if (e.key === "Enter" && e.shiftKey) {
                        // setLayers({
                        //     settings: {
                        //         type: "MENU",
                        //         element: e.currentTarget,
                        //         firstSide: "RIGHT",
                        //     },
                        //     content: {
                        //         type: "GUILD_CHANNEL",
                        //         guild: guild,
                        //         channel: channel,
                        //     },
                        // });
                    }
                }}
            >
                <div>
                    <Icon name="caret" />
                    <h3>{channel.name}</h3>
                </div>

                {canManage && (
                    <Dialog>
                        <Tooltip>
                            <TooltipTrigger>
                                <DialogTrigger>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        <Icon name="add" />
                                    </button>
                                </DialogTrigger>
                            </TooltipTrigger>

                            <TooltipContent>Create Channel</TooltipContent>
                        </Tooltip>

                        <CreateGuildChannel
                            guild={guild}
                            channel={channel}
                        />
                    </Dialog>
                )}
            </li>
        );
    }

    return (
        <li
            className={`${styles.channel} ${hasUnread ? styles.unread : ""}`}
            onContextMenu={() => {
                // setLayers({
                //     settings: { type: "MENU", event: e },
                //     content: {
                //         type: "GUILD_CHANNEL",
                //         guild: guild,
                //         channel: channel,
                //         category: category,
                //     },
                // });
            }}
        >
            {hasUnread && <span className={styles.unread} />}

            <div>
                <div>
                    <Link
                        href={`/channels/${guild.id}/${channel.id}`}
                        style={{ backgroundColor: active ? "var(--background-hover-2)" : "" }}
                        onClick={(e) => {
                            if (channel.type === 3 || pathname.includes(channel.id)) {
                                e.preventDefault();
                            }

                            setShowChannels(false);
                        }}
                    >
                        <div>
                            <Tooltip delay={500}>
                                <TooltipTrigger>
                                    <div className={styles.icon}>
                                        <Icon
                                            name={
                                                channel.type === 2
                                                    ? channel.isPrivate
                                                        ? "hashtagLock"
                                                        : "hashtag"
                                                    : channel.isPrivate
                                                    ? "voiceLock"
                                                    : "voice"
                                            }
                                        />
                                    </div>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {channel.type === 2 ? "Text" : "Voice"}
                                    {channel.isPrivate ? " (Limited)" : ""}
                                </TooltipContent>
                            </Tooltip>

                            <div
                                className={styles.name}
                                style={{ color: active ? "var(--foreground-1)" : "" }}
                            >
                                {channel.name}
                            </div>

                            <div className={styles.tools}>
                                {pings > 0 && <span className={styles.pings}>{pings}</span>}

                                {channel.type === 3 && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                style={{
                                                    display: active ? "flex" : "",
                                                    flex: active ? "0 0 auto" : "",
                                                }}
                                            >
                                                <Icon
                                                    size={16}
                                                    name="message"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Open Chat</TooltipContent>
                                    </Tooltip>
                                )}

                                {canInvite && (
                                    <Dialog>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <DialogTrigger>
                                                    <button
                                                        style={{
                                                            display: active ? "flex" : "",
                                                            flex: active ? "0 0 auto" : "",
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Icon name="user-add" />
                                                    </button>
                                                </DialogTrigger>
                                            </TooltipTrigger>

                                            <TooltipContent>Create Invite</TooltipContent>
                                        </Tooltip>

                                        <DialogContent blank>
                                            <InviteDialog
                                                guild={guild}
                                                channel={channel}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {canManage && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowSettings({
                                                        type: "CHANNEL",
                                                        channel: channel,
                                                    });
                                                }}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                style={{
                                                    display: active ? "flex" : "",
                                                    flex: active ? "0 0 auto" : "",
                                                }}
                                            >
                                                <Icon name="cog" />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Edit Channel</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </li>
    );
}
