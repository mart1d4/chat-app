"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { Icon, Avatar, usePopoverContext } from "@components";
import type { DMChannelWithRecipients, User } from "@/type";
import { lowercaseContains } from "@/lib/strings";
import { useRequests } from "@/hooks/useRequests";
import { useData, useSettings } from "@/store";
import { useRouter } from "next/navigation";
import styles from "./CreateDM.module.css";
import { useMemo, useState } from "react";

export function CreateDM({ channel }: { channel?: DMChannelWithRecipients }) {
    const { createChannel, addChannelRecipients, createInvite } = useRequests();
    const { setOpen } = usePopoverContext();
    const { setSettings } = useSettings();
    const user = useAuthenticatedUser();
    const { friends } = useData();
    const router = useRouter();

    const list = channel
        ? friends.filter((f) => !channel.recipients.find((r) => r.id === f.id))
        : friends;

    const [chosen, setChosen] = useState<User[]>([]);
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");

    const placesLeft = (channel ? 10 - channel.recipients.length : 9) - chosen.length;

    const filteredList = useMemo(() => {
        if (search) {
            return list.filter((u) => lowercaseContains(u.username, search));
        }
        return list;
    }, [list, search]);

    function handleSubmit() {
        const recipients = chosen.map((r) => r.id);

        if (channel?.type === 1) {
            addChannelRecipients.send(
                { channelId: channel.id, recipients },
                { onComplete: () => setOpen(false) }
            );
        } else {
            if (channel?.type === 0) {
                const friend = channel.recipients.find((r) => r.id !== user.id);
                if (friend) recipients.push(friend.id);
            }

            createChannel.send({ recipients }, { onComplete: () => setOpen(false) });
        }
    }

    function getInvite() {
        if (!channel) return;

        createInvite.send(
            {
                channelId: channel.id,
                body: {
                    maxUses: 100,
                    maxAge: 86400,
                    temporary: false,
                },
            },
            { onComplete: (data) => setInviteLink(data.invite.code) }
        );
    }

    function copyLink() {
        navigator.clipboard.writeText(`${window.location.origin}/${inviteLink}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    }

    return (
        <div
            data-full-on-mobile
            className={styles.popup}
        >
            <div className={styles.header}>
                <h1>Select Friends</h1>
                {friends.length > 0 && (
                    <>
                        <div>
                            {placesLeft > 0
                                ? `You can add ${placesLeft} more friend${
                                      placesLeft > 1 ? "s" : ""
                                  }.`
                                : "This group has a 10 member limit."}
                        </div>

                        <div className={styles.input}>
                            <div>
                                <div>
                                    {filteredList.map((friend) => (
                                        <button
                                            key={friend.id}
                                            className={styles.friendChip}
                                            onClick={() => {
                                                setChosen(
                                                    chosen?.filter((user) => user.id !== friend.id)
                                                );
                                            }}
                                            style={{
                                                display: chosen.includes(friend) ? "flex" : "none",
                                            }}
                                        >
                                            {friend.username}
                                            <Icon
                                                name="close"
                                                size={12}
                                            />
                                        </button>
                                    ))}

                                    <input
                                        type="text"
                                        value={search}
                                        role="combobox"
                                        spellCheck="false"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        aria-autocomplete="list"
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !search) {
                                                setChosen(chosen?.slice(0, -1));
                                            }
                                        }}
                                        placeholder={
                                            chosen?.length
                                                ? "Find or start a conversation"
                                                : "Type the username of a friend"
                                        }
                                    />

                                    <div></div>
                                </div>
                            </div>

                            {channel?.type === 1 && (
                                <div className={styles.addButton}>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!chosen.length || addChannelRecipients.isLoading}
                                        className={`button blue ${
                                            !chosen.length || addChannelRecipients.isLoading
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <button
                    className={styles.closeButton}
                    onClick={() => setOpen(false)}
                >
                    <Icon name="close" />
                </button>
            </div>

            {friends.length > 0 && filteredList.length > 0 && (
                <>
                    <div className={styles.scroller + " scrollbar"}>
                        {filteredList.map((friend) => (
                            <div
                                tabIndex={0}
                                key={friend.id}
                                className={styles.friend}
                                onClick={() => {
                                    if (chosen.includes(friend)) {
                                        setChosen(chosen?.filter((user) => user.id !== friend.id));
                                    } else {
                                        if (placesLeft > 0) {
                                            setChosen([...chosen, friend]);
                                            setSearch("");
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (chosen.includes(friend)) {
                                            setChosen(
                                                chosen?.filter((user) => user.id !== friend.id)
                                            );
                                        } else {
                                            if (placesLeft > 0) {
                                                setChosen([...chosen, friend]);
                                                setSearch("");
                                            }
                                        }
                                    }
                                }}
                            >
                                <div>
                                    <div className={styles.friendAvatar}>
                                        <Avatar
                                            size={32}
                                            type="user"
                                            alt={friend.username}
                                            status={friend.status}
                                            fileId={friend.avatar}
                                            generateId={friend.id}
                                        />
                                    </div>

                                    <div className={styles.username}>
                                        <div>{friend.displayName}</div>
                                        <div>{friend.username}</div>
                                    </div>

                                    <div className={styles.friendCheck}>
                                        <div
                                            style={{
                                                borderColor: chosen.includes(friend)
                                                    ? "var(--accent-3)"
                                                    : "var(--fg-5)",
                                            }}
                                        >
                                            {chosen.includes(friend) && (
                                                <Icon
                                                    size={16}
                                                    name="checkmark"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.separator} />

                    {channel?.type === 1 ? (
                        <div className={styles.footer}>
                            <h1>Or, send an invite link to a friend!</h1>

                            <div style={{ marginTop: "0px" }}>
                                <div>
                                    <input
                                        readOnly
                                        type="text"
                                        placeholder={`${window.location.origin}/example`}
                                        value={
                                            inviteLink && `${window.location.origin}/${inviteLink}`
                                        }
                                        onClick={(e) => {
                                            if (!inviteLink) getInvite();
                                            e.currentTarget.select();
                                        }}
                                    />
                                </div>

                                <button
                                    className={copied ? "button green" : "button blue"}
                                    onClick={() => {
                                        if (!inviteLink) getInvite();
                                        else copyLink();
                                    }}
                                >
                                    {!inviteLink ? "Create" : copied ? "Copied" : "Copy"}
                                </button>
                            </div>

                            {inviteLink && <div>Your invite link expires in 24 hours.</div>}
                        </div>
                    ) : (
                        <div className={styles.footer}>
                            <button
                                onClick={handleSubmit}
                                className={
                                    "button blue " +
                                    ((channel && !chosen.length) ||
                                    createChannel.isLoading ||
                                    addChannelRecipients.isLoading
                                        ? "disabled"
                                        : "")
                                }
                                disabled={
                                    (channel && !chosen.length) ||
                                    createChannel.isLoading ||
                                    addChannelRecipients.isLoading
                                }
                            >
                                Create DM
                            </button>
                        </div>
                    )}
                </>
            )}

            {friends.length > 0 && filteredList.length === 0 && (
                <>
                    <div
                        className={styles.noFriends}
                        style={{
                            padding: "0 20px",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                backgroundImage: `url(/assets/system/nothing-found.svg)`,
                                width: "85px",
                                height: "85px",
                            }}
                        />

                        <div>
                            {channel
                                ? "No friends found that are not already in this DM."
                                : "No friends found."}
                        </div>
                    </div>

                    <div className={styles.separator} />

                    {channel?.type === 1 ? (
                        <div className={styles.footer}>
                            <h1>Or, send an invite link to a friend!</h1>

                            <div style={{ marginTop: "0px" }}>
                                <div>
                                    <input
                                        readOnly
                                        type="text"
                                        placeholder={`${window.location.origin}/example`}
                                        value={
                                            inviteLink && `${window.location.origin}/${inviteLink}`
                                        }
                                        onClick={(e) => {
                                            if (!inviteLink) getInvite();
                                            e.currentTarget.select();
                                        }}
                                    />
                                </div>

                                <button
                                    className={copied ? "button green" : "button blue"}
                                    onClick={() => {
                                        if (!inviteLink) getInvite();
                                        else copyLink();
                                    }}
                                >
                                    {!inviteLink ? "Create" : copied ? "Copied" : "Copy"}
                                </button>
                            </div>

                            {inviteLink && <div>Your invite link expires in 24 hours.</div>}
                        </div>
                    ) : (
                        <div className={styles.footer}>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    (channel && !chosen.length) ||
                                    createChannel.isLoading ||
                                    addChannelRecipients.isLoading
                                }
                                className={`button blue ${
                                    (channel && !chosen.length) || createChannel.isLoading
                                        ? "disabled"
                                        : ""
                                }`}
                            >
                                Create DM
                            </button>
                        </div>
                    )}
                </>
            )}

            {friends.length === 0 && (
                <div className={styles.noFriends}>
                    <div
                        style={{
                            backgroundImage: `url(/assets/system/no-friends-popout.svg)`,
                        }}
                    />

                    <div>You don't have any friends to add!</div>

                    <button
                        className="button green"
                        onClick={() => {
                            setOpen(false);
                            setSettings("friendTab", "add");
                            router.push("/channels/me");
                        }}
                    >
                        Add Friend
                    </button>
                </div>
            )}
        </div>
    );
}
