"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { ImageUpload } from "./ImageUpload/ImageUpload";
import type { KnownUser, UserGuild } from "@/type";
import { useRequests } from "@/hooks/useRequests";
import { DialogDescription } from "./Dialog";
import { getRelativeDate } from "@/lib/time";
import { useRouter } from "next/navigation";
import { useTriggerDialog } from "@/store";
import styles from "./Dialog.module.css";
import { useState } from "react";
import {
    RecordVoiceMessage,
    CreateGuildChannel,
    DialogContent,
    DialogProtip,
    UpdateStatus,
    FixedMessage,
    InviteDialog,
    UserProfile,
    LeaveGroup,
    Dialog,
    Avatar,
    Input,
} from "@components";

const warnings = {
    MESSAGE_LIMIT: {
        title: "Your message is too long...",
        description: "You've hit the 16000 character count limit.",
        confirmLabel: "Got it",
        hideCancel: true,
        boldHeading: true,
        art: "message_limit_dark_v2.png",
    },
    FILE_SIZE: {
        title: "Uh oh, this file exceeds the size limit.",
        description: "The max file size is 50MB.",
        confirmLabel: "Got it",
        hideCancel: true,
        boldHeading: true,
        art: "file_upload_dark_v2.png",
    },
    RATE_LIMIT: {
        title: "WOAH THERE. WAY TOO SPICY",
        description: "You're sending messages to quickly",
        confirmLabel: "Enter the chill zone",
        highlight: true,
        centered: true,
        hideCancel: false,
        boldHeading: true,
        art: "rate_limit_dark_v2.png",
    },
};

