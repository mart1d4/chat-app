"use client";

import { Icon, UserSection, Tooltip, TooltipContent, TooltipTrigger } from "@components";
import { useParams, usePathname } from "next/navigation";
import type { Channel, Guild, User } from "@/type";
import styles from "./GuildChannels.module.css";
import { useCallback } from "react";
import Link from "next/link";
import {
    useCollapsedCategories,
    useWindowSettings,
    useShowChannels,
    useShowSettings,
} from "@/store";

export const GuildChannels = ({
    user,
    guild,
    initChannels,
}: {
    user: User;
    guild: Guild;
    initChannels: Channel[];
}) => {
    const channels = initChannels.sort((a, b) => a.position - b.position);

    const setCollapsed = useCollapsedCategories((state) => state.setCollapsed);
    const collapsed = useCollapsedCategories((state) => state.collapsed);

    const params = useParams();

    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
    const showChannels = useShowChannels((state) => state.showChannels);

    const member = guild.members.find((m) => m.userId === user.id);

    if (!showChannels && !widthLimitPassed) return null;

    const isCategoryHidden = useCallback(
        (categoryId: number) => collapsed.includes(categoryId),
        [collapsed]
    );

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div
                    tabIndex={0}
                    className={styles.guildSettings}
                    onClick={(e) => {
                        // if (layers.MENU?.content?.guild) return;
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
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            // if (layers.MENU?.content.guild) return;
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
                        }
                    }}
                    // style={{
                    //     backgroundColor:
                    //         layers.MENU?.content.type === "GUILD"
                    //             ? "var(--background-hover-1)"
                    //             : "",
                    // }}
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
                        </div>
                    </div>
                </div>

                <div
                    className={styles.scroller + " scrollbar"}
                    onContextMenu={(e) => {
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
                                            key={channel.id}
                                            channel={channel}
                                            guild={guild}
                                            member={member}
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
                                            key={channel.id}
                                            channel={channel}
                                            category={category}
                                            guild={guild}
                                            member={member}
                                        />
                                    );
                                } else {
                                    return (
                                        <ChannelItem
                                            key={channel.id}
                                            channel={channel}
                                            guild={guild}
                                            member={member}
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

const ChannelItem = ({
    channel,
    category,
    guild,
    hidden,
    setHidden,
}: {
    channel: Partial<ChannelTable>;
    category?: Partial<ChannelTable>;
    guild: Partial<GuildTable>;
    hidden?: boolean;
    setHidden?: any;
}) => {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);

    const pathname = usePathname();
    const params = useParams();

    const active = params.channelId == channel.id;

    if (channel.type === 4) {
        return (
            <li
                tabIndex={0}
                className={`${styles.category} ${hidden ? styles.hide : ""}`}
                onClick={() => setHidden && setHidden()}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
                        e.preventDefault();
                        e.stopPropagation();
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

                <Tooltip>
                    <TooltipTrigger>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // setLayers({
                                //     settings: { type: "POPUP" },
                                //     content: {
                                //         type: "GUILD_CHANNEL_CREATE",
                                //         guild: channel.guildId,
                                //         category: channel,
                                //     },
                                // });
                            }}
                        >
                            <Icon name="add" />
                        </button>
                    </TooltipTrigger>

                    <TooltipContent>Create Channel</TooltipContent>
                </Tooltip>
            </li>
        );
    }

    return (
        <li
            className={styles.channel}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
                        href={`/channels/${channel.guildId}/${channel.id}`}
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
                                        <Icon name={channel.type === 2 ? "hashtag" : "voice"} />
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
                                                    name="message"
                                                    size={16}
                                                    viewbox="0 0 24 24"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Open Chat</TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            style={{
                                                display: active ? "flex" : "",
                                                flex: active ? "0 0 auto" : "",
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // setLayers({
                                                //     settings: { type: "POPUP" },
                                                //     content: {
                                                //         type: "GUILD_INVITE",
                                                //         channel: channel,
                                                //         guild: guild,
                                                //     },
                                                // });
                                            }}
                                        >
                                            <Icon name="addUser" />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Create Invite</TooltipContent>
                                </Tooltip>

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
};
