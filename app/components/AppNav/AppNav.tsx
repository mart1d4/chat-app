"use client";

import { useData, useShowChannels, useVoice, useWindowSettings } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { GuildMenu } from "../Layers/Menu/MenuContents/Guild";
import { useNotifications } from "@/store/notifications";
import { getCdnUrl } from "@/lib/uploadthing";
import styles from "./AppNav.module.css";
import { NavIcon } from "./NavIcon";
import { memo } from "react";
import {
    DialogContent,
    DialogTrigger,
    CreateGuild,
    MenuTrigger,
    MenuContent,
    UserMenu,
    MenuItem,
    Dialog,
    Menu,
    Icon,
} from "@components";

export const AppNav = function AppNav() {
    const { notifications, removeAllDMNotifications, removeAllNotifications } = useNotifications();
    const user = useAuthenticatedUser();
    const { channelId } = useVoice();
    const { guilds } = useData();

    const chanNotifs = notifications.channels;
    const guildNotifs = notifications.guilds;

    const dmChannelsWithPings = useData((state) => state.channels)
        .filter((ch) => chanNotifs.find((c) => c.id === ch.id && c.pings > 0))
        .map((c) => ({
            ...c,
            pings: chanNotifs.find((ch) => ch.id === c.id)?.pings || 0,
        }));

    const voiceChannel = useData((state) => state.channels).find((ch) => ch.id === channelId);

    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
    const { showChannels } = useShowChannels();

    if (!showChannels && !widthLimitPassed) return null;

    const addServerIcon = (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z"
            />
        </svg>
    );

    const discoverIcon = (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
        >
            <path
                fill="currentColor"
                d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
            />
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0ZM7.74 9.3A2 2 0 0 1 9.3 7.75l7.22-1.45a1 1 0 0 1 1.18 1.18l-1.45 7.22a2 2 0 0 1-1.57 1.57l-7.22 1.45a1 1 0 0 1-1.18-1.18L7.74 9.3Z"
                clipRule="evenodd"
            />
        </svg>
    );

    return (
        <nav className={styles.nav}>
            <ul className={styles.list}>
                <Menu
                    positionOnClick
                    openOnRightClick
                    placement="right-start"
                >
                    <MenuTrigger>
                        <div>
                            <NavIcon
                                special={true}
                                link={"/channels/me"}
                                name="Direct Messages"
                                svg={<Icon name="message" />}
                            />
                        </div>
                    </MenuTrigger>

                    {!!chanNotifs.length && (
                        <MenuContent>
                            {!!dmChannelsWithPings.length && (
                                <MenuItem onClick={() => removeAllDMNotifications()}>
                                    Read All DMs
                                </MenuItem>
                            )}

                            <MenuItem onClick={() => removeAllNotifications()}>
                                Read All Notifications
                            </MenuItem>
                        </MenuContent>
                    )}
                </Menu>

                {dmChannelsWithPings.map((channel) => {
                    const friend =
                        channel.type === 0
                            ? channel.recipients.find((r) => r.id !== user.id)
                            : null;

                    const hasVoice = voiceChannel?.id === channel.id;

                    return (
                        <Menu
                            positionOnClick
                            openOnRightClick
                            key={channel.id}
                            placement="right-start"
                        >
                            <MenuTrigger>
                                <div>
                                    <NavIcon
                                        voice={hasVoice}
                                        name={channel.name}
                                        pings={channel.pings}
                                        channelType={channel.type}
                                        link={`/channels/me/${channel.id}`}
                                        src={
                                            channel.icon
                                                ? `${getCdnUrl}${channel.icon}`
                                                : channel.type === 0
                                                ? friend?.id
                                                : channel.id
                                        }
                                    />
                                </div>
                            </MenuTrigger>

                            <UserMenu
                                user={friend}
                                type="channel"
                                channelId={channel.id}
                                channelType={channel.type}
                                channelName={channel.name}
                                channelIcon={channel.icon}
                            />
                        </Menu>
                    );
                })}

                {voiceChannel && !dmChannelsWithPings.find((c) => c.id === voiceChannel.id) && (
                    <Menu
                        positionOnClick
                        openOnRightClick
                        key={voiceChannel.id}
                        placement="right-start"
                    >
                        <MenuTrigger>
                            <div>
                                <NavIcon
                                    voice
                                    name={voiceChannel.name}
                                    channelType={voiceChannel.type}
                                    link={`/channels/me/${voiceChannel.id}`}
                                    src={
                                        voiceChannel.icon
                                            ? `${getCdnUrl}${voiceChannel.icon}`
                                            : voiceChannel.type === 0
                                            ? (voiceChannel.type === 0
                                                  ? voiceChannel.recipients.find(
                                                        (r) => r.id !== user.id
                                                    )
                                                  : null
                                              )?.id
                                            : voiceChannel.id
                                    }
                                />
                            </div>
                        </MenuTrigger>

                        <UserMenu
                            user={
                                voiceChannel.type === 0
                                    ? voiceChannel.recipients.find((r) => r.id !== user.id)
                                    : null
                            }
                            type="channel"
                            channelId={voiceChannel.id}
                            channelType={voiceChannel.type}
                            channelName={voiceChannel.name}
                            channelIcon={voiceChannel.icon}
                        />
                    </Menu>
                )}

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>

                {guilds.map((guild) => {
                    const notificationGuild = guildNotifs.find((g) => g.id === guild.id);

                    const pings = notificationGuild?.pings || 0;
                    const hasUnread = notificationGuild?.hasUnread || false;

                    return (
                        <Menu
                            key={guild.id}
                            positionOnClick
                            openOnRightClick
                            placement="right-start"
                        >
                            <MenuTrigger>
                                <div>
                                    <NavIcon
                                        pings={pings}
                                        guild={guild}
                                        name={guild.name}
                                        hasUnread={hasUnread}
                                        link={`/channels/${guild.id}`}
                                        src={guild.icon ? `${getCdnUrl}${guild.icon}` : undefined}
                                    />
                                </div>
                            </MenuTrigger>

                            <GuildMenu guild={guild} />
                        </Menu>
                    );
                })}

                <Dialog>
                    <DialogTrigger>
                        <div>
                            <NavIcon
                                green
                                name="Add a Server"
                                svg={addServerIcon}
                                link={"/channels/add"}
                            />
                        </div>
                    </DialogTrigger>

                    <DialogContent blank>
                        <CreateGuild />
                    </DialogContent>
                </Dialog>

                <NavIcon
                    green
                    svg={discoverIcon}
                    link={"/channels/discover"}
                    name="Explore Discoverable Servers"
                />
            </ul>
        </nav>
    );
};
