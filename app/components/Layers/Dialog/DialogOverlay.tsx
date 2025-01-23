"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import useRequestHelper from "@/hooks/useFetchHelper";
import type { KnownUser, UnknownUser } from "@/type";
import { useData, useTriggerDialog } from "@/store";
import { getRelativeDate } from "@/lib/time";
import { useRouter } from "next/navigation";
import styles from "./Dialog.module.css";
import { useState } from "react";
import {
    RecordVoiceMessage,
    DialogContent,
    DialogProtip,
    UpdateStatus,
    FixedMessage,
    UserProfile,
    Dialog,
    Avatar,
    LeaveGroup,
} from "@components";
import { ImageCropper } from "../../Images/Cropper";
import { ImageUpload } from "./ImageUpload/ImageUpload";

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
        description: "The max file size is 10MB.",
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
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [close, setClose] = useState(false);

    const { addUser, removeUser, friends, changeChannelOwner, addChannel } = useData();
    const { open, removeDialog } = useTriggerDialog();
    const { sendRequest } = useRequestHelper();
    const appUser = useAuthenticatedUser();
    const router = useRouter();

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

    async function removeFriend(user: KnownUser | UnknownUser, id: string) {
        if (loading.removeFriend) return;
        setLoading((prev) => ({ ...prev, removeFriend: true }));

        const friend = friends.find((friend) => friend.id === user.id);

        if (!friend) {
            setLoading((prev) => ({ ...prev, removeFriend: false }));
            return;
        }

        try {
            const { errors } = await sendRequest({
                query: "REMOVE_FRIEND",
                body: { username: friend.username },
            });

            if (!errors) {
                remove(id);
                removeUser(user.id, "friends");
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, removeFriend: false }));
    }

    async function blockUser(user: KnownUser | UnknownUser, id: string) {
        if (loading.blockUser) return;
        setLoading((prev) => ({ ...prev, blockUser: true }));

        try {
            const { errors } = await sendRequest({
                query: "BLOCK_USER",
                params: { userId: user.id },
            });

            if (!errors) {
                remove(id);
                addUser(user, "blocked");
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, blockUser: false }));
    }

    async function changeOwner(channelId: number, userId: number, id: string) {
        if (loading.ownerChange) return;
        setLoading((prev) => ({ ...prev, ownerChange: true }));

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_RECIPIENT_OWNER",
                params: {
                    channelId: channelId,
                    recipientId: userId,
                },
            });

            if (!errors) {
                remove(id);
                changeChannelOwner(channelId, userId);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, ownerChange: false }));
    }

    async function createChannel(recipients: number[], id: string) {
        if (loading.createChannel) return;
        setLoading((prev) => ({ ...prev, createChannel: true }));

        try {
            const { errors, data } = await sendRequest({
                query: "CHANNEL_CREATE",
                body: { recipients },
                skipChannelCheck: true,
            });

            if (!errors && data?.channel) {
                remove(id);
                addChannel(data.channel);
                router.push(`/channels/me/${data.channel.id}`);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, createChannel: false }));
    }

    const animation = `${styles.popOut} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both`;

    return open.map((obj, i) => {
        const { id, type, data } = obj;
        const warning = type in warnings ? warnings[type as keyof typeof warnings] : null;

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
                            confirmLoading={loading.blockUser}
                            heading={`Block ${data?.user.username}?`}
                            onConfirm={() => blockUser(data.user, id)}
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
                            confirmLoading={loading.removeFriend}
                            heading={`Remove '${data?.user.username}'`}
                            onConfirm={() => removeFriend(data.user, id)}
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
                            <FixedMessage message={data.message} />

                            <DialogProtip>
                                You can hold down shift when clicking <strong>unpin message</strong>{" "}
                                to bypass this confirmation entirely.
                            </DialogProtip>
                        </DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (type === "PIN_MESSAGE") {
            if (!data?.message || !data?.functions) return null;

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
                            <FixedMessage message={data.message} />
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
                                remove(id);
                                setLoading((prev) => ({ ...prev, deleteMessage: false }));
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
                        confirmLoading={loading.ownerChange}
                        onConfirm={() => changeOwner(data.channelId, data.user.id, id)}
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

                                    <g stroke="var(--foreground-3)">
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
                        confirmLoading={loading.createChannel}
                        onConfirm={() => createChannel(data.recipients, id)}
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
                                style={{ backgroundColor: "var(--accent-1)" }}
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
