"use client";

import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger, useMenuContext } from "../Menu";
import { useCollapsedCategories, useTriggerDialog } from "@/store";
import { getDateUntilEnd, isStillMuted } from "@/lib/mute";
import { useNotifications } from "@/store/notifications";
import { usePermissions } from "@/hooks/usePermissions";
import type { GuildChannel, UserGuild } from "@/type";
import { useGuildSettings } from "@/store/settings";
import styles from "../Menu.module.css";

export function ChannelMenu({ guild, channel }: { guild: UserGuild; channel: GuildChannel }) {
    const { notifications, removeGuildNotifications } = useNotifications();
    const guildSettings = useGuildSettings((s) => s.guilds[guild.id]);
    const { hasPermission } = usePermissions({ guildId: guild.id });
    const { collapsed, setCollapsed } = useCollapsedCategories();
    const { setGuildSettings } = useGuildSettings();
    const { triggerDialog } = useTriggerDialog();
    const { setOpen } = useMenuContext();

    const hasUnread = notifications.guilds.find((g) => g.id === guild.id)?.hasUnread || false;

    function muteGuild(duration: string) {
        setGuildSettings(guild.id, [
            ["duration", duration],
            ["started", Date.now()],
            ["isMuted", true],
        ]);
    }

    function unmuteGuild() {
        setGuildSettings(guild.id, [
            ["duration", null],
            ["started", null],
            ["isMuted", false],
        ]);
    }

    async function copy(str: string | number) {
        try {
            await navigator.clipboard.writeText(str.toString());
        } catch (err) {
            console.error(err);
        }
    }

    if (!guildSettings) {
        // If guild settings don't exist, create them
        setGuildSettings(guild.id, "isMuted", false);
        return null;
    }

    const channelLink = `${window.location.origin}/channels/${guild.id}/${channel.id}`;
    const dateUntil = getDateUntilEnd(guildSettings?.duration, guildSettings?.started);
    const isMuted = isStillMuted(guildSettings?.duration, guildSettings?.started);

    const collapsedFromGuild = guild.channels.filter((c) => collapsed.includes(c.id));
    const notCollapsed = guild.channels.filter((c) => !collapsed.includes(c.id));
    const isCollapsed = collapsed.includes(channel.id);

    return (
        <MenuContent>
            <MenuItem
                disabled={!hasUnread}
                onClick={() => removeGuildNotifications(guild.id)}
            >
                Mark As Read
            </MenuItem>

            <MenuDivider />

            {channel.type !== 4 && (
                <>
                    {hasPermission({
                        permission: "CREATE_INSTANT_INVITE",
                        specificChannelId: channel.id,
                    }) && (
                        <MenuItem
                            onClick={() => {
                                triggerDialog({
                                    type: "INVITE",
                                    data: { guild, channel },
                                });
                                setOpen(false);
                            }}
                        >
                            Invite People
                        </MenuItem>
                    )}

                    <MenuItem
                        onClick={() => {
                            copy(channelLink);
                        }}
                    >
                        Copy Link
                    </MenuItem>
                </>
            )}

            {channel.type === 4 && (
                <>
                    <MenuItem
                        checked={isCollapsed}
                        onClick={() => {
                            setCollapsed(channel.id);
                        }}
                    >
                        Collapse Category
                    </MenuItem>

                    {!!notCollapsed.length && (
                        <MenuItem
                            onClick={() => {
                                for (const c of notCollapsed) {
                                    setCollapsed(c.id);
                                }
                            }}
                        >
                            Collapse All Categories
                        </MenuItem>
                    )}
                </>
            )}

            <MenuDivider />

            {isMuted ? (
                <MenuItem onClick={() => unmuteGuild()}>
                    <div>
                        Unmute {channel.type === 4 ? "Category" : "Channel"}
                        {dateUntil && (
                            <div className={styles.subtext}>
                                Muted until{" "}
                                {dateUntil.toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                })}
                            </div>
                        )}
                    </div>
                </MenuItem>
            ) : (
                <Menu
                    gap={12}
                    openOnHover
                    openOnFocus
                    flipMainAxis
                    placement="right-start"
                >
                    <MenuTrigger>
                        <div>
                            <MenuItem submenu>
                                Mute {channel.type === 4 ? "Category" : "Channel"}
                            </MenuItem>
                        </div>
                    </MenuTrigger>

                    <MenuContent>
                        <MenuItem onClick={() => muteGuild("15m")}>For 15 Minutes</MenuItem>
                        <MenuItem onClick={() => muteGuild("1h")}>For 1 Hour</MenuItem>
                        <MenuItem onClick={() => muteGuild("3h")}>For 3 Hours</MenuItem>
                        <MenuItem onClick={() => muteGuild("8h")}>For 8 Hours</MenuItem>
                        <MenuItem onClick={() => muteGuild("24h")}>For 24 Hours</MenuItem>

                        <MenuItem onClick={() => muteGuild("always")}>
                            Until I turn it back on
                        </MenuItem>
                    </MenuContent>
                </Menu>
            )}

            <Menu
                gap={12}
                openOnHover
                openOnFocus
                flipMainAxis
                placement="right-start"
            >
                <MenuTrigger>
                    <div>
                        <MenuItem submenu>
                            <div>
                                Notification Settings
                                <div className={styles.subtext}>
                                    {guildSettings.notifications.get === "all" ? (
                                        "All Messages"
                                    ) : guildSettings.notifications.get === "mentions" ? (
                                        <>
                                            Only <strong>@mentions</strong>
                                        </>
                                    ) : (
                                        "Nothing"
                                    )}
                                </div>
                            </div>
                        </MenuItem>
                    </div>
                </MenuTrigger>

                <MenuContent>
                    <MenuItem
                        picked={guildSettings.notifications.get === "all"}
                        onClick={() => {
                            setGuildSettings(guild.id, "get", "all");
                        }}
                    >
                        <div>
                            Use {channel.parentId ? "Category" : "Server"} Default
                            <div className={styles.subtext}>
                                {guildSettings.notifications.get === "all" ? (
                                    "All Messages"
                                ) : guildSettings.notifications.get === "mentions" ? (
                                    <>
                                        Only <strong>@mentions</strong>
                                    </>
                                ) : (
                                    "Nothing"
                                )}
                            </div>
                        </div>
                    </MenuItem>

                    <MenuItem
                        picked={guildSettings.notifications.get === "all"}
                        onClick={() => {
                            setGuildSettings(guild.id, "get", "all");
                        }}
                    >
                        All Messages
                    </MenuItem>

                    <MenuItem
                        picked={guildSettings.notifications.get === "mentions"}
                        onClick={() => {
                            setGuildSettings(guild.id, "get", "mentions");
                        }}
                    >
                        <div>
                            Only <strong>@mentions</strong>
                        </div>
                    </MenuItem>

                    <MenuItem
                        picked={guildSettings.notifications.get === "none"}
                        onClick={() => {
                            setGuildSettings(guild.id, "get", "none");
                        }}
                    >
                        Nothing
                    </MenuItem>
                </MenuContent>
            </Menu>

            <MenuDivider />

            {hasPermission({ permission: "MANAGE_CHANNELS" }) && (
                <>
                    <MenuItem
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Edit {channel.type === 4 ? "Category" : "Channel"}
                    </MenuItem>

                    {channel.type !== 4 && (
                        <>
                            <MenuItem
                                onClick={() => {
                                    console.error("Not implemented");
                                    setOpen(false);
                                }}
                            >
                                Duplicate Channel
                            </MenuItem>

                            <MenuItem>
                                Create {channel.type === 2 ? "Text" : "Voice"} Channel
                            </MenuItem>
                        </>
                    )}

                    <MenuItem
                        danger
                        onClick={() => {
                            triggerDialog({
                                type: "GUILD_CHANNEL_DELETE",
                                data: { channel },
                            });
                            setOpen(false);
                        }}
                    >
                        Delete {channel.type === 4 ? "Category" : "Channel"}
                    </MenuItem>

                    <MenuDivider />
                </>
            )}

            <MenuItem
                icon="id"
                onClick={() => copy(channel.id)}
            >
                Copy {channel.type === 4 ? "Category" : "Channel"} ID
            </MenuItem>
        </MenuContent>
    );
}
