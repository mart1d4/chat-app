"use client";

import { useData, useLayers, useNotifications, useShowChannels, useWindowSettings } from "@/store";
import { TooltipContent, TooltipTrigger, Tooltip } from "../Layers/Tooltip/Tooltip";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Avatar, UserSection } from "@components";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./UserChannels.module.css";
import type { Channel } from "@/type";
import Link from "next/link";

export function UserChannels() {
    const widthLimitPassed = useWindowSettings((state) => state.widthThresholds)[562];
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
}

function Title() {
    const setLayers = useLayers((state) => state.setLayers);

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <Tooltip>
                <TooltipTrigger>
                    <button
                        onClick={(e) => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                    element: e.currentTarget,
                                    firstSide: "BOTTOM",
                                    secondSide: "RIGHT",
                                    gap: 5,
                                },
                                content: { type: "CREATE_DM" },
                            });
                        }}
                    >
                        <Icon name="add" />
                    </button>
                </TooltipTrigger>

                <TooltipContent>Create DM</TooltipContent>
            </Tooltip>
        </h2>
    );
}

function ChannelItem({ channel }: { channel?: Channel }) {
    const requests = useData((state) => state.received).length;
    const setLayers = useLayers((state) => state.setLayers);
    const pings = useNotifications((state) => state.pings);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const pathname = usePathname();
    const router = useRouter();

    if (!channel) {
        const sameUrl = pathname === "/channels/me";

        return (
            <Link
                href={`/channels/me`}
                className={styles.liContainer}
                style={{
                    backgroundColor: sameUrl ? "var(--background-5)" : "",
                    color: sameUrl ? "var(--foreground-1)" : "",
                    borderColor: sameUrl ? "var(--background-1)" : "",
                }}
            >
                <div className={styles.liWrapper}>
                    <div className={styles.linkFriends}>
                        <div className={styles.layoutFriends}>
                            <div className={styles.layoutAvatar}>
                                <Icon
                                    name="friends"
                                    fill={`var(--foreground-${sameUrl ? 1 : 3})`}
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
    }

    const isPinged = (pings.find((p) => p.channelId === channel.id)?.amount || 0) > 0;
    const friend = channel.type === 0 ? channel.recipients.find((r) => r.id !== user.id) : null;
    const sameUrl = pathname.includes(channel.id.toString());

    return (
        <Link
            className={styles.liContainer}
            href={`/channels/me/${channel.id}`}
            onContextMenu={(e) => {
                setLayers({
                    settings: { type: "MENU", event: e },
                    content: {
                        type: "CHANNEL",
                        user: friend,
                        channel: channel,
                    },
                });
            }}
            style={{
                backgroundColor: sameUrl ? "var(--background-5)" : "",
                color: sameUrl || isPinged ? "var(--foreground-1)" : "",
                borderColor: sameUrl ? "var(--background-1)" : "",
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
                                    type="icons"
                                    status={friend?.status}
                                    tooltip={friend ? true : false}
                                />
                            </div>
                        </div>

                        <div className={styles.layoutContent}>
                            <div className={styles.contentName}>
                                <Tooltip
                                    showOnWidth={136}
                                    delay={750}
                                >
                                    <TooltipTrigger>
                                        <div className={styles.nameWrapper}>{channel.name}</div>
                                    </TooltipTrigger>

                                    <TooltipContent>{channel.name}</TooltipContent>
                                </Tooltip>
                            </div>

                            {friend?.customStatus && (
                                <Tooltip
                                    showOnWidth={136}
                                    delay={750}
                                >
                                    <TooltipTrigger>
                                        <div className={styles.contentStatus}>
                                            {friend.customStatus}
                                        </div>
                                    </TooltipTrigger>

                                    <TooltipContent>{friend.customStatus}</TooltipContent>
                                </Tooltip>
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

                <button
                    className={styles.closeButton}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (channel.type === 0) {
                            sendRequest({
                                query: "CHANNEL_HIDE",
                                params: { channelId: channel.id },
                            });

                            if (sameUrl) {
                                router.push("/channels/me");
                            }
                        } else {
                            setLayers({
                                settings: { type: "POPUP" },
                                content: { type: "LEAVE_CONFIRM", channel: channel },
                            });
                        }
                    }}
                >
                    <Icon
                        name="close"
                        size={16}
                    />
                </button>
            </div>
        </Link>
    );
}