export function DialogOverlay() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [close, setClose] = useState(false);

    const { open, removeDialog } = useTriggerDialog();
    const appUser = useAuthenticatedUser();
    const router = useRouter();

    const {
        addChannelRecipients,
        deleteGuildChannel,
        removeAllReactions,
        deleteGuildRole,
        deleteChannel,
        createChannel,
        removeFriend,
        changeOwner,
        leaveGuild,
        blockUser,
    } = useRequests();

    function remove(id: string) {
        // If the dialog is the last one, close the overlay before removing it
        if (open.length === 1) {
            setClose(true);
            setTimeout(() => {
                removeDialog(id);
                setClose(false);
            }, 300);
        } else {
            removeDialog(id);
        }
    }

    const animation = `${styles.popOut} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both`;

    return open.map((obj, i) => {
        const { id, type, data } = obj;
        const warning = type in warnings ? warnings[type as keyof typeof warnings] : null;

        if (type === "GUILD_CHANNEL_DELETE") {
            if (!data?.channel) return null;

            return (
                <Dialog
                    key={id}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent
                        confirmColor="red"
                        confirmLoading={deleteChannel.isLoading}
                        heading={`Delete ${data.channel.type === 4 ? "Category" : "Channel"}`}
                        confirmLabel={`Delete ${data.channel.type === 4 ? "Category" : "Channel"}`}
                        onConfirm={() =>
                            deleteGuildChannel.send(
                                { channelId: data.channel.id },
                                { onComplete: () => remove(id) }
                            )
                        }
                    >
                        Are you sure you want to delete <strong>{data.channel.name}</strong>? This
                        cannot be undone.
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "GUILD_CHANNEL_CREATE") {
            if (!data?.guild) return null;

            return (
                <Dialog
                    key={id}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <CreateGuildChannel
                        guild={data.guild}
                        isCategory={data.isCategory}
                    />
                </Dialog>
            );
        }

        if (type === "INVITE") {
            if (!data?.guild || !data?.channel) return null;

            return (
                <Dialog
                    key={id}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent blank>
                        <InviteDialog
                            guild={data.guild}
                            channel={data.channel}
                        />
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "USER_PROFILE") {
            if (!data?.user.id) return null;

            return (
                <Dialog
                    key={id}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent blank>
                        <div style={{ animation: close ? animation : "" }}>
                            <UserProfile
                                initUser={data.user}
                                focusNote={data.focusNote}
                                startingTab={data.startingTab}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "USER_STATUS") {
            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <UpdateStatus />
                    </div>
                </Dialog>
            );
        }

        if (type === "BLOCK_USER") {
            if (!data?.user.id) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmColor="red"
                            confirmLabel="Block"
                            confirmLoading={blockUser.isLoading}
                            heading={`Block ${data?.user.username}?`}
                            onConfirm={() =>
                                blockUser.send(
                                    { userId: data.user.id },
                                    { onComplete: () => remove(id) }
                                )
                            }
                        >
                            <p>
                                Are you sure you want to block{" "}
                                <strong>{data?.user.username}</strong>? <br />
                                Blocking this user will also remove them from your friends list.
                            </p>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "REMOVE_FRIEND") {
            if (!data?.user.id) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmColor="red"
                            confirmLabel="Remove Friend"
                            confirmLoading={removeFriend.isLoading}
                            heading={`Remove '${data?.user.username}'`}
                            onConfirm={() =>
                                removeFriend.send(
                                    { username: data.user.username },
                                    {
                                        onComplete: () => remove(id),
                                    }
                                )
                            }
                        >
                            <p>
                                Are you sure you want to remove{" "}
                                <strong>{data?.user.username}</strong> from your friends?
                            </p>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "UNPIN_MESSAGE") {
            if (!data?.message || !data?.channel || !data?.functions) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmColor="red"
                            confirmLabel="Remove it please!"
                            heading="Unpin Message"
                            confirmLoading={loading.unpinMessage}
                            description="Are you sure you want to remove this pinned message?"
                            onConfirm={async () => {
                                setLoading((prev) => ({ ...prev, unpinMessage: true }));
                                await data.functions.unpinMessage();
                                remove(id);
                                setLoading((prev) => ({ ...prev, unpinMessage: false }));
                            }}
                        >
                            <FixedMessage
                                message={data.message}
                                channel={data.channel}
                            />

                            <DialogProtip>
                                You can hold down shift when clicking <strong>unpin message</strong>{" "}
                                to bypass this confirmation entirely.
                            </DialogProtip>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "VIEW_REACTIONS") {
            if (!data?.message || !data?.functions) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent hideFooter>TODO!</DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "REMOVE_REACTIONS") {
            if (!data?.channelId || !data?.messageId) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmLabel="Yes"
                            heading="Remove All Reactions"
                            description="Are you sure you want to remove all reactions from this message?"
                            confirmLoading={removeAllReactions.isLoading}
                            onConfirm={() => {
                                removeAllReactions.send(
                                    { channelId: data.channelId, messageId: data.messageId },
                                    { onComplete: () => remove(id) }
                                );
                            }}
                        />
                    </div>
                </Dialog>
            );
        }

        if (type === "ROLE_DELETE") {
            if (!data?.role || !data?.guildId) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmLabel="Okay"
                            heading="Delete Role"
                            confirmLoading={deleteGuildRole.isLoading}
                            onConfirm={() => {
                                deleteGuildRole.send(
                                    { guildId: data.guildId, roleId: data.role.id },
                                    { onComplete: () => remove(id) }
                                );
                            }}
                        >
                            <DialogDescription>
                                Are you sure you want to delete the{" "}
                                <strong>{data.role.name}</strong> role? This action cannot be
                                undone.
                            </DialogDescription>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "TIMEOUT_USER") {
            if (!data?.user || !data?.guild) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <TimeoutUser
                            user={data.user}
                            guild={data.guild}
                            remove={() => remove(id)}
                        />
                    </div>
                </Dialog>
            );
        }

        if (type === "KICK_USER") {
            if (!data?.user || !data?.guild) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <KickUser
                            user={data.user}
                            guild={data.guild}
                            remove={() => remove(id)}
                        />
                    </div>
                </Dialog>
            );
        }

        if (type === "BAN_USER") {
            if (!data?.user || !data?.guild) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <BanUser
                            user={data.user}
                            guild={data.guild}
                            remove={() => remove(id)}
                        />
                    </div>
                </Dialog>
            );
        }

        if (type === "LEAVE_GUILD") {
            if (!data?.guild) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent
                        confirmColor="red"
                        confirmLabel="Leave Server"
                        heading={`Leave '${data.guild.name}'`}
                        confirmLoading={leaveGuild.isLoading}
                        onConfirm={() => {
                            leaveGuild.send(
                                { guildId: data.guild.id },
                                { onComplete: () => remove(id) }
                            );
                        }}
                    >
                        <p>
                            Are you sure you want to leave <strong>{data.guild.name}</strong>? You
                            won't be able to rejoin this server unless you are re-invited.
                        </p>
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "PIN_MESSAGE") {
            if (!data?.message || !data?.channel || !data?.functions) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmColor="blue"
                            confirmLabel="Oh yeah. Pin it."
                            heading="Pin It. Pin It Good."
                            confirmLoading={loading.pinMessage}
                            description="Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?"
                            onConfirm={async () => {
                                setLoading((prev) => ({ ...prev, pinMessage: true }));
                                await data.functions.pinMessage();
                                remove(id);
                                setLoading((prev) => ({ ...prev, pinMessage: false }));
                            }}
                        >
                            <FixedMessage
                                message={data.message}
                                channel={data.channel}
                            />
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "DELETE_MESSAGE") {
            if (!data?.message || !data?.functions) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <div style={{ animation: close ? animation : "" }}>
                        <DialogContent
                            confirmColor="red"
                            confirmLabel="Delete"
                            heading="Delete Message"
                            confirmLoading={loading.deleteMessage}
                            description="Are you sure you want to delete this message?"
                            onConfirm={async () => {
                                setLoading((prev) => ({ ...prev, deleteMessage: true }));
                                await data.functions.deleteMessage();
                                setLoading((prev) => ({ ...prev, deleteMessage: false }));
                                remove(id);
                            }}
                        >
                            <FixedMessage message={data.message} />

                            <DialogProtip>
                                You can hold down shift when clicking{" "}
                                <strong>delete message</strong> to bypass this confirmation
                                entirely.
                            </DialogProtip>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "RECORD_VOICE_MESSAGE") {
            if (!data?.setVoiceMessage) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <RecordVoiceMessage setVoiceMessage={data.setVoiceMessage} />
                </Dialog>
            );
        }

        if (type === "OWNER_CHANGE") {
            if (!data?.user) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent
                        confirmColor="red"
                        heading="Transfer Group Ownership"
                        confirmLoading={changeOwner.isLoading}
                        onConfirm={() =>
                            changeOwner.send(
                                { channelId: data.channelId, recipientId: data.user.id },
                                { onComplete: () => remove(id) }
                            )
                        }
                    >
                        <div className={styles.ownerChange}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 80 16"
                                height="16"
                                width="80"
                            >
                                <g
                                    fill="none"
                                    opacity="0.6"
                                    fillRule="evenodd"
                                >
                                    <path d="m0 0h80v16h-80z" />

                                    <g stroke="var(--fg-3)">
                                        <path d="m71 1h4v4.16" />
                                        <path
                                            d="m2 1h4v4.16"
                                            transform="matrix(-1 0 0 1 8 0)"
                                        />
                                        <path d="m51 1h4m6 0h4m-24 0h4m-14 0h4m-14 0h4m-23 11v-2m9-9h4" />
                                        <path d="m72.13 10.474 2.869 3.12 2.631-3.12" />
                                    </g>
                                </g>
                            </svg>

                            <div className={styles.ownerAvatars}>
                                <div>
                                    <Avatar
                                        size={80}
                                        type="user"
                                        alt={appUser.username}
                                        fileId={appUser.avatar}
                                        generateId={appUser.id}
                                    />
                                </div>

                                <div>
                                    <Avatar
                                        size={80}
                                        type="user"
                                        alt={data.user.username}
                                        fileId={data.user.avatar}
                                        generateId={data.user.id}
                                    />
                                </div>
                            </div>

                            <div>
                                Transfer ownership of this group to{" "}
                                <strong>{data.user.username}</strong>?
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "LEAVE_GROUP") {
            if (!data?.channelId || !data?.channelName) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <LeaveGroup
                        channelId={data.channelId}
                        channelName={data.channelName}
                    />
                </Dialog>
            );
        }

        if (type === "CHANNEL_EXISTS") {
            if (!data?.channel || !data?.recipients) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <DialogContent
                        heading="Confirm New Group"
                        confirmLabel="Create New Group"
                        confirmLoading={createChannel.isLoading || addChannelRecipients.isLoading}
                        onConfirm={() => {
                            if (data?.isAdd) {
                                addChannelRecipients.send(
                                    {
                                        channelId: data.channel.id,
                                        recipients: data.recipients,
                                        skipWarning: true,
                                    },
                                    { onComplete: () => remove(id) }
                                );
                            } else {
                                createChannel.send(
                                    { recipients: data.recipients, skipWarning: true },
                                    { onComplete: () => remove(id) }
                                );
                            }
                        }}
                        description="You already have a group with these people! Are you sure you want to create a new one?"
                    >
                        <div
                            className={styles.channelItem}
                            onClick={() => {
                                remove(id);
                                router.push(`/channels/me/${data.channel.id}`);
                            }}
                        >
                            <Avatar
                                size={24}
                                type="channel"
                                alt={data.channel.name}
                                fileId={data.channel.icon}
                                generateId={data.channel.id}
                            />

                            <span>{data.channel.name}</span>
                            <span>{getRelativeDate(data.channel.updatedAt)}</span>
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }

        if (type === "CHANNEL_ICON_CHANGE") {
            if (!data?.channelId || !data?.file) return null;

            return (
                <Dialog
                    key={type}
                    open={i === open.length - 1 && !close}
                    onOpenChange={(v) => !v && remove(id)}
                >
                    <ImageUpload
                        file={data.file}
                        remove={() => remove(id)}
                        channelId={data.channelId}
                    />
                </Dialog>
            );
        }

        return (
            <Dialog
                key={type}
                open={i === open.length - 1 && !close}
                onOpenChange={(v) => !v && remove(id)}
            >
                <div style={{ animation: close ? animation : "" }}>
                    {type === "DRAG_FILE" && (
                        <DialogContent blank>
                            <div
                                className={styles.warning}
                                style={{ backgroundColor: "var(--accent-0)" }}
                            >
                                <div>
                                    <div className={styles.icons}>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                    </div>

                                    <div className={styles.title}>
                                        {`Upload to ${
                                            data?.channel?.type === 0
                                                ? "@"
                                                : data?.channel?.type === 2
                                                ? "#"
                                                : ""
                                        }${data?.channel.name}`}
                                    </div>

                                    <div className={styles.description}>
                                        You can add comments before uploading.
                                        <br />
                                        Hold shift to upload directly.
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    )}

                    {type === "FILE_NUMBER" && (
                        <DialogContent blank>
                            <div className={styles.warning}>
                                <div>
                                    <div className={styles.icons}>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                    </div>

                                    <div className={styles.title}>Too many uploads!</div>

                                    <div className={styles.description}>
                                        You can only upload 10 files at a time!
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    )}

                    {type === "UPLOAD_FAILED" && (
                        <DialogContent blank>
                            <div className={styles.warning}>
                                <div>
                                    <div className={styles.icons}>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                        <div>
                                            <div />
                                        </div>
                                    </div>

                                    <div className={styles.title}>Upload Failed</div>

                                    <div className={styles.description}>
                                        Something went wrong, try again later.
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    )}

                    {warning && (
                        <DialogContent
                            centered
                            art={warning.art}
                            heading={warning.title}
                            hideCancel={warning.hideCancel}
                            boldHeading={warning.boldHeading}
                            description={warning.description}
                            confirmLabel={warning.confirmLabel}
                            onCancel={() => remove(id)}
                            onConfirm={() => remove(id)}
                        />
                    )}
                </div>
            </Dialog>
        );
    });
}

