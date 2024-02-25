"use client";

import { useData, useLayers, useSettings } from "@/lib/store";
import { FixedMessage, Icon, Avatar } from "@components";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Popout.module.css";

export function Popout({ content, element }: any) {
    const [filteredList, setFilteredList] = useState([]);
    const [inviteLink, setInviteLink] = useState("");
    const [placesLeft, setPlacesLeft] = useState(9);
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");
    const [chosen, setChosen] = useState([]);
    const [pinned, setPinned] = useState([]);

    const setSettings = useSettings((state) => state.setSettings);
    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const friends = useData((state) => state.friends);
    const layers = useLayers((state) => state.layers);
    const token = useData((state) => state.token);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (layers.POPUP.length !== 1 || !containerRef.current) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [layers, containerRef]);

    useEffect(() => {
        if (content.type === "PINNED_MESSAGES") {
            const fetchPinned = async () => {
                const response = await sendRequest({
                    query: "CHANNEL_PINNED_MESSAGES",
                    params: {
                        channelId: content.channel.id,
                    },
                });

                setPinned(response.pinned);
            };

            fetchPinned();
        } else {
            if (content.channel) {
                console.log(friends);
                console.log(content.channel.recipients);

                const filtered = friends.filter(
                    (f) => !content.channel.recipients.map((r) => r.id).includes(parseInt(f.id))
                );
                setFilteredList(filtered);
                setPlacesLeft(10 - content.channel.recipients.length);
            } else {
                setFilteredList(friends);
                setPlacesLeft(9);
            }
        }
    }, [content]);

    useEffect(() => {
        if (content.pinned) return;

        if (content.channel) {
            if (chosen?.length === 0) setPlacesLeft(10 - content.channel.recipients.length);
            else setPlacesLeft(10 - content.channel.recipients.length - chosen.length);
        } else {
            if (chosen.length === 0) setPlacesLeft(9);
            else setPlacesLeft(9 - chosen.length);
        }
    }, [chosen]);

    useEffect(() => {
        if (content.pinned) return;

        if (content.channel) {
            const filtered = friends.filter(
                (f) => !content.channel.recipients.map((r) => r.id).includes(parseInt(f.id))
            );

            if (search)
                setFilteredList(
                    filtered.filter((user) =>
                        user.username.toLowerCase().includes(search.toLowerCase())
                    )
                );
            else setFilteredList(filtered);
        } else {
            if (search)
                setFilteredList(
                    friends.filter((user) =>
                        user.username.toLowerCase().includes(search.toLowerCase())
                    )
                );
            else setFilteredList(friends);
        }
    }, [search, friends]);

    function channelExists(recipients: string[]) {
        return channels.find(
            (channel) =>
                channel.recipients.length === recipients.length &&
                channel.recipients.every((r) => recipients.includes(r.id.toString()))
        );
    }

    async function createChan(skip?: boolean) {
        const recipients = chosen.map((user) => user.id);

        if (content.channel) {
            const channel = channelExists([
                ...content.channel.recipients.map((r) => r.id.toString()),
                ...recipients,
            ]);

            if (channel && !skip) {
                setLayers({
                    settings: {
                        type: "POPUP",
                    },
                    content: {
                        type: "CHANNEL_EXISTS",
                        channel: channel,
                        addUsers: createChan(true),
                    },
                });
                return;
            }

            if (content.channel.type === 0) {
                const currentRecipient = content.channel.recipients
                    .map((r) => r.id.toString())
                    .find((id) => id != user.id);

                sendRequest({
                    query: "CHANNEL_CREATE",
                    data: {
                        recipients: [currentRecipient, ...recipients],
                    },
                });
            } else if (content.channel.type === 1) {
                recipients.forEach((recipient) => {
                    sendRequest({
                        query: "CHANNEL_RECIPIENT_ADD",
                        params: {
                            channelId: content.channel.id,
                            recipientId: recipient,
                        },
                    });
                });
            }
        } else {
            sendRequest({
                query: "CHANNEL_CREATE",
                data: {
                    recipients: recipients,
                },
            });
        }
    }

    if (content.type === "PINNED_MESSAGES") {
        return (
            <div
                ref={containerRef}
                className={styles.pinContainer}
            >
                <div>
                    <h1>Pinned Messages</h1>

                    <button
                        className={styles.closeButton}
                        onClick={() =>
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                    setNull: true,
                                },
                            })
                        }
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

                <div className="scrollbar">
                    {!pinned || pinned.length === 0 ? (
                        <div className={styles.noPinnedContent}>
                            <div
                                style={{
                                    backgroundImage: `url("https://ucarecdn.com/c56ac798-38b6-481d-b920-2c4ee270f53d/")`,
                                }}
                            />

                            <div>
                                This direct message doesn't have <br />
                                any pinned messages... yet.
                            </div>
                        </div>
                    ) : (
                        pinned.map((message) => (
                            <div
                                key={message.id}
                                className={styles.messageContainer}
                            >
                                <FixedMessage
                                    message={message}
                                    pinned={true}
                                />
                            </div>
                        ))
                    )}
                </div>

                {(!pinned || pinned.length === 0) && (
                    <div className={styles.noPinnedBottom}>
                        <div>
                            <div>Protip:</div>

                            <div>
                                {content.channel.type === 0 &&
                                    `You and ${
                                        content.channel.recipients.find(
                                            (recipient: TCleanUser) => recipient.id !== user.id
                                        ).username
                                    } can pin a message from its cog menu.`}
                                {content.channel.type === 1 &&
                                    "Any group member can pin a message from its cog menu."}
                                {content.channel.type === 2 &&
                                    "Users with 'Manage Messages' can pin from the cog menu."}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div
                ref={containerRef}
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
                                                        chosen?.filter(
                                                            (user) => user.id !== friend.id
                                                        )
                                                    );
                                                }}
                                                style={{
                                                    display: chosen.includes(friend)
                                                        ? "flex"
                                                        : "none",
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

                                {content.channel?.type === 1 && (
                                    <div className={styles.addButton}>
                                        <button
                                            className={
                                                chosen?.length
                                                    ? "button blue"
                                                    : "button blue disabled"
                                            }
                                            onClick={() => {
                                                if (chosen?.length) {
                                                    createChan();
                                                    setLayers({
                                                        settings: {
                                                            type: "POPUP",
                                                            setNull: true,
                                                        },
                                                    });
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
                        onClick={() =>
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                    setNull: true,
                                },
                            })
                        }
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
                                            setChosen(
                                                chosen?.filter((user) => user.id !== friend.id)
                                            );
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
                                                src={friend.avatar}
                                                alt={friend.username}
                                                size={32}
                                                status={friend.status}
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

                        {content.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div style={{ marginTop: "0px" }}>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            placeholder="https://chat-app.mart1d4.dev/example"
                                            value={
                                                inviteLink &&
                                                `https://chat-app.mart1d4.dev/${inviteLink}`
                                            }
                                            onClick={async () => {
                                                const getLink = async () => {
                                                    const response = await sendRequest({
                                                        query: "CREATE_INVITE",
                                                        params: {
                                                            channelId: content.channel.id,
                                                        },
                                                        data: {
                                                            maxUses: 100,
                                                            maxAge: 86400,
                                                            temporary: false,
                                                            inviterId: user.id,
                                                        },
                                                    });

                                                    if (!response.success) return;
                                                    else setInviteLink(response.invite.code);
                                                };

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
                                                const response = await sendRequest({
                                                    query: "CREATE_INVITE",
                                                    params: {
                                                        channelId: content.channel.id,
                                                    },
                                                    data: {
                                                        maxUses: 100,
                                                        maxAge: 86400,
                                                        temporary: false,
                                                        inviterId: user.id,
                                                    },
                                                });

                                                if (!response.success) return;
                                                else setInviteLink(response.invite.code);
                                            };

                                            if (!inviteLink) {
                                                await getLink();
                                            } else {
                                                navigator.clipboard.writeText(
                                                    `https://chat-app.mart1d4.dev/${inviteLink}`
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
                                        "button blue " +
                                        (content.channel && !chosen.length ? "disabled" : "")
                                    }
                                    onClick={() => {
                                        if (content?.channel && !chosen.length) return;
                                        setLayers({
                                            settings: {
                                                type: "POPUP",
                                                setNull: true,
                                            },
                                        });
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
                                    backgroundImage: `url(https://ucarecdn.com/501ad905-28df-4c05-ae41-de0499966f4f/)`,
                                    width: "85px",
                                    height: "85px",
                                }}
                            />

                            <div>
                                {content.channel
                                    ? "No friends found that are not already in this DM."
                                    : "No friends found."}
                            </div>
                        </div>

                        <div className={styles.separator} />

                        {content.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div style={{ marginTop: "0px" }}>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            placeholder="https://chat-app.mart1d4.dev/example"
                                            value={
                                                inviteLink &&
                                                `https://chat-app.mart1d4.dev/${inviteLink}`
                                            }
                                            onClick={async () => {
                                                const getLink = async () => {
                                                    const response = await sendRequest({
                                                        query: "CREATE_INVITE",
                                                        params: {
                                                            channelId: content.channel.id,
                                                        },
                                                        data: {
                                                            maxUses: 100,
                                                            maxAge: 86400,
                                                            temporary: false,
                                                            inviterId: user.id,
                                                        },
                                                    });

                                                    if (!response.success) return;
                                                    else setInviteLink(response.invite.code);
                                                };

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
                                                const response = await fetch(
                                                    `/api/channels/${content.channel.id}/invites`,
                                                    {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                        body: JSON.stringify({
                                                            maxUses: 100,
                                                            maxAge: 86400,
                                                            temporary: false,
                                                            inviterId: user.id,
                                                        }),
                                                    }
                                                );

                                                const data = await response.json();
                                                if (!data.success) return;
                                                else setInviteLink(data.invite.code);
                                            };

                                            if (!inviteLink) {
                                                await getLink();
                                            } else {
                                                navigator.clipboard.writeText(
                                                    `https://chat-app.mart1d4.dev/${inviteLink}`
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
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                    setNull: true,
                                                },
                                            });
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
                                backgroundImage: `url("https://ucarecdn.com/01c48cd6-f083-4fe8-870c-328ceec1edbf/")`,
                            }}
                        />

                        <div>You don't have any friends to add!</div>

                        <button
                            className="button green"
                            onClick={() => {
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                        setNull: true,
                                    },
                                });
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
}
