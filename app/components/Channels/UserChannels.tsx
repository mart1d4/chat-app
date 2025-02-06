"use client";

import { useData, useShowChannels, useWindowSettings } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { getDateUntilEnd, isStillMuted } from "@/lib/mute";
import type { ChannelRecipient, DMChannel } from "@/type";
import { usePathname, useRouter } from "next/navigation";
import { useNotifications } from "@/store/notifications";
import { useChannelSettings } from "@/store/settings";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./UserChannels.module.css";
import { useMemo, useRef } from "react";
import Link from "next/link";
import {
    PopoverContent,
    PopoverTrigger,
    TooltipContent,
    TooltipTrigger,
    DialogTrigger,
    UserSection,
    MenuTrigger,
    LeaveGroup,
    CreateDM,
    UserMenu,
    Tooltip,
    Popover,
    Dialog,
    Avatar,
    Icon,
    Menu,
} from "@components";

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

                        <ChannelItem />
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
    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <Popover placement="bottom-start">
                <Tooltip>
                    <TooltipTrigger>
                        <PopoverTrigger asChild>
                            <button>
                                <Icon name="add" />
                            </button>
                        </PopoverTrigger>
                    </TooltipTrigger>

                    <TooltipContent>Create DM</TooltipContent>
                </Tooltip>

                <PopoverContent>
                    <CreateDM />
                </PopoverContent>
            </Popover>
        </h2>
    );
}

function ChannelItem({ channel }: { channel?: DMChannel & { recipients: ChannelRecipient[] } }) {
    const requests = useData((state) => state.received).length;
    const { notifications } = useNotifications();
    const { sendRequest } = useFetchHelper();
    const { muted } = useChannelSettings();
    const { removeChannel } = useData();
    const user = useAuthenticatedUser();

    const hasPing = notifications.channels.find((c) => c.id === channel?.id && c.pings > 0);

    const statusRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    const statusBigger = useMemo(() => {
        if (!statusRef.current) return false;
        return statusRef.current.scrollWidth > 136;
    }, [statusRef.current]);

    const nameBigger = useMemo(() => {
        if (!nameRef.current) return false;
        return nameRef.current.scrollWidth > 136;
    }, [nameRef.current]);

    const {
        isMuted,
    }: {
        isMuted: boolean;
        dateUntil: Date | null;
    } = useMemo(() => {
        if (!channel) {
            return { isMuted: false, dateUntil: null };
        }

        const is = muted.find(
            (obj) => obj.channelId === channel.id && isStillMuted(obj.duration, obj.started)
        );

        if (!is) {
            return { isMuted: false, dateUntil: null };
        } else {
            return { isMuted: true, dateUntil: getDateUntilEnd(is.duration, is.started) };
        }
    }, [muted]);

    if (!channel) {
        const sameUrl = pathname === "/channels/me";

        return (
            <Link
                href={`/channels/me`}
                className={styles.liContainer}
                style={{
                    color: sameUrl ? "var(--foreground-1)" : "",
                    borderColor: sameUrl ? "var(--background-1)" : "",
                    backgroundColor: sameUrl ? "var(--background-5)" : "",
                }}
            >
                <div className={styles.liWrapper}>
                    <div className={styles.linkFriends}>
                        <div className={styles.layoutFriends}>
                            <div className={styles.layoutAvatar}>
                                <Icon name="friends" />
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

    const friend = channel.type === 0 ? channel.recipients.find((r) => r.id !== user.id) : null;
    const sameUrl = pathname.includes(channel.id.toString());

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="right-start"
        >
            <MenuTrigger>
                <Link
                    className={styles.liContainer}
                    href={`/channels/me/${channel.id}`}
                    style={{
                        backgroundColor: sameUrl ? "var(--background-5)" : "",
                        color: sameUrl || hasPing ? "var(--foreground-1)" : "",
                        borderColor: sameUrl ? "var(--background-1)" : "",
                        opacity: isMuted ? 0.3 : undefined,
                    }}
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.link}>
                            <div className={styles.layout}>
                                <div className={styles.layoutAvatar}>
                                    <div>
                                        <Avatar
                                            size={32}
                                            alt={channel.name}
                                            status={friend?.status}
                                            generateId={friend?.id || channel.id}
                                            fileId={friend?.avatar || channel.icon}
                                            type={channel.type === 0 ? "user" : "channel"}
                                        />
                                    </div>
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <Tooltip
                                            delay={750}
                                            show={nameBigger}
                                        >
                                            <TooltipTrigger>
                                                <div
                                                    ref={nameRef}
                                                    className={styles.nameWrapper}
                                                >
                                                    {channel.name}
                                                </div>
                                            </TooltipTrigger>

                                            <TooltipContent>{channel.name}</TooltipContent>
                                        </Tooltip>
                                    </div>

                                    {friend?.customStatus && (
                                        <Tooltip
                                            delay={750}
                                            show={statusBigger}
                                        >
                                            <TooltipTrigger>
                                                <div
                                                    ref={statusRef}
                                                    className={styles.contentStatus}
                                                >
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

                        <Dialog>
                            <DialogTrigger>
                                <button
                                    className={styles.closeButton}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (channel.type === 0) {
                                            const { errors } = await sendRequest({
                                                query: "CHANNEL_DELETE",
                                                params: { channelId: channel.id },
                                            });

                                            if (!errors) {
                                                removeChannel(channel.id);

                                                if (sameUrl) {
                                                    router.push("/channels/me");
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <Icon
                                        size={16}
                                        name="close"
                                    />
                                </button>
                            </DialogTrigger>

                            {channel.type !== 0 && (
                                <LeaveGroup
                                    channelId={channel.id}
                                    channelName={channel.name}
                                />
                            )}
                        </Dialog>
                    </div>
                </Link>
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
}
