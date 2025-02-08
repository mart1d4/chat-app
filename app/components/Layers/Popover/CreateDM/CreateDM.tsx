"use client";

import { Icon, Avatar, usePopoverContext } from "@components";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { lowercaseContains } from "@/lib/strings";
import { useData, useSettings } from "@/store";
import type { Channel, User } from "@/type";
import styles from "./CreateDM.module.css";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";

export function CreateDM({ channel }: { channel?: Channel }) {
    const [filteredList, setFilteredList] = useState<User[]>([]);
    const [chosen, setChosen] = useState<User[]>([]);
    const [inviteLink, setInviteLink] = useState("");
    const [placesLeft, setPlacesLeft] = useState(9);
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");

    const setSettings = useSettings((state) => state.setSettings);
    const { sendRequest } = useFetchHelper();
    const { setOpen } = usePopoverContext();
    const user = useAuthenticatedUser();
    const { friends } = useData();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (channel) {
            const filtered = friends.filter((f) => !channel.recipients.find((r) => r.id === f.id));
            setFilteredList(filtered);
            setPlacesLeft(10 - channel.recipients.length);
        } else {
            setFilteredList(friends);
            setPlacesLeft(9);
        }
    }, []);

    useEffect(() => {
        if (channel) {
            if (chosen?.length === 0) setPlacesLeft(10 - channel.recipients.length);
            else setPlacesLeft(10 - channel.recipients.length - chosen.length);
        } else {
            if (chosen.length === 0) setPlacesLeft(9);
            else setPlacesLeft(9 - chosen.length);
        }
    }, [chosen]);

    useEffect(() => {
        if (channel) {
            const filtered = friends.filter((f) => !channel.recipients.find((r) => r.id === f.id));

            if (search)
                setFilteredList(
                    filtered.filter((user) => lowercaseContains(user.username, search))
                );
            else setFilteredList(filtered);
        } else {
            if (search) {
                setFilteredList(friends.filter((user) => lowercaseContains(user.username, search)));
            } else {
                setFilteredList(friends);
            }
        }
    }, [search, friends]);

    async function createChan() {
        const recipients = chosen.map((user) => user.id);

        if (channel) {
            if (channel.type === 0) {
                const friend = channel.recipients.find((r) => r.id !== user?.id);
                if (!friend) return;

                const { data } = await sendRequest({
                    query: "CHANNEL_CREATE",
                    body: { recipients: [friend.id, ...recipients] },
                });
            } else if (channel.type === 1) {
                recipients.forEach((recipient) => {
                    sendRequest({
                        query: "CHANNEL_RECIPIENT_ADD",
                        params: {
                            channelId: channel.id,
                            recipientId: recipient,
                        },
                    });
                });
            }
        } else {
            const { data } = await sendRequest({
                query: "CHANNEL_CREATE",
                body: { recipients: recipients },
            });
        }
    }

    return (
        <div
            ref={containerRef}
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
                                        ref={inputRef}
                                        type="text"
                                        placeholder={
                                            chosen?.length
                                                ? "Find or start a conversation"
                                                : "Type the username of a friend"
                                        }
                                        value={search || ""}
                                        spellCheck="false"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !search) {
                                                setChosen(chosen?.slice(0, -1));
                                            }
                                        }}
                                    />

                                    <div></div>
                                </div>
                            </div>

                            {channel?.type === 1 && (
                                <div className={styles.addButton}>
                                    <button
                                        className={
                                            chosen?.length ? "button blue" : "button blue disabled"
                                        }
                                        onClick={() => {
                                            if (chosen?.length) {
                                                setOpen(false);
                                                createChan();
                                            }
                                        }}
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
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        role="image"
                    >
                        <path
                            fill="currentColor"
                            d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                        />
                    </svg>
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
                                                    ? "hsl(235, 86.1%, 77.5%)"
                                                    : "var(--foreground-5)",
                                            }}
                                        >
                                            {chosen.includes(friend) && (
                                                <Icon
                                                    name="checkmark"
                                                    size={16}
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
                                        ref={inputLinkRef}
                                        type="text"
                                        readOnly
                                        placeholder="https://spark.mart1d4.dev/example"
                                        value={
                                            inviteLink && `https://spark.mart1d4.dev/${inviteLink}`
                                        }
                                        onClick={async () => {
                                            if (!inviteLink) {
                                                const { data, errors } = await sendRequest({
                                                    query: "CREATE_INVITE",
                                                    params: {
                                                        channelId: channel.id,
                                                    },
                                                    body: {
                                                        maxUses: 100,
                                                        maxAge: 86400,
                                                        temporary: false,
                                                    },
                                                });

                                                if (data?.invite) {
                                                    setInviteLink(data.invite.code);
                                                } else if (errors) {
                                                    console.error(errors);
                                                }
                                            }

                                            inputLinkRef.current?.select();
                                        }}
                                    />
                                </div>

                                <button
                                    className={copied ? "button green" : "button blue"}
                                    onClick={async () => {
                                        async function getLink() {
                                            const { data, errors } = await sendRequest({
                                                query: "CREATE_INVITE",
                                                params: {
                                                    channelId: channel.id,
                                                },
                                                body: {
                                                    maxUses: 100,
                                                    maxAge: 86400,
                                                    temporary: false,
                                                },
                                            });

                                            if (data?.invite) {
                                                setInviteLink(data.invite.code);
                                            } else if (errors) {
                                                console.error(errors);
                                            }
                                        }

                                        if (!inviteLink) {
                                            await getLink();
                                        } else {
                                            navigator.clipboard.writeText(
                                                `https://spark.mart1d4.dev/${inviteLink}`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }
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
                                className={
                                    "button blue " + (channel && !chosen.length ? "disabled" : "")
                                }
                                onClick={() => {
                                    if (channel && !chosen.length) return;
                                    setOpen(false);
                                    createChan();
                                }}
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
                                        ref={inputLinkRef}
                                        type="text"
                                        readOnly
                                        placeholder="https://spark.mart1d4.dev/example"
                                        value={
                                            inviteLink && `https://spark.mart1d4.dev/${inviteLink}`
                                        }
                                        onClick={async () => {
                                            async function getLink() {
                                                const { data, errors } = await sendRequest({
                                                    query: "CREATE_INVITE",
                                                    params: {
                                                        channelId: channel.id,
                                                    },
                                                    body: {
                                                        maxUses: 100,
                                                        maxAge: 86400,
                                                        temporary: false,
                                                    },
                                                });

                                                if (data?.invite) {
                                                    setInviteLink(data.invite.code);
                                                } else if (errors) {
                                                    console.error(errors);
                                                }
                                            }

                                            if (!inviteLink) {
                                                await getLink();
                                            }

                                            inputLinkRef.current?.select();
                                        }}
                                    />
                                </div>

                                <button
                                    className={copied ? "button green" : "button blue"}
                                    onClick={async () => {
                                        const getLink = async () => {
                                            const { data, errors } = await sendRequest({
                                                query: "CREATE_INVITE",
                                                params: {
                                                    channelId: channel.id,
                                                },
                                                body: {
                                                    maxUses: 100,
                                                    maxAge: 86400,
                                                    temporary: false,
                                                },
                                            });

                                            if (data?.invite) {
                                                setInviteLink(data.invite.code);
                                            } else if (errors) {
                                                console.error(errors);
                                            }
                                        };

                                        if (!inviteLink) {
                                            await getLink();
                                        } else {
                                            navigator.clipboard.writeText(
                                                `https://spark.mart1d4.dev/${inviteLink}`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }
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
                                className="button blue"
                                onClick={() => {
                                    if (chosen.length) {
                                        setOpen(false);
                                        createChan();
                                    }
                                }}
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
                            if (pathname !== "/channels/me") {
                                router.push("/channels/me");
                            }
                        }}
                    >
                        Add Friend
                    </button>
                </div>
            )}
        </div>
    );
}
