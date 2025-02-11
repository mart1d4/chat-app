"use client";

import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger, useMenuContext } from "../Menu";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { getDateUntilEnd, isStillMuted } from "@/lib/mute";
import { useNotifications } from "@/store/notifications";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings, useShowSettings } from "@/store";
import { useGuildSettings } from "@/store/settings";
import type { UserGuild } from "@/type";
import styles from "../Menu.module.css";

export function GuildMenu({ guild, type }: { guild: UserGuild; type?: "settings" }) {
    const appUser = useAuthenticatedUser();
    const { setOpen } = useMenuContext();

    const { notifications, removeGuildNotifications } = useNotifications();
    const guildSettings = useGuildSettings((s) => s.guilds[guild.id]);
    const { hasPermission } = usePermissions({ guildId: guild.id });
    const { setGuildSettings } = useGuildSettings();
    const { setShowSettings } = useShowSettings();
    const { settings } = useSettings();

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

    async function copyGuildId() {
        try {
            await navigator.clipboard.writeText(guild.id.toString());
        } catch (err) {
            console.error(err);
        }
    }

    if (!guildSettings) {
        // If guild settings don't exist, create them
        setGuildSettings(guild.id, "isMuted", false);
        return null;
    }

    const isMuted = isStillMuted(guildSettings?.duration, guildSettings?.started);
    const dateUntil = getDateUntilEnd(guildSettings?.duration, guildSettings?.started);

    const profile = guild.members.find((m) => m.id === appUser.id);
    if (!profile) return null;

    if (type === "settings") {
        return (
            <MenuContent width={220}>
                <MenuItem icon="boost">Server Boost</MenuItem>

                <MenuDivider />

                {hasPermission({ permission: "CREATE_INSTANT_INVITE" }) && (
                    <MenuItem icon="users-add">Invite People</MenuItem>
                )}

                {hasPermission({ permission: "MANAGE_GUILD" }) && (
                    <>
                        <MenuItem
                            icon="cog"
                            onClick={() => {
                                setShowSettings({
                                    type: "GUILD",
                                    guild: guild,
                                });
                            }}
                        >
                            Server Settings
                        </MenuItem>

                        <MenuItem icon="insights">Server Insights</MenuItem>
                    </>
                )}

                {hasPermission({ permission: "MANAGE_CHANNELS" }) && (
                    <>
                        <MenuItem icon="add-circle">Create Channel</MenuItem>
                        <MenuItem icon="folder">Create Category</MenuItem>
                    </>
                )}

                {hasPermission({ permission: "CREATE_EVENTS" }) && (
                    <MenuItem icon="calendar">Create Event</MenuItem>
                )}

                <MenuItem icon="apps">App Directory</MenuItem>

                <MenuDivider />

                {guild.ownerId !== appUser.id && (
                    <MenuItem
                        checked={guildSettings.showAllChannels}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "showAllChannels",
                                !guildSettings.showAllChannels
                            );
                        }}
                    >
                        Show All Channels
                    </MenuItem>
                )}

                <MenuItem icon="bell">Notification Settings</MenuItem>
                <MenuItem icon="shield">Privacy Settings</MenuItem>

                <MenuDivider />

                <MenuItem icon="edit">Edit Server Profile</MenuItem>

                <MenuItem
                    checked={guildSettings.hideMutedChannels}
                    onClick={() => {
                        setGuildSettings(
                            guild.id,
                            "hideMutedChannels",
                            !guildSettings.hideMutedChannels
                        );
                    }}
                >
                    Hide Muted Channels
                </MenuItem>

                <MenuDivider />

                {hasPermission({ permission: "MANAGE_GUILD" }) && (
                    <>
                        <MenuItem
                            icon="lock"
                            danger
                        >
                            Security Actions
                        </MenuItem>

                        <MenuItem
                            icon="shield"
                            danger
                        >
                            Report Raid
                        </MenuItem>
                    </>
                )}

                {guild.ownerId !== appUser.id && (
                    <MenuItem
                        danger
                        icon="leave"
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Leave Server
                    </MenuItem>
                )}
            </MenuContent>
        );
    }

    return (
        <MenuContent>
            <MenuItem
                disabled={!hasUnread}
                onClick={() => removeGuildNotifications(guild.id)}
            >
                Mark Unread
            </MenuItem>

            <MenuDivider />

            {hasPermission({ permission: "CREATE_INSTANT_INVITE" }) && (
                <>
                    <MenuItem
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Invite People
                    </MenuItem>

                    <MenuDivider />
                </>
            )}

            {isMuted ? (
                <MenuItem onClick={() => unmuteGuild()}>
                    <div>
                        Unmute Server
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
                            <MenuItem submenu>Mute Server</MenuItem>
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

                    <MenuDivider />

                    <MenuItem
                        checked={guildSettings.notifications.noEveryoneAndHere}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "noEveryoneAndHere",
                                !guildSettings.notifications.noEveryoneAndHere
                            );
                        }}
                    >
                        <div>
                            Suppress <strong>@everyone</strong> and <strong>@here</strong>
                        </div>
                    </MenuItem>

                    <MenuItem
                        checked={guildSettings.notifications.noRoleMentions}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "noRoleMentions",
                                !guildSettings.notifications.noRoleMentions
                            );
                        }}
                    >
                        <div>
                            Suppress All Role <strong>@mentions</strong>
                        </div>
                    </MenuItem>

                    <MenuItem
                        checked={guildSettings.notifications.noHighlights}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "noHighlights",
                                !guildSettings.notifications.noHighlights
                            );
                        }}
                    >
                        Suppress Highlights
                    </MenuItem>

                    <MenuItem
                        checked={guildSettings.notifications.noEvents}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "noEvents",
                                !guildSettings.notifications.noEvents
                            );
                        }}
                    >
                        Mute New Events
                    </MenuItem>

                    <MenuDivider />

                    <MenuItem
                        checked={guildSettings.notifications.mobilePush}
                        onClick={() => {
                            setGuildSettings(
                                guild.id,
                                "mobilePush",
                                !guildSettings.notifications.mobilePush
                            );
                        }}
                    >
                        Mobile Push Notifications
                    </MenuItem>
                </MenuContent>
            </Menu>

            <MenuItem
                checked={guildSettings.hideMutedChannels}
                onClick={() => {
                    setGuildSettings(
                        guild.id,
                        "hideMutedChannels",
                        !guildSettings.hideMutedChannels
                    );
                }}
            >
                Hide Muted Channels
            </MenuItem>

            {guild.ownerId !== appUser.id && (
                <MenuItem
                    checked={guildSettings.showAllChannels}
                    onClick={() => {
                        setGuildSettings(
                            guild.id,
                            "showAllChannels",
                            !guildSettings.showAllChannels
                        );
                    }}
                >
                    Show All Channels
                </MenuItem>
            )}

            <MenuDivider />

            {hasPermission({ permission: "MANAGE_GUILD" }) && (
                <Menu
                    gap={12}
                    openOnHover
                    openOnFocus
                    flipMainAxis
                    placement="right-start"
                >
                    <MenuTrigger>
                        <div>
                            <MenuItem submenu>Server Settings</MenuItem>
                        </div>
                    </MenuTrigger>

                    <MenuContent>
                        <MenuItem>Oh No!</MenuItem>
                    </MenuContent>
                </Menu>
            )}

            <MenuItem
                onClick={() => {
                    console.error("Not implemented");
                    setOpen(false);
                }}
            >
                Privacy Settings
            </MenuItem>

            <MenuItem
                onClick={() => {
                    console.error("Not implemented");
                    setOpen(false);
                }}
            >
                Edit Server Profile
            </MenuItem>

            <MenuDivider />

            {hasPermission({ permission: "MANAGE_CHANNELS" }) && (
                <>
                    <MenuItem
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Create Channel
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Create Category
                    </MenuItem>

                    <MenuItem>Create Event</MenuItem>

                    <MenuDivider />
                </>
            )}

            {guild.ownerId !== appUser.id && (
                <>
                    <MenuItem
                        danger
                        onClick={() => {
                            console.error("Not implemented");
                            setOpen(false);
                        }}
                    >
                        Leave Server
                    </MenuItem>
                    <MenuDivider />{" "}
                </>
            )}

            <MenuItem
                icon="id"
                onClick={() => {
                    copyGuildId();
                    setOpen(false);
                }}
            >
                Copy Server ID
            </MenuItem>
        </MenuContent>
    );
}
