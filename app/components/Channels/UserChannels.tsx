"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactElement, useEffect, useMemo } from "react";
import { Icon, Avatar, UserSection } from "@components";
import useContextHook from "@/hooks/useContextHook";
import pusher from "@/lib/pusher/client-connection";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./UserChannels.module.css";
import Link from "next/link";
import { useLayers, useTooltip } from "@/lib/store";

interface Props {
    user: TCleanUser;
    channels: TChannel[];
}

export const UserChannels = ({ user, channels }: Props): ReactElement => {
    const { setAuth }: any = useContextHook({ context: "auth" });

    // useEffect(() => {
    //     pusher.bind("channel-created", (data: any) => {});
    //     pusher.bind("channel-left", (data: any) => {});
    //     pusher.bind("channel-recipient-add", (data: any) => {});
    //     pusher.bind("message-sent", (data: any) => {});

    //     return () => {
    //         pusher.unbind("channel-created");
    //         pusher.unbind("channel-left");
    //         pusher.unbind("channel-recipient-add");
    //         pusher.unbind("message-sent");
    //     };
    // }, []);

    useEffect(() => {
        setAuth((auth: any) => ({
            ...auth,
            channels,
        }));
    }, []);

    return useMemo(
        () => (
            <div className={styles.nav}>
                <div className={styles.privateChannels}>
                    <div className={styles.searchContainer}>
                        <button>Find or start a conversation</button>
                    </div>

                    <div className={styles.scroller + " scrollbar"}>
                        <ul className={styles.channelList}>
                            <div></div>

                            <ChannelItem special />
                            <Title />

                            {channels.length > 0 ? (
                                channels.map((channel: TChannel) => (
                                    <ChannelItem key={channel.id} channel={channel} currentUser={user} />
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

                <UserSection user={user} />
            </div>
        ),
        [channels, user]
    );
};

const Title = () => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                onMouseEnter={(e) => {
                    if (layers.POPUP.map((layer) => layer.content.type).includes("CREATE_DM")) {
                        return;
                    }
                    setTooltip({
                        text: "Create DM",
                        element: e.currentTarget,
                    });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) => {
                    if (layers.POPUP.map((layer) => layer.content.type).includes("CREATE_DM")) {
                        setLayers({
                            settings: {
                                type: "POPUP",
                                setNull: true,
                            },
                        });
                        setTooltip({
                            text: "Create DM",
                            element: e.currentTarget,
                        });
                    } else {
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
                    }
                }}
            >
                <Icon name="add" size={16} viewbox="0 0 18 18" />
            </div>
        </h2>
    );
};

interface ChannelItemProps {
    special?: boolean;
    channel?: TChannel;
    currentUser?: TCleanUser;
}

const ChannelItem = ({ special, channel, currentUser }: ChannelItemProps) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const { sendRequest } = useFetchHelper();

    const pathname = usePathname();
    const router = useRouter();

    const badgeCount = 90;

    let user: TCleanUser | null = null;
    if (channel?.type === 0 && currentUser) {
        user = channel.recipients.find((user) => user.id !== currentUser.id) || null;
    }

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
                                    fill={pathname === "/channels/@me" ? "var(--foreground-1)" : "var(--foreground-3)"}
                                />
                            </div>

                            <div className={styles.layoutContent}>
                                <div className={styles.contentName}>
                                    <div className={styles.nameWrapper}>Friends</div>
                                </div>
                            </div>
                        </div>

                        {badgeCount > 0 && <div className={styles.friendsPending}>{badgeCount}</div>}
                    </div>
                </div>
            </Link>
        );
    } else if (channel) {
        // console.log(channel);
        return useMemo(
            () => (
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
                                channel: channel || null,
                            },
                        });
                    }}
                    style={{
                        backgroundColor: pathname.includes(channel.id) ? "var(--background-5)" : "",
                        color: pathname.includes(channel.id) ? "var(--foreground-1)" : "",
                    }}
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.link}>
                            <div className={styles.layout}>
                                <div className={styles.layoutAvatar}>
                                    <div>
                                        <Avatar
                                            src={channel.icon || ""}
                                            alt={channel.name || ""}
                                            size={32}
                                            status={user?.status}
                                            tooltip={user ? true : false}
                                        />
                                    </div>
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <div className={styles.nameWrapper}>{channel.name}</div>
                                    </div>

                                    {user?.customStatus && channel.type !== 1 && (
                                        <div
                                            className={styles.contentStatus}
                                            onMouseEnter={(e) => {
                                                e.stopPropagation();
                                                setTooltip({
                                                    text: user?.customStatus,
                                                    element: e.currentTarget,
                                                    delay: 500,
                                                });
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
                            className={styles.closeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();

                                sendRequest({
                                    query: "CHANNEL_DELETE",
                                    params: { channelId: channel.id },
                                });

                                if (pathname.includes(channel.id)) {
                                    router.push("/channels/me");
                                }
                            }}
                        >
                            <Icon name="close" size={16} />
                        </div>
                    </div>
                </Link>
            ),
            [channel, user]
        );
    }
};
