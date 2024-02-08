"use client";

import {
    useData,
    useLayers,
    useNotifications,
    useShowChannels,
    useTooltip,
    useWidthThresholds,
} from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Avatar, UserSection } from "@components";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./UserChannels.module.css";
import { Channel, User } from "@/lib/db/types";
import Link from "next/link";

export function UserChannels() {
    const widthLimitPassed = useWidthThresholds((state) => state.widthThresholds)[562];
    const showChannels = useShowChannels((state) => state.showChannels);
    const channels = useData((state) => state.channels);

    if (!showChannels && !widthLimitPassed) return null;

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button>Find or start a conversation</button>
                </div>

                <div className={styles.scroller + " scrollbar"}>
                    <ul className={styles.channelList}>
                        <div />

                        <ChannelItem special />
                        <Title />

                        {channels.length > 0 ? (
                            channels.map((channel) => (
                                <ChannelItem
                                    key={channel.id}
                                    channel={channel}
                                />
                            ))
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
}

const Title = () => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <button
                onMouseEnter={(e) => {
                    setTooltip({
                        text: "Create DM",
                        element: e.currentTarget,
                    });
                }}
                onMouseLeave={() => setTooltip(null)}
                onFocus={(e) => {
                    setTooltip({
                        text: "Create DM",
                        element: e.currentTarget,
                    });
                }}
                onBlur={() => setTooltip(null)}
                onClick={(e) => {
                    setTooltip(null);
                    setLayers({
                        settings: {
                            type: "POPUP",
                            element: e.currentTarget,
                            firstSide: "BOTTOM",
                            secondSide: "RIGHT",
                            gap: 5,
                        },
                        content: {
                            type: "CREATE_DM",
                        },
                    });
                }}
            >
                <Icon name="add" />
            </button>
        </h2>
    );
};

type ChannelItemProps =
    | {
          special: boolean;
          channel?: never;
      }
    | {
          special?: never;
          channel: Channel;
      };

function ChannelItem({ special, channel }: ChannelItemProps) {
    const requests = useData((state) => state.requestsReceived).length;
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const pings = useNotifications((state) => state.pings);
    const currentUser = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const isPinged = (pings.find((ping) => ping.channelId === channel?.id)?.amount || 0) > 0;

    const pathname = usePathname();
    const router = useRouter();

    if (special) {
        return (
            <Link
                href={`/channels/me`}
                className={styles.liContainer}
                style={{
                    backgroundColor: pathname === "/channels/me" ? "var(--background-5)" : "",
                    color: pathname === "/channels/me" ? "var(--foreground-1)" : "",
                }}
            >
                <div className={styles.liWrapper}>
                    <div className={styles.linkFriends}>
                        <div className={styles.layoutFriends}>
                            <div className={styles.layoutAvatar}>
                                <Icon
                                    name="friends"
                                    fill={
                                        pathname === "/channels/@me"
                                            ? "var(--foreground-1)"
                                            : "var(--foreground-3)"
                                    }
                                />
                            </div>

                            <div className={styles.layoutContent}>
                                <div className={styles.contentName}>
                                    <div className={styles.nameWrapper}>Friends</div>
                                </div>
                            </div>
                        </div>

                        {requests > 0 && <div className={styles.friendsPending}>{requests}</div>}
                    </div>
                </div>
            </Link>
        );
    } else {
        let user: User | null = null;
        if (channel.type === 0) {
            user = channel.recipients.find((user) => user.id !== currentUser.id);
        }

        return (
            <Link
                className={styles.liContainer}
                href={`/channels/me/${channel.id}`}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "CHANNEL",
                            user: user,
                            channel: channel,
                        },
                    });
                }}
                style={{
                    backgroundColor: pathname.includes(channel.id) ? "var(--background-5)" : "",
                    color: pathname.includes(channel.id) || isPinged ? "var(--foreground-1)" : "",
                }}
            >
                <div className={styles.liWrapper}>
                    <div className={styles.link}>
                        <div className={styles.layout}>
                            <div className={styles.layoutAvatar}>
                                <div>
                                    <Avatar
                                        src={channel.icon}
                                        alt={channel.name}
                                        size={32}
                                        status={user?.status}
                                        tooltip={user ? true : false}
                                    />
                                </div>
                            </div>

                            <div className={styles.layoutContent}>
                                <div className={styles.contentName}>
                                    <div
                                        className={styles.nameWrapper}
                                        onMouseEnter={(e) => {
                                            if (e.currentTarget.offsetWidth >= 136) {
                                                setTooltip({
                                                    text: channel.name as string,
                                                    element: e.currentTarget,
                                                    delay: 750,
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {channel.name}
                                    </div>
                                </div>

                                {user?.customStatus && channel.type !== 1 && (
                                    <div
                                        className={styles.contentStatus}
                                        onMouseEnter={(e) => {
                                            if (e.currentTarget.offsetWidth >= 136) {
                                                setTooltip({
                                                    text: user.customStatus as string,
                                                    element: e.currentTarget,
                                                    delay: 750,
                                                });
                                            }
                                        }}
                                        onMouseLeave={(e) => setTooltip(null)}
                                    >
                                        {user.customStatus}
                                    </div>
                                )}

                                {channel.type === 1 && (
                                    <div className={styles.contentStatus}>
                                        {channel.recipients.length} Member
                                        {channel.recipients.length > 1 && "s"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        tabIndex={0}
                        className={styles.closeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            if (channel.type === 0) {
                                sendRequest({
                                    query: "CHANNEL_DELETE",
                                    params: { channelId: channel.id },
                                });
                            } else {
                                sendRequest({
                                    query: "CHANNEL_RECIPIENT_REMOVE",
                                    params: {
                                        channelId: channel.id,
                                        recipientId: currentUser.id,
                                    },
                                });
                            }

                            if (pathname.includes(channel.id)) router.push("/channels/me");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.stopPropagation();
                                e.preventDefault();

                                if (channel.type === 0) {
                                    sendRequest({
                                        query: "CHANNEL_DELETE",
                                        params: { channelId: channel.id },
                                    });
                                } else {
                                    sendRequest({
                                        query: "CHANNEL_RECIPIENT_REMOVE",
                                        params: {
                                            channelId: channel.id,
                                            recipientId: currentUser.id,
                                        },
                                    });
                                }

                                if (pathname.includes(channel.id)) router.push("/channels/me");
                            }
                        }}
                    >
                        <Icon
                            name="close"
                            size={16}
                        />
                    </div>
                </div>
            </Link>
        );
    }
}
