"use client";

import { MenuContent, MenuDivider, MenuTrigger, MenuItem, Menu } from "@components";
import { useData, useMention, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { getDateUntilEnd, isStillMuted } from "@/lib/mute";
import { useChannelSettings } from "@/store/settings";
import useRequestHelper from "@/hooks/useFetchHelper";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMenuContext } from "../Menu";
import styles from "../Menu.module.css";
import type { User } from "@/type";
import { useNotifications } from "@/store/notifications";

export function UserMenu({
    user,
    type,
    channelType,
    channelId,
    channelName,
    channelOwnerId,
    channelIcon,
}: {
    user: (User["id"] & Partial<User>) | undefined;
    type?: "small" | "profile" | "card" | "author" | "channel";
    channelType?: number;
    channelId?: number;
    channelName?: string;
    channelOwnerId?: number;
    channelIcon?: string;
}) {
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    const { muted, muteChannel, unmuteChannel } = useChannelSettings();
    const { notifications, removeNotification } = useNotifications();
    const { triggerDialog } = useTriggerDialog();
    const { sendRequest } = useRequestHelper();
    const appUser = useAuthenticatedUser();
    const { setOpen } = useMenuContext();
    const { setMention } = useMention();
    const router = useRouter();
    const {
        removeChannelRecipient,
        removeChannel,
        channels,
        received,
        friends,
        blocked,
        guilds,
        sent,
    } = useData();

    const {
        isMuted,
        dateUntil,
    }: {
        isMuted: boolean;
        dateUntil: Date | null;
    } = useMemo(() => {
        const is = muted.find(
            (obj) => obj.channelId === channelId && isStillMuted(obj.duration, obj.started)
        );

        if (!is) {
            return { isMuted: false, dateUntil: null };
        } else {
            return { isMuted: true, dateUntil: getDateUntilEnd(is.duration, is.started) };
        }
    }, [muted, channelId]);

    const hasUnread = notifications.channels.find((c) => c.id === channelId)?.hasUnread || false;

    const isSameUser = user?.id === appUser.id;
    const isFriend = friends.find((friend) => friend.id === user?.id);
    const isReceived = received.find((friend) => friend.id === user?.id);
    const isSent = sent.find((friend) => friend.id === user?.id);
    const isBlocked = blocked.find((friend) => friend.id === user?.id);

    const dmWithUser = channels.find((channel) => {
        const recipient = channel.recipients.find((r) => r.id === user?.id);
        return recipient && channel.recipients.length === 2;
    });

    async function addFriend() {
        if (loading.addFriend || !user?.username) return;
        setLoading((prev) => ({ ...prev, addFriend: true }));

        try {
            const { errors } = await sendRequest({
                query: "ADD_FRIEND",
                body: { username: user.username },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, addFriend: false }));
    }

    async function removeFriend() {
        if (loading.removeFriend || !user?.username) return;
        setLoading((prev) => ({ ...prev, removeFriend: true }));

        try {
            const { errors } = await sendRequest({
                query: "REMOVE_FRIEND",
                body: { username: user.username },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, removeFriend: false }));
    }

    async function blockUser() {
        if (loading.blockUser || !user?.id) return;
        setLoading((prev) => ({ ...prev, blockUser: true }));

        try {
            const { errors } = await sendRequest({
                query: "BLOCK_USER",
                params: { userId: user.id },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, blockUser: false }));
    }

    async function unblockUser() {
        if (loading.unblockUser || !user?.id) return;
        setLoading((prev) => ({ ...prev, unblockUser: true }));

        try {
            const { errors } = await sendRequest({
                query: "UNBLOCK_USER",
                params: { userId: user.id },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, unblockUser: false }));
    }

    async function messageUser() {
        if (loading.message || !user?.id) return;

        if (dmWithUser) {
            setOpen(false);
            router.push(`/channels/me/${dmWithUser.id}`);
            return;
        }

        setLoading((prev) => ({ ...prev, message: true }));

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_CREATE",
                body: { recipients: [user.id] },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, message: false }));
    }

    async function closeDM() {
        if (loading.closeDM || !dmWithUser) return;
        setLoading((prev) => ({ ...prev, closeDM: true }));

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_DELETE",
                params: {
                    channelId: dmWithUser.id,
                },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, closeDM: false }));
    }

    async function removeFromChannel() {
        if (loading.removeFromChannel || !channelId || !user?.id) return;
        setLoading((prev) => ({ ...prev, removeFromChannel: true }));

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_RECIPIENT_REMOVE",
                params: {
                    channelId,
                    recipientId: user.id,
                },
            });

            if (!errors) {
                setOpen(false);
                removeChannelRecipient(channelId, user.id);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, removeFromChannel: false }));
    }

    async function removeChannelIcon() {
        if (loading.removeChannelIcon || !channelId) return;
        setLoading((prev) => ({ ...prev, removeChannelIcon: true }));

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_UPDATE",
                params: { channelId },
                body: { icon: null },
            });

            if (!errors) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, removeChannelIcon: false }));
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const size = file.size / 1024 / 1024;

            // If more than 4MB, return
            if (size > 4) return;

            triggerDialog({
                type: "CHANNEL_ICON_CHANGE",
                data: { channelId, file },
            });
        }
    }

    function copyToClipboard(text: string | number) {
        try {
            navigator.clipboard.writeText(text.toString());
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    }

    if (type === "small") {
        return (
            <MenuContent>
                <MenuItem>Start Video Call</MenuItem>
                <MenuItem>Start Voice Call</MenuItem>

                <MenuItem
                    danger
                    onClick={() => {
                        setOpen(false);
                        triggerDialog({
                            type: "REMOVE_FRIEND",
                            data: { user },
                        });
                    }}
                >
                    Remove Friend
                </MenuItem>
            </MenuContent>
        );
    }

    if (type === "profile" || type === "card") {
        if (user.id === appUser.id) {
            return (
                <MenuContent>
                    <MenuItem
                        icon="id"
                        onClick={() => copyToClipboard(user.id)}
                    >
                        Copy User ID
                    </MenuItem>
                </MenuContent>
            );
        }

        return (
            <MenuContent>
                {type === "card" && (
                    <MenuItem
                        onClick={() => {
                            setOpen(false);
                            triggerDialog({
                                type: "USER_PROFILE",
                                data: { user },
                            });
                        }}
                    >
                        View Full Profile
                    </MenuItem>
                )}

                {!isBlocked && !!guilds.length && (
                    <Menu
                        gap={12}
                        openOnHover
                        openOnFocus
                        flipMainAxis
                        placement="right-start"
                    >
                        <MenuTrigger>
                            <div>
                                <MenuItem submenu>Invite to Server</MenuItem>
                            </div>
                        </MenuTrigger>

                        <MenuContent>
                            {guilds.map((guild) => (
                                <MenuItem key={guild.id}>
                                    <p>{guild.name}</p>
                                </MenuItem>
                            ))}
                        </MenuContent>
                    </Menu>
                )}

                {((!isBlocked && !!guilds.length) || type === "card") && <MenuDivider />}

                {isBlocked ? (
                    <MenuItem
                        danger
                        onClick={unblockUser}
                    >
                        Unblock
                    </MenuItem>
                ) : (
                    <MenuItem
                        danger
                        onClick={() => {
                            setOpen(false);
                            triggerDialog({
                                type: "BLOCK_USER",
                                data: { user },
                            });
                        }}
                    >
                        Block
                    </MenuItem>
                )}

                <MenuDivider />

                <MenuItem
                    icon="id"
                    onClick={() => copyToClipboard(user.id)}
                >
                    Copy User ID
                </MenuItem>
            </MenuContent>
        );
    }

    if (type === "author" && isSameUser) {
        return (
            <MenuContent>
                {channelType === 0 && (
                    <MenuItem
                        disabled={!hasUnread}
                        onClick={() => removeNotification(channelId as number)}
                    >
                        Mark As Read
                    </MenuItem>
                )}

                {channelType === 0 && <MenuDivider />}

                <MenuItem
                    onClick={() => {
                        setOpen(false);
                        triggerDialog({
                            type: "USER_PROFILE",
                            data: { user },
                        });
                    }}
                >
                    Profile
                </MenuItem>

                {channelType !== 0 && (
                    <MenuItem onClick={() => setMention(user.id)}>Mention</MenuItem>
                )}

                {channelType === 0 && <MenuItem onClick={closeDM}>Close DM</MenuItem>}

                <MenuDivider />

                <MenuItem
                    icon="id"
                    onClick={() => copyToClipboard(user.id)}
                >
                    Copy User ID
                </MenuItem>
            </MenuContent>
        );
    }

    if (type === "channel" && !user) {
        if (!channelId || !channelName || channelIcon === undefined) return null;

        return (
            <MenuContent>
                <MenuItem
                    disabled={!hasUnread}
                    onClick={() => removeNotification(channelId as number)}
                >
                    Mark As Read
                </MenuItem>

                <MenuDivider />

                <MenuItem
                    skipHide
                    onClick={() => {
                        const input = document.getElementById("channel-icon");
                        if (input) {
                            input.click();
                        }
                    }}
                >
                    Change Icon
                    <input
                        type="file"
                        id="channel-icon"
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        style={{
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0,
                            opacity: 0,
                            position: "absolute",
                        }}
                    />
                </MenuItem>

                {channelIcon && <MenuItem onClick={removeChannelIcon}>Remove Icon</MenuItem>}

                <MenuDivider />

                {isMuted ? (
                    <MenuItem onClick={() => unmuteChannel(channelId)}>
                        <div>
                            Unmute Conversation
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
                                <MenuItem submenu>Mute Conversation</MenuItem>
                            </div>
                        </MenuTrigger>

                        <MenuContent>
                            <MenuItem
                                onClick={() => {
                                    muteChannel("15m", channelId);
                                    setOpen(false);
                                }}
                            >
                                For 15 Minutes
                            </MenuItem>

                            <MenuItem onClick={() => muteChannel("1h", channelId)}>
                                For 1 Hour
                            </MenuItem>

                            <MenuItem onClick={() => muteChannel("3h", channelId)}>
                                For 3 Hours
                            </MenuItem>

                            <MenuItem onClick={() => muteChannel("8h", channelId)}>
                                For 8 Hours
                            </MenuItem>

                            <MenuItem onClick={() => muteChannel("24h", channelId)}>
                                For 24 Hours
                            </MenuItem>

                            <MenuItem onClick={() => muteChannel("always", channelId)}>
                                Until I turn it back on
                            </MenuItem>
                        </MenuContent>
                    </Menu>
                )}

                <MenuDivider />

                <MenuItem
                    danger
                    onClick={() => {
                        triggerDialog({
                            type: "LEAVE_GROUP",
                            data: { channelId, channelName },
                        });
                    }}
                >
                    Leave Group
                </MenuItem>

                <MenuDivider />

                <MenuItem
                    icon="id"
                    onClick={() => copyToClipboard(channelId)}
                >
                    Copy Channel ID
                </MenuItem>
            </MenuContent>
        );
    }

    return (
        <MenuContent>
            {channelType === 0 && (
                <MenuItem
                    disabled={!hasUnread}
                    onClick={() => removeNotification(channelId as number)}
                >
                    Mark As Read
                </MenuItem>
            )}

            {channelType === 0 && <MenuDivider />}

            <MenuItem
                onClick={() => {
                    setOpen(false);
                    triggerDialog({
                        type: "USER_PROFILE",
                        data: { user },
                    });
                }}
            >
                Profile
            </MenuItem>

            {!!channelType && channelType !== 0 && (
                <MenuItem onClick={() => setMention(user.id)}>Mention</MenuItem>
            )}

            {(type !== "author" || channelType !== 0) && type !== "channel" && (
                <MenuItem onClick={messageUser}>Message</MenuItem>
            )}

            <MenuItem
                onClick={messageUser}
                disabled={!!isBlocked}
            >
                Call
            </MenuItem>

            <MenuItem
                onClick={() => {
                    setOpen(false);
                    triggerDialog({
                        type: "USER_PROFILE",
                        data: { user, focusNote: true },
                    });
                }}
            >
                Add Note
            </MenuItem>

            {isFriend && <MenuItem>Add Friend Nickname</MenuItem>}

            {((type === "author" && channelType === 0) || type === "channel") && (
                <MenuItem onClick={closeDM}>Close DM</MenuItem>
            )}

            {channelOwnerId === appUser.id && (
                <>
                    <MenuDivider />

                    <MenuItem
                        danger
                        onClick={removeFromChannel}
                    >
                        Remove From Group
                    </MenuItem>

                    <MenuItem
                        danger
                        onClick={() => {
                            setOpen(false);
                            triggerDialog({
                                type: "OWNER_CHANGE",
                                data: { user, channelId: channelId },
                            });
                        }}
                    >
                        Make Group Owner
                    </MenuItem>
                </>
            )}

            <MenuDivider />

            {!isBlocked && !!guilds.length && (
                <Menu
                    gap={12}
                    openOnHover
                    openOnFocus
                    flipMainAxis
                    placement="right-start"
                >
                    <MenuTrigger>
                        <div>
                            <MenuItem submenu>Invite to Server</MenuItem>
                        </div>
                    </MenuTrigger>

                    <MenuContent>
                        {guilds.map((guild) => (
                            <MenuItem key={guild.id}>
                                <p>{guild.name}</p>
                            </MenuItem>
                        ))}
                    </MenuContent>
                </Menu>
            )}

            {isFriend ? (
                <MenuItem
                    onClick={() => {
                        setOpen(false);
                        triggerDialog({
                            type: "REMOVE_FRIEND",
                            data: { user: user },
                        });
                    }}
                >
                    Remove Friend
                </MenuItem>
            ) : isReceived ? (
                <MenuItem onClick={addFriend}>Accept Friend Request</MenuItem>
            ) : isSent ? (
                <MenuItem onClick={removeFriend}>Cancel Friend Request</MenuItem>
            ) : (
                <MenuItem
                    onClick={addFriend}
                    disabled={!!isBlocked}
                >
                    Add Friend
                </MenuItem>
            )}

            {isBlocked ? (
                <MenuItem onClick={unblockUser}>Unblock</MenuItem>
            ) : (
                <MenuItem
                    onClick={() => {
                        setOpen(false);
                        triggerDialog({
                            type: "BLOCK_USER",
                            data: { user: user },
                        });
                    }}
                >
                    Block
                </MenuItem>
            )}

            <MenuDivider />

            {type === "channel" && channelId && (
                <>
                    {isMuted ? (
                        <MenuItem onClick={() => unmuteChannel(channelId)}>
                            <div>
                                Unmute @{user.displayName}
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
                                    <MenuItem submenu>Mute @{user.displayName}</MenuItem>
                                </div>
                            </MenuTrigger>

                            <MenuContent>
                                <MenuItem onClick={() => muteChannel("15m", channelId)}>
                                    For 15 Minutes
                                </MenuItem>

                                <MenuItem onClick={() => muteChannel("1h", channelId)}>
                                    For 1 Hour
                                </MenuItem>

                                <MenuItem onClick={() => muteChannel("3h", channelId)}>
                                    For 3 Hours
                                </MenuItem>

                                <MenuItem onClick={() => muteChannel("8h", channelId)}>
                                    For 8 Hours
                                </MenuItem>

                                <MenuItem onClick={() => muteChannel("24h", channelId)}>
                                    For 24 Hours
                                </MenuItem>

                                <MenuItem onClick={() => muteChannel("always", channelId)}>
                                    Until I turn it back on
                                </MenuItem>
                            </MenuContent>
                        </Menu>
                    )}

                    <MenuDivider />
                </>
            )}

            <MenuItem
                icon="id"
                onClick={() => copyToClipboard(user.id)}
            >
                Copy User ID
            </MenuItem>

            {type === "channel" && channelId && (
                <MenuItem
                    icon="id"
                    onClick={() => copyToClipboard(channelId)}
                >
                    Copy Channel ID
                </MenuItem>
            )}
        </MenuContent>
    );
}
