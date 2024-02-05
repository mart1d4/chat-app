"use client";

import { getChannelIcon, getChannelName } from "@/lib/strings";
import { useData, useNotifications, useShowChannels } from "@/lib/store";
import styles from "./AppNav.module.css";
import NavIcon from "./NavIcon";

export const AppNav = () => {
    const user = useData((state) => state.user) as TCleanUser;
    const pings = useNotifications((state) => state.pings);
    const channels = useData((state) => state.channels);
    const guilds = useData((state) => state.guilds);
    const showChannels = useShowChannels((state) => state.showChannels);

    if (!showChannels) return null;

    const filteredChannels = channels.filter((channel) =>
        pings.map((ping) => ping.channelId).includes(channel.id)
    );

    const chatAppIcon = (
        <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
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
                    name="Direct Messages"
                    link={"/channels/me"}
                    svg={chatAppIcon}
                />

                {filteredChannels.map((channel) => (
                    <NavIcon
                        key={channel.id}
                        name={getChannelName(channel, user.id)}
                        link={`/channels/me/${channel.id}`}
                        src={`${process.env.NEXT_PUBLIC_CDN_URL}/${getChannelIcon(
                            channel,
                            user.id
                        )}/`}
                        count={pings.find((ping) => ping.channelId === channel.id)?.amount}
                        user={channel.recipients.find((recipient) => recipient.id !== user.id)}
                    />
                ))}

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>

                {guilds.map((guild) => (
                    <NavIcon
                        key={guild.id}
                        name={guild.name}
                        guild={guild}
                        link={`/channels/${guild.id}`}
                        src={
                            guild.icon
                                ? `${process.env.NEXT_PUBLIC_CDN_URL}/${guild.icon}/`
                                : undefined
                        }
                        count={0}
                    />
                ))}

                <NavIcon
                    green={true}
                    name="Add a Server"
                    link={"/channels/add"}
                    svg={addServerIcon}
                    count={0}
                />

                <NavIcon
                    green={true}
                    name="Discover Servers"
                    link={"/channels/discover"}
                    svg={discoverIcon}
                    count={0}
                />
            </ul>
        </nav>
    );
};
