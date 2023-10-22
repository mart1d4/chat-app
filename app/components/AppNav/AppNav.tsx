"use client";

import { getChannelIcon, getChannelName } from "@/lib/strings";
import { useData, useNotifications } from "@/lib/store";
import styles from "./AppNav.module.css";
import NavIcon from "./NavIcon";

export const AppNav = () => {
    const user = useData((state) => state.user) as TCleanUser;
    const pings = useNotifications((state) => state.pings);
    const channels = useData((state) => state.channels);
    const guilds = useData((state) => state.guilds);

    const filteredChannels = channels.filter((channel) => pings.map((ping) => ping.channelId).includes(channel.id));

    const chatAppIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#ffffff"
            stroke="#fff"
        >
            <path d="M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z" />
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
                d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
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
                d="M12 10.9C11.39 10.9 10.9 11.39 10.9 12C10.9 12.61 11.39 13.1 12 13.1C12.61 13.1 13.1 12.61 13.1 12C13.1 11.39 12.61 10.9 12 10.9ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z"
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
                        src={`${process.env.NEXT_PUBLIC_CDN_URL}/${getChannelIcon(channel, user.id)}/`}
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
                        src={guild.icon ? `${process.env.NEXT_PUBLIC_CDN_URL}/${guild.icon}/` : undefined}
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