function TimeoutUser({
    user,
    guild,
    remove,
}: {
    user: KnownUser;
    guild: UserGuild;
    remove: () => void;
}) {
    const [duration, setDuration] = useState(60);
    const [reason, setReason] = useState("");
    const { timeoutMember } = useRequests();

    const durations = [
        {
            label: "60 Secs",
            value: 60,
        },
        {
            label: "5 Mins",
            value: 300,
        },
        {
            label: "10 Mins",
            value: 600,
        },
        {
            label: "1 Hour",
            value: 3600,
        },
        {
            label: "1 Day",
            value: 86400,
        },
        {
            label: "1 Week",
            value: 604800,
        },
    ];

    return (
        <DialogContent
            confirmColor="red"
            confirmLabel="Timeout"
            heading={`Timeout ${user.displayName}`}
            confirmLoading={timeoutMember.isLoading}
            description={`Members who are in timeout are temporarily not allowed to chat or react in text channels. They are also not allowed to connect to voice or Stage channels.`}
            onConfirm={() => {
                timeoutMember.send(
                    { guildId: guild.id, memberId: user.id, reason, timeout: duration },
                    { onComplete: () => remove() }
                );
            }}
        >
            <Input
                type="select"
                label="Duration"
                value={duration}
                choices={durations}
                onChange={(v) => setDuration(v)}
            />

            <Input
                label="Reason"
                value={reason}
                type="textarea"
                maxLength={512}
                onChange={(v) => setReason(v)}
                placeholder="Enter a reason. This will only be visible in the Audit Log and will not be shown to the member."
            />
        </DialogContent>
    );
}

