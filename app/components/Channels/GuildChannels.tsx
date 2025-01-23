"use client";

import { useParams, usePathname } from "next/navigation";
import type { GuildChannel } from "@/type";
import styles from "./GuildChannels.module.css";
import { useCallback } from "react";
import Link from "next/link";
import {
    CreateGuildChannel,
    TooltipContent,
    TooltipTrigger,
    DialogTrigger,
    UserSection,
    Tooltip,
    Dialog,
    Icon,
    DialogContent,
    InviteDialog,
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
    channels = [],
}: {
    guildId: number;
    channels?: GuildChannel[];
}) => {
    const guild = useData((state) => state.guilds).find((g) => g.id === guildId);

    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
    const { collapsed, setCollapsed } = useCollapsedCategories();
    const { showChannels } = useShowChannels();
    const params = useParams();

    const isCategoryHidden = useCallback(
        (categoryId: number) => collapsed.includes(categoryId),
        [collapsed]
    );

    if (!guild) return null;
    if (!showChannels && !widthLimitPassed) return null;

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div
                    tabIndex={0}
                    className={styles.guildSettings}
                    onClick={() => {
                        // setLayers({
                        //     settings: {
                        //         type: "MENU",
                        //         element: e.currentTarget,
                        //         firstSide: "BOTTOM",
                        //         secondSide: "CENTER",
                        //     },
                        //     content: {
                        //         type: "GUILD",
                        //         guild: guild,
                        //     },
                        // });
                    }}
                >
                    <div>
                        <div>{guild.name}</div>

                        <div
                        // style={{
                        //     transform:
                        //         layers.MENU?.content?.type !== "GUILD" ? "rotate(-90deg)" : "",
                        // }}
                        >
                            {/* {layers.MENU?.content.type === "GUILD" ? (
                                <Icon name="close" />
                            ) : (
                                <Icon name="caret" />
                            )} */}
                            <Icon name="caret" />
                        </div>
                    </div>
                </div>

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
                                            hidden={isCategoryHidden(channel.id)}
                                            setHidden={() => setCollapsed(channel.id)}
                                        />
                                    );
                                }

                                const isHidden = isCategoryHidden(channel.parentId || 0);

                                if (isHidden && params.channelId != channel.id) {
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
                                        />
                                    );
                                } else {
                                    return (
                                        <ChannelItem
                                            guild={guild}
                                            key={channel.id}
                                            channel={channel}
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
}: {
    channel: GuildChannel;
    category?: GuildChannel;
    guild: AppGuild;
    hidden?: boolean;
    setHidden?: any;
}) {
    const { setShowSettings } = useShowSettings();
    const pathname = usePathname();
    const params = useParams();

    const active = params.channelId == channel.id;

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
            </li>
        );
    }

    return (
        <li
            className={styles.channel}
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
            <div>
                <div>
                    <Link
                        href={`/channels/${guild.id}/${channel.id}`}
                        style={{ backgroundColor: active ? "var(--background-hover-2)" : "" }}
                        onClick={(e) => {
                            if (channel.type === 3 || pathname.includes(channel.id)) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div>
                            <Tooltip>
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
                                </TooltipContent>
                            </Tooltip>

                            <div
                                className={styles.name}
                                style={{ color: active ? "var(--foreground-1)" : "" }}
                            >
                                {channel.name}
                            </div>

                            <div className={styles.tools}>
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
                                                    viewbox="0 0 24 24"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Open Chat</TooltipContent>
                                    </Tooltip>
                                )}

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
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </li>
    );
}
