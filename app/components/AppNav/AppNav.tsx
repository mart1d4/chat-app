"use client";

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    CreateGuild,
    Menu,
    MenuTrigger,
    UserMenu,
} from "@components";
import { doesUserHaveGuildPermission, type PERMISSIONS } from "@/lib/permissions";
import { useData, useShowChannels, useWindowSettings } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { GuildMenu } from "../Layers/Menu/MenuContents/Guild";
import { useNotifications } from "@/store/notifications";
import { getCdnUrl } from "@/lib/uploadthing";
import styles from "./AppNav.module.css";
import NavIcon from "./NavIcon";

export function AppNav() {
    const guilds = useData((state) => state.guilds);
    const { notifications } = useNotifications();
    const user = useAuthenticatedUser();

    const dmChannelsWithPings = useData((state) => state.channels)
        .filter((channel) => notifications.channels.find((c) => c.id === channel.id && c.pings > 0))
        .map((channel) => ({
            ...channel,
            pings: notifications.channels.find((c) => c.id === channel.id)?.pings || 0,
        }));

    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
    const { showChannels } = useShowChannels();

    if (!showChannels && !widthLimitPassed) return null;

    const chatAppIcon = (
        <svg
            viewBox="0 0 24 24"
            height="30"
            width="30"
        >
            <path
                fill="currentColor"
                d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z"
            />
        </svg>
    );

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
                <NavIcon
                    special={true}
                    svg={chatAppIcon}
                    link={"/channels/me"}
                    name="Direct Messages"
                />

                {dmChannelsWithPings.map((channel) => {
                    const friend =
                        channel.type === 0
                            ? channel.recipients.find((r) => r.id !== user.id)
                            : null;

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

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>

                {guilds.map((guild) => {
                    function hasPerm(permission: keyof typeof PERMISSIONS) {
                        return (
                            doesUserHaveGuildPermission(
                                guild.roles,
                                guild.members.find((m) => m.id === user.id),
                                permission
                            ) || guild.ownerId === user.id
                        );
                    }

                    const notificationGuild = notifications.guilds.find((g) => g.id === guild.id);

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

                            <GuildMenu
                                guild={guild}
                                hasPerm={hasPerm}
                            />
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
}
