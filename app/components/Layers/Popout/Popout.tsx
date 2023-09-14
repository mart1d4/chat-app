"use client";

import { FixedMessage, Icon, Avatar } from "@components";
import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import pusher from "@/lib/pusher/client-connection";
import { useData, useLayers } from "@/lib/store";
import { useRouter } from "next/navigation";
import styles from "./Popout.module.css";

type TMessageData = {
    channelId: TChannel["id"];
    message: TMessage;
};

export const Popout = ({ content }: any) => {
    const [filteredList, setFilteredList] = useState<TCleanUser[]>([]);
    const [search, setSearch] = useState<string>("");
    const [chosen, setChosen] = useState<TCleanUser[]>([]);
    const [copied, setCopied] = useState<boolean>(false);
    const [placesLeft, setPlacesLeft] = useState<number>(9);
    const [pinned, setPinned] = useState<TMessage[]>([]);
    const [inviteLink, setInviteLink] = useState<string>("");

    const user = useData((state) => state.user) as TCleanUser;
    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const layers = useLayers((state) => state.layers);
    const friends = useData((state) => state.friends);
    const token = useData((state) => state.token);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const getLink = async () => {
        const response = await fetch(`/api/channels/${content.channel.id}/invites`, {
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
        });

        const data = await response.json();
        if (!data.success) return;
        else setInviteLink(data.invite.code);
    };

    useEffect(() => {
        if (!user || content.type !== "PINNED_MESSAGES") return;

        pusher.bind("message-edited", (data: TMessageData) => {
            if (data.channelId === content.channel.id) {
                if (pinned.map((m) => m.id).includes(data.message.id)) {
                    if (!data.message.pinned) {
                        setPinned(pinned.filter((m) => m.id !== data.message.id));
                    } else {
                        setPinned(
                            pinned.map((m) => {
                                if (m.id === data.message.id) return data.message;
                                else return m;
                            })
                        );
                    }
                } else {
                    if (data.message.pinned) {
                        setPinned([...pinned, data.message]);
                    }
                }
            }
        });

        return () => {
            pusher.unbind("message-edited");
        };
    }, [user, pinned]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (layers.POPUP.length > 2 || layers.MENU) {
                    return;
                }
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [layers]);

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
                const filtered = friends.filter((friend) => !content.channel.recipientIds.includes(friend.id));
                setFilteredList(filtered);
                setPlacesLeft(10 - content.channel.recipientIds.length);
            } else {
                setFilteredList(friends);
                setPlacesLeft(9);
            }
        }
    }, [content]);

    useEffect(() => {
        if (content.type === "PINNED_MESSAGES") return;

        if (content.channel) {
            if (chosen?.length === 0) setPlacesLeft(10 - content.channel.recipientIds.length);
            else setPlacesLeft(10 - content.channel.recipientIds.length - chosen.length);
        } else {
            if (chosen.length === 0) setPlacesLeft(9);
            else setPlacesLeft(9 - chosen.length);
        }
    }, [chosen]);

    useEffect(() => {
        if (content.pinned) return;

        if (content.channel) {
            const filtered = friends.filter((friend: any) => !content.channel.recipientIds?.includes(friend.id));

            if (search)
                setFilteredList(filtered.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())));
            else setFilteredList(filtered);
        } else {
            if (search)
                setFilteredList(friends.filter((user) => user.username.toLowerCase().includes(search.toLowerCase())));
            else setFilteredList(friends);
        }
    }, [search, friends]);

    const createChan = async () => {
        const recipients = chosen.map((user) => user.id);

        if (content.channel) {
            if (content.channel.type === 0) {
                const currentRecipient = content.channel.recipientIds.find(
                    (recipient: string) => recipient !== user.id
                );

                sendRequest({
                    query: "CHANNEL_CREATE",
                    data: {
                        recipients: [currentRecipient, ...recipients],
                    },
                });
            } else if (content.channel.type === 1) {
                const channelExists = (recipients: string[]) => {
                    const channel = channels.find((channel) => {
                        return (
                            channel.recipients.length === recipients.length &&
                            channel.recipientIds.every((recipient: string) => recipients.includes(recipient))
                        );
                    });

                    return channel;
                };

                const addUsers = () => {
                    recipients.forEach((recipient) => {
                        sendRequest({
                            query: "CHANNEL_RECIPIENT_ADD",
                            params: {
                                channelId: content?.channel.id,
                                recipientId: recipient,
                            },
                        });
                    });
                };

                const channel = channelExists([...content.channel.recipientIds, ...recipients]);

                if (channel) {
                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "CHANNEL_EXISTS",
                            channel: channel,
                            addUsers: addUsers,
                        },
                    });
                } else {
                    addUsers();
                }
            }
        } else {
            sendRequest({
                query: "CHANNEL_CREATE",
                data: {
                    recipients: recipients,
                },
            });
        }
    };

    if (content.type === "PINNED_MESSAGES") {
        return (
            <div
                className={styles.pinContainer}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div>
                    <h1>Pinned Messages</h1>
                </div>

                <div className="scrollbar">
                    {!pinned || pinned.length === 0 ? (
                        <div className={styles.noPinnedContent}>
                            <div />

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
                                {content.channel.type === 1 && "Any group member can pin a message from its cog menu."}
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
                className={styles.popup}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className={styles.header}>
                    <h1>Select Friends</h1>
                    {friends.length > 0 && (
                        <>
                            <div>
                                {placesLeft > 0
                                    ? `You can add ${placesLeft} more friend${placesLeft > 1 ? "s" : ""}.`
                                    : "This group has a 10 member limit."}
                            </div>

                            <div className={styles.input}>
                                <div>
                                    <div>
                                        {chosen?.map((friend) => (
                                            <div
                                                key={friend.username}
                                                className={styles.friendChip}
                                                onClick={() => {
                                                    setChosen(chosen?.filter((user) => user.id !== friend.id));
                                                }}
                                            >
                                                {friend.username}
                                                <Icon
                                                    name="close"
                                                    size={12}
                                                />
                                            </div>
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
                                            className={chosen?.length ? "blue" : "blue disabled"}
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

                                        <div className={styles.friendUsername}>{friend.username}</div>

                                        <div className={styles.friendCheck}>
                                            <div>
                                                {chosen?.includes(friend) && (
                                                    <Icon
                                                        name="accept"
                                                        size={16}
                                                        fill="var(--accent-1)"
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

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            placeholder="https://chat-app.mart1d4.dev/example"
                                            value={inviteLink && `https://chat-app.mart1d4.dev/${inviteLink}`}
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
                                                }

                                                inputLinkRef.current?.select();
                                            }}
                                        />
                                    </div>

                                    <button
                                        className={copied ? "green" : "blue"}
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
                                    className={"blue " + (content.channel && !chosen.length ? "disabled" : "")}
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

                            <div>No friends found that are not already in this DM.</div>
                        </div>

                        <div className={styles.separator} />

                        {content.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type="text"
                                            readOnly
                                            value={`https://chat-app.mart1d4.com/${content.channel.id}`}
                                            onClick={() => inputLinkRef.current?.select()}
                                        />
                                    </div>

                                    <button
                                        className={copied ? "green" : "blue"}
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `https://chat-app.mart1d4.com/${content.channel.id}`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }}
                                    >
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <div>Your invite link expires in 24 hours.</div>
                            </div>
                        ) : (
                            <div className={styles.footer}>
                                <button
                                    className="blue"
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
                        <div />

                        <div>You don't have any friends to add!</div>

                        <button
                            className="green"
                            onClick={() => {
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                        setNull: true,
                                    },
                                });
                                localStorage.setItem("friends-tab", "add");
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
};
