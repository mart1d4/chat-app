"use client";

import { MenuContent, MenuDivider, MenuTrigger, MenuItem, Menu } from "@components";
import { useData, useMention, useTriggerAlert, useTriggerDialog, useVoice } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useRelationships } from "@/hooks/useRelationships";
import { getDateUntilEnd, isStillMuted } from "@/lib/mute";
import { usePopoverContext } from "../../Popover/Popover";
import { useNotifications } from "@/store/notifications";
import { useChannelSettings } from "@/store/settings";
import { useRequests } from "@/hooks/useRequests";
import { useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMenuContext } from "../Menu";
import styles from "../Menu.module.css";
import type { GuildChannel, User } from "@/type";
import { isChannelPrivate } from "@/lib/permissions";

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
    const { removeChannelRecipient: removeChannelR, guilds, channels, updateGuild } = useData();
    const { muted, muteChannel, unmuteChannel } = useChannelSettings();
    const { notifications, removeNotification } = useNotifications();
    const { channelId: voiceId, setChannelId } = useVoice();
    const { setOpen: setPopoverOpen } = usePopoverContext();
    const { triggerDialog } = useTriggerDialog();
    const { triggerAlert } = useTriggerAlert();
    const appUser = useAuthenticatedUser();
    const { setOpen } = useMenuContext();
    const { setMention } = useMention();
    const router = useRouter();
    const {
        removeChannelRecipient,
        getGuildChannels,
        createChannel,
        deleteChannel,
        updateChannel,
        createInvite,
        removeFriend,
        sendMessage,
        unblockUser,
        addFriend,
    } = useRequests();

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
    }, [muted]);

    const hasUnread = notifications.channels.find((c) => c.id === channelId)?.hasUnread || false;

    const { isCurrentUser, isFriend, hasRequested, wasRequested, isBlocked } = useRelationships(
        user?.id
    );

    function messageUser() {
        if (!user?.id) return;
        createChannel.send({ recipients: [user.id] }, { onComplete: () => setOpen(false) });
    }

    const callUser = useCallback(() => {
        if (!user?.id) return;

        const users = [user.id, appUser.id];

        const channelExists = channels.find(
            (c) =>
                c.type === 0 &&
                c.recipients.every((r) => users.includes(r.id)) &&
                c.recipients.length === 2
        );

        if (channelExists) {
            if (channelExists.id !== voiceId) {
                setChannelId(channelExists.id);
            }

            setOpen(false);
            router.push(`/channels/me/${channelExists.id}`);
        } else {
            createChannel.send(
                { recipients: [user.id] },
                {
                    onComplete: (data) => {
                        if (data.channelId !== voiceId) {
                            setChannelId(data.channelId);
                        }

                        setOpen(false);
                        router.push(`/channels/me/${data.channelId}`);
                    },
                }
            );
        }
    }, [channels, user, appUser, voiceId]);

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

    function fetchGuildChannels(guildId: number) {
        const guild = guilds.find((g) => g.id === guildId);

        if (guild && guild.channels.length === 0) {
            getGuildChannels.send(
                { guildId },
                {
                    onComplete: (data: { channels: GuildChannel[] }) => {
                        console.log("Received data: ", data);

                        if (data.channels) {
                            const everyoneRole = guild.roles.find(
                                (role) => role.name === "@everyone"
                            )?.id;

                            const channels = data.channels
                                .map((channel) => {
                                    const overwrites = channel.permissionOverwrites || [];

                                    const newOverwrites = overwrites.map(
                                        (o: { allow: string; deny: string }) => ({
                                            ...o,
                                            allow: BigInt(o.allow),
                                            deny: BigInt(o.deny),
                                        })
                                    );

                                    const isPrivate = everyoneRole
                                        ? isChannelPrivate(
                                              channel.permissionOverwrites,
                                              everyoneRole
                                          )
                                        : false;

                                    return {
                                        ...channel,
                                        permissionOverwrites: newOverwrites,
                                        isPrivate,
                                    };
                                })
                                .sort((a, b) => a.position - b.position);

                            updateGuild(guild.id, { channels });
                        }
                    },
                }
            );
        }
    }

    function inviteToGuild(guildId: number) {
        const guild = guilds.find((g) => g.id === guildId);
        if (!guild) return;

        const inviteChannel =
            guild.channels.find((c) => c.id === guild.systemChannelId) ||
            guild.channels.find((c) => c.type === 2) ||
            guild.channels.find((c) => c.type === 3);

        if (!inviteChannel) {
            return triggerAlert("info", "No channel found to send the invite to.");
        }

        createInvite.send(
            {
                channelId: inviteChannel.id,
                body: {
                    maxUses: 100,
                    maxAge: 86400,
                    temporary: false,
                },
            },
            {
                onComplete: (data) => {
                    if (data.invite.code) {
                        const sameChannel = channels.find((c) => {
                            return (
                                c.type === 0 &&
                                c.recipients.every((r) => [appUser.id, user.id].includes(r.id))
                            );
                        });

                        let channelId = sameChannel?.id;
                        if (!channelId) {
                            createChannel.send(
                                { recipients: [user.id] },
                                { onComplete: (data) => (channelId = data.channelId) }
                            );
                        }

                        if (!channelId) return;

                        sendMessage.send({
                            channelId,
                            message: { content: `${window.location.origin}/${data.invite.code}` },
                            senderShouldReceive: true,
                        });
                    }
                },
            }
        );
    }

    if (type === "small") {
        return (
            <MenuContent>
                <MenuItem
                    onClick={() => {
                        setOpen(false);
                        callUser();
                    }}
                >
                    Start Video Call
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        setOpen(false);
                        callUser();
                    }}
                >
                    Start Voice Call
                </MenuItem>

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

                            if (setPopoverOpen) {
                                setPopoverOpen(false);
                            }
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
                                <MenuItem
                                    key={guild.id}
                                    onClick={() => inviteToGuild(guild.id)}
                                    onFocus={() => fetchGuildChannels(guild.id)}
                                    onMouseEnter={() => fetchGuildChannels(guild.id)}
                                    disabled={
                                        !guilds.find((g) => g.id === guild.id)?.channels?.length
                                    }
                                >
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
                        onClick={() => unblockUser.send({ userId: user.id })}
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

    if (type === "author" && isCurrentUser) {
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

                        if (setPopoverOpen) {
                            setPopoverOpen(false);
                        }
                    }}
                >
                    Profile
                </MenuItem>

                {channelType !== 0 && (
                    <MenuItem onClick={() => setMention(user.id)}>Mention</MenuItem>
                )}

                {channelType === 0 && (
                    <MenuItem
                        onClick={() => {
                            deleteChannel.send({ channelId }, { onComplete: () => setOpen(false) });
                        }}
                    >
                        Close DM
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

                {channelIcon && (
                    <MenuItem
                        onClick={() => updateChannel.send({ channelId, body: { icon: null } })}
                    >
                        Remove Icon
                    </MenuItem>
                )}

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
                disabled={!!isBlocked}
                onClick={() => {
                    setOpen(false);
                    callUser();
                }}
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
                <MenuItem
                    onClick={() => {
                        deleteChannel.send({ channelId }, { onComplete: () => setOpen(false) });
                    }}
                >
                    Close DM
                </MenuItem>
            )}

            {channelOwnerId === appUser.id && (
                <>
                    <MenuDivider />

                    <MenuItem
                        danger
                        onClick={() => {
                            removeChannelRecipient.send(
                                { channelId, recipientId: user.id },
                                {
                                    onComplete: () => {
                                        removeChannelR(channelId as number, user.id);
                                        setOpen(false);
                                    },
                                }
                            );
                        }}
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
                            <MenuItem
                                key={guild.id}
                                onClick={() => inviteToGuild(guild.id)}
                                onFocus={() => fetchGuildChannels(guild.id)}
                                onMouseEnter={() => fetchGuildChannels(guild.id)}
                                disabled={!guilds.find((g) => g.id === guild.id)?.channels?.length}
                            >
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
            ) : hasRequested ? (
                <MenuItem
                    onClick={() => {
                        addFriend.send({ userId: user.id }, { onComplete: () => setOpen(false) });
                    }}
                >
                    Accept Friend Request
                </MenuItem>
            ) : wasRequested ? (
                <MenuItem
                    onClick={() => {
                        removeFriend.send(
                            { username: user.username },
                            { onComplete: () => setOpen(false) }
                        );
                    }}
                >
                    Cancel Friend Request
                </MenuItem>
            ) : (
                <MenuItem
                    onClick={() => {
                        addFriend.send(
                            { username: user.username },
                            { onComplete: () => setOpen(false) }
                        );
                    }}
                    disabled={!!isBlocked}
                >
                    Add Friend
                </MenuItem>
            )}

            {isBlocked ? (
                <MenuItem
                    onClick={() => {
                        unblockUser.send({ userId: user.id }, { onComplete: () => setOpen(false) });
                    }}
                >
                    Unblock
                </MenuItem>
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
