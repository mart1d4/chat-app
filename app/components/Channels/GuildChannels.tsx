"use client";

import { ChannelTable, GuildTable, UserTable } from "@/lib/db/types";
import { useState, SetStateAction, Dispatch } from "react";
import { useParams, usePathname } from "next/navigation";
import { useLayers, useTooltip } from "@/lib/store";
import styles from "./GuildChannels.module.css";
import { Icon, UserSection } from "@components";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
    user: Partial<UserTable>;
    guild: Partial<GuildTable>;
    initChannels: Partial<ChannelTable>[];
}

export const GuildChannels = ({ user, guild, initChannels }: Props) => {
    const [hiddenCategories, setHiddenCategories] = useState([]);
    const [channels, setChannels] = useState(initChannels.sort((a, b) => a.position - b.position));

    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const params = useParams();

    const member = guild.members?.find((member) => member.userId === user.id);

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div
                    tabIndex={0}
                    className={styles.guildSettings}
                    onClick={(e) => {
                        if (layers.MENU?.content.guild) return;
                        setLayers({
                            settings: {
                                type: "MENU",
                                element: e.currentTarget,
                                firstSide: "BOTTOM",
                                secondSide: "CENTER",
                            },
                            content: {
                                type: "GUILD",
                                guild: guild,
                            },
                        });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (layers.MENU?.content.guild) return;
                            setLayers({
                                settings: {
                                    type: "MENU",
                                    element: e.currentTarget,
                                    firstSide: "BOTTOM",
                                    secondSide: "CENTER",
                                },
                                content: {
                                    type: "GUILD",
                                    guild: guild,
                                },
                            });
                        }
                    }}
                    style={{
                        backgroundColor:
                            layers.MENU?.content.type === "GUILD"
                                ? "var(--background-hover-1)"
                                : "",
                    }}
                >
                    <div>
                        <div>{guild.name}</div>
                        <div
                            style={{
                                transform:
                                    layers.MENU?.content.type !== "GUILD" ? "rotate(-90deg)" : "",
                            }}
                        >
                            {layers.MENU?.content.type === "GUILD" ? (
                                <Icon name="close" />
                            ) : (
                                <Icon name="caret" />
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={styles.scroller + " scrollbar"}
                    onContextMenu={(e) => {
                        setLayers({
                            settings: {
                                type: "MENU",
                                event: e,
                            },
                            content: {
                                type: "GUILD_CHANNEL_LIST",
                                guild: guild,
                            },
                        });
                    }}
                >
                    <ul className={styles.channelList}>
                        {channels[0]?.type !== 4 && <div></div>}

                        {channels.length > 0 ? (
                            channels.map((channel: TChannel) => {
                                if (channel.type === 4) {
                                    return (
                                        <ChannelItem
                                            key={channel.id}
                                            channel={channel}
                                            guild={guild}
                                            member={member}
                                            hidden={hiddenCategories.includes(channel.id)}
                                            setHidden={setHiddenCategories}
                                        />
                                    );
                                }

                                if (
                                    hiddenCategories.includes(channel?.parentId) &&
                                    params?.channelId !== channel.id
                                )
                                    return;

                                if (channel.parentId) {
                                    const category = channels.find(
                                        (channel: TChannel) => channel.id === channel.parentId
                                    );

                                    return (
                                        <ChannelItem
                                            key={channel.id}
                                            channel={channel}
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
                                src="https://ucarecdn.com/c65d6610-8a49-4133-a0c0-eb69f977c6b5/"
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

type ChannelItemProps = {
    channel: TChannel;
    guild: TGuild;
    member: TCleanUser;
    hidden?: boolean;
    setHidden?: Dispatch<SetStateAction<string[]>>;
};

const ChannelItem = ({ channel, guild, member, hidden, setHidden }: ChannelItemProps) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const pathname = usePathname();
    const params = useParams();

    if (channel.type === 4) {
        return (
            <motion.li
                tabIndex={0}
                drag="y"
                dragSnapToOrigin={true}
                draggable={true}
                className={`${styles.category} ${hidden ? styles.hide : ""}`}
                onClick={() => {
                    if (!setHidden) return;
                    if (!hidden) {
                        setHidden((prev: string[]) => [...prev, channel.id]);
                    } else {
                        setHidden((prev: string[]) => prev.filter((id) => id !== channel.id));
                    }
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "GUILD_CHANNEL",
                            guild: guild,
                            channel: channel,
                        },
                    });
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
                        setLayers({
                            settings: {
                                type: "MENU",
                                element: e.currentTarget,
                                firstSide: "RIGHT",
                            },
                            content: {
                                type: "GUILD_CHANNEL",
                                guild: guild,
                                channel: channel,
                            },
                        });
                    }
                }}
            >
                <div>
                    <Icon name="caret" />
                    <h3>{channel.name}</h3>
                </div>

                <button
                    onMouseEnter={(e) => {
                        setTooltip({
                            text: "Create Channel",
                            element: e.currentTarget,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_CHANNEL_CREATE",
                                guild: channel.guildId,
                                category: channel,
                            },
                        });
                    }}
                    onFocus={(e) => {
                        setTooltip({
                            text: "Create Channel",
                            element: e.currentTarget,
                        });
                    }}
                    onBlur={() => setTooltip(null)}
                >
                    <Icon name="add" />
                </button>
            </motion.li>
        );
    }

    return (
        <motion.li
            drag="y"
            dragSnapToOrigin={true}
            draggable={true}
            className={styles.channel}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLayers({
                    settings: {
                        type: "MENU",
                        event: e,
                    },
                    content: {
                        type: "GUILD_CHANNEL",
                        guild: guild,
                        channel: channel,
                    },
                });
            }}
        >
            <div>
                <div>
                    <Link
                        href={`/channels/${channel.guildId}/${channel.id}`}
                        style={{
                            backgroundColor:
                                params.channelId === channel.id ? "var(--background-hover-2)" : "",
                        }}
                        onClick={(e) => {
                            if (channel.type === 3 || pathname.includes(channel.id))
                                e.preventDefault();
                        }}
                    >
                        <div>
                            <div
                                className={styles.icon}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: channel.type === 2 ? "Text" : "Voice",
                                        element: e.currentTarget,
                                        delay: 500,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name={channel.type === 2 ? "hashtag" : "voice"} />
                            </div>

                            <div
                                className={styles.name}
                                style={{
                                    color:
                                        params.channelId === channel.id
                                            ? "var(--foreground-1)"
                                            : "",
                                }}
                            >
                                {channel.name}
                            </div>

                            <div className={styles.tools}>
                                {channel.type === 3 && (
                                    <button
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Open Chat",
                                                element: e.currentTarget,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onFocus={(e) => {
                                            setTooltip({
                                                text: "Open Chat",
                                                element: e.currentTarget,
                                            });
                                        }}
                                        onBlur={() => setTooltip(null)}
                                        style={{
                                            display: params.channelId === channel.id ? "flex" : "",
                                            flex: params.channelId === channel.id ? "0 0 auto" : "",
                                        }}
                                    >
                                        <Icon
                                            name="message"
                                            size={16}
                                            viewbox="0 0 24 24"
                                        />
                                    </button>
                                )}

                                <button
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: "Create Invite",
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onFocus={(e) => {
                                        setTooltip({
                                            text: "Create Invite",
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onBlur={() => setTooltip(null)}
                                    style={{
                                        display: params.channelId === channel.id ? "flex" : "",
                                        flex: params.channelId === channel.id ? "0 0 auto" : "",
                                    }}
                                >
                                    <Icon name="addUser" />
                                </button>

                                <button
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: "Edit Channel",
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onFocus={(e) => {
                                        setTooltip({
                                            text: "Edit Channel",
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onBlur={() => setTooltip(null)}
                                    style={{
                                        display: params.channelId === channel.id ? "flex" : "",
                                        flex: params.channelId === channel.id ? "0 0 auto" : "",
                                    }}
                                >
                                    <Icon name="cog" />
                                </button>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.li>
    );
};