function KickUser({
    user,
    guild,
    remove,
}: {
    user: KnownUser;
    guild: UserGuild;
    remove: () => void;
}) {
    const [reason, setReason] = useState("");
    const { kickMember } = useRequests();

    return (
        <DialogContent
            confirmColor="red"
            confirmLabel="Kick"
            confirmLoading={kickMember.isLoading}
            heading={`Kick ${user.displayName} from ${guild.name}?`}
            onConfirm={() => {
                kickMember.send(
                    { guildId: guild.id, memberId: user.id, reason },
                    { onComplete: () => remove() }
                );
            }}
        >
            <p>
                Are you sure you want to kick <strong>{user.displayName}</strong> from the server?
                They will be able to rejoin again with a new invite.
            </p>

            <Input
                autoFocus
                value={reason}
                type="textarea"
                maxLength={512}
                label="Reason For Kick"
                onChange={(v) => setReason(v)}
            />
        </DialogContent>
    );
}

function BanUser({
    user,
    guild,
    remove,
}: {
    user: KnownUser;
    guild: UserGuild;
    remove: () => void;
}) {
    const [removeMessages, setRemoveMessages] = useState(1);
    const [reason, setReason] = useState("");
    const { banMember } = useRequests();

    const removeMessagesChoices = [
        {
            label: "Don't Delete Any",
            value: null,
        },
        {
            label: "Previous Hour",
            value: 1,
        },
        {
            label: "Previous 6 Hours",
            value: 6,
        },
        {
            label: "Previous 12 Hours",
            value: 12,
        },
        {
            label: "Previous 24 Hours",
            value: 24,
        },
        {
            label: "Previous 3 Days",
            value: 72,
        },
        {
            label: "Previous 7 Days",
            value: 168,
        },
    ];

    return (
        <DialogContent
            confirmLabel="Ban"
            confirmColor="red"
            confirmLoading={banMember.isLoading}
            heading={`Ban @${user.displayName}?`}
            onConfirm={() => {
                banMember.send(
                    { guildId: guild.id, memberId: user.id, reason, removeMessages },
                    { onComplete: () => remove() }
                );
            }}
        >
            <Input
                autoFocus
                value={reason}
                type="textarea"
                maxLength={512}
                label="Reason For Ban"
                onChange={(v) => setReason(v)}
            />

            <Input
                type="select"
                value={removeMessages}
                label="Delete Message History"
                choices={removeMessagesChoices}
                onChange={(v) => setRemoveMessages(v)}
            />
        </DialogContent>
    );
}
