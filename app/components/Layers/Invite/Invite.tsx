"use client";

import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useData, useLayers } from "@/lib/store";
import styles from "./Invite.module.css";
import { Avatar } from "@components";

type TContent = {
    guild: TGuild;
    channel?: TChannel;
};

export const Invite = ({ content }: { content: TContent }) => {
    const [filteredList, setFilteredList] = useState<TChannel[]>([]);
    const [search, setSearch] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);
    const [inviteLink, setInviteLink] = useState<string>("");

    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const token = useData((state) => state.token);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === "Escape") {
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
    }, []);

    useEffect(() => {
        setFilteredList(channels);
    }, []);

    useEffect(() => {
        if (search) setFilteredList(channels.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase())));
        else setFilteredList(channels);
    }, [search, channels]);

    useEffect(() => {
        const getLink = async () => {
            const response = await fetch(`/api/guilds/${content.guild.id}/invites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    channelId: content.channel?.id,
                    maxUses: 100,
                    maxAge: 86400,
                    temporary: false,
                    inviterId: user?.id as string,
                }),
            });

            const data = await response.json();
            if (!data.success) return;
            else {
                setInviteLink(data.invite.code);
            }
        };

        getLink();
    }, []);

    return (
        <div className={styles.popup} onContextMenu={(e) => e.preventDefault()}>
            <div className={styles.header}>
                <h1>Select Friends</h1>
                {channels.length > 0 && (
                    <>
                        <div>Invite someone</div>

                        <div className={styles.input}>
                            <div>
                                <div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={"Search for friends"}
                                        value={search || ""}
                                        spellCheck="false"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        onChange={(e) => setSearch(e.target.value)}
                                    />

                                    <div></div>
                                </div>
                            </div>
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
                    <svg viewBox="0 0 24 24" width="24" height="24" role="image">
                        <path
                            fill="currentColor"
                            d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                        />
                    </svg>
                </button>
            </div>

            {channels.length > 0 && filteredList.length > 0 && (
                <>
                    <div className={styles.scroller + " scrollbar"}>
                        {filteredList.map((channel) => (
                            <div key={channel.id} className={styles.friend} onClick={() => {}}>
                                <div>
                                    <div className={styles.friendAvatar}>
                                        <Avatar src={channel.icon as string} alt={channel.name as string} size={32} />
                                    </div>

                                    <div className={styles.friendUsername}>{channel.name}</div>

                                    <button
                                        className={`button ${styles.inviteButton}`}
                                        onClick={async () => {
                                            try {
                                                const response = await sendRequest({
                                                    query: "SEND_MESSAGE",
                                                    params: {
                                                        channelId:
                                                            channel.id ||
                                                            (content.guild.channels.find((c) => c.type === 0)
                                                                ?.id as string),
                                                    },
                                                    data: {
                                                        message: {
                                                            content: `https://chat-app.mart1d4.dev/${inviteLink}`,
                                                            attachments: [],
                                                            messageReference: null,
                                                        },
                                                    },
                                                });
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }}
                                    >
                                        Invite
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.footer}>
                        <h1>Or, send a server invite link to a friend</h1>

                        <div>
                            <div>
                                <input
                                    ref={inputLinkRef}
                                    type="text"
                                    readOnly
                                    value={`https://chat-app.mart1d4.dev/${inviteLink}`}
                                    onClick={() => inputLinkRef.current?.select()}
                                />
                            </div>

                            <button
                                className={copied ? "green" : "blue"}
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://chat-app.mart1d4.dev/${inviteLink}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <div>
                            Your invite link expires in 24 hours.{" "}
                            <span className={styles.editLink}>Edit invite link.</span>
                        </div>
                    </div>
                </>
            )}

            {channels.length > 0 && filteredList.length === 0 && (
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

                        <div>No results found</div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.footer}>
                        <h1>Or, send an invite link to a friend!</h1>

                        <div>
                            <div>
                                <input
                                    ref={inputLinkRef}
                                    type="text"
                                    readOnly
                                    value={`https://chat-app.mart1d4.dev/${inviteLink}`}
                                    onClick={() => inputLinkRef.current?.select()}
                                />
                            </div>

                            <button
                                className={copied ? "green" : "blue"}
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://chat-app.mart1d4.dev/${inviteLink}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        <div>Your invite link expires in 24 hours.</div>
                    </div>
                </>
            )}

            {/* {friends.length === 0 && (
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
            )} */}
        </div>
    );
};
