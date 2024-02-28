"use client";

import { useEffect, useState, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useData, useLayers, useTooltip } from "@/lib/store";
import styles from "./Invite.module.css";
import { Avatar, Icon, LoadingDots } from "@components";

type TContent = {
    guild: TGuild;
    channel: TChannel;
};

export function InvitePopup({ content }: { content: TContent }) {
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState<string[]>([]);
    const [sentTo, setSentTo] = useState<string[]>([]);
    const [failed, setFailed] = useState<string[]>([]);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasRendered = useRef<boolean>(false);

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

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setFilteredList(channels);
    }, []);

    useEffect(() => {
        if (search)
            setFilteredList(
                channels.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
            );
        else setFilteredList(channels);
    }, [search, channels]);

    useEffect(() => {
        const getLink = async () => {
            try {
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

                if (!response.success) setError("You are being rate limited.");
                else setInviteLink(response.invite.code);
            } catch (error) {
                setError("Something went wrong. Please try again later.");
            }
        };

        const env = process.env.NODE_ENV;

        if (env == "development") {
            if (hasRendered.current) getLink();
            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            getLink();
        }
    }, []);

    async function invite(channelId: string) {
        if (loading.includes(channelId)) return;
        setLoading([...loading, channelId]);

        try {
            const response = await sendRequest({
                query: "SEND_MESSAGE",
                params: {
                    channelId: channelId,
                },
                data: {
                    message: {
                        content: `https://chat-app.mart1d4.dev/${inviteLink}`,
                        attachments: [],
                        messageReference: null,
                    },
                },
            });

            if (response.success) {
                setSentTo([...sentTo, channelId]);
                if (failed.includes(channelId)) {
                    setFailed(failed.filter((id) => id !== channelId));
                }
            } else {
                setFailed([...failed, channelId]);
            }
        } catch (error) {
            console.error(error);
            setFailed([...failed, channelId]);
        }

        setLoading(loading.filter((id) => id !== channelId));
    }

    return (
        <div className={styles.popup}>
            <div className={styles.header}>
                <h1>Invite Friends to {content.guild.name}</h1>
                {channels.length > 0 && (
                    <>
                        <div># {content.channel.name}</div>

                        <div className={styles.input}>
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

                            <div>
                                <Icon name="search" />
                            </div>
                        </div>
                    </>
                )}

                <button
                    className="button"
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

            {channels.length > 0 && (
                <>
                    {filteredList.length > 0 && !error ? (
                        <div className={styles.scroller + " scrollbar"}>
                            {filteredList.map((channel) => (
                                <div
                                    key={channel.id}
                                    className={styles.friend}
                                >
                                    <div>
                                        <div className={styles.friendAvatar}>
                                            <Avatar
                                                src={channel.icon as string}
                                                alt={channel.name as string}
                                                size={32}
                                            />
                                        </div>

                                        <div className={styles.friendUsername}>{channel.name}</div>
                                    </div>

                                    <button
                                        className={`
                                            button ${styles.inviteButton}
                                            ${failed.includes(channel.id) ? styles.failed : ""}
                                            ${sentTo.includes(channel.id) ? styles.sent : ""}
                                        `}
                                        onClick={() => {
                                            if (
                                                sentTo.includes(channel.id) ||
                                                loading.includes(channel.id)
                                            ) {
                                                return;
                                            }
                                            invite(channel.id);
                                        }}
                                        onMouseMove={(e) => {
                                            if (failed.includes(channel.id)) {
                                                setTooltip({
                                                    element: e.currentTarget,
                                                    text: "Retry sending invite",
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {failed.includes(channel.id) ? (
                                            "Failed"
                                        ) : sentTo.includes(channel.id) ? (
                                            "Sent"
                                        ) : loading.includes(channel.id) ? (
                                            <LoadingDots />
                                        ) : (
                                            "Invite"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
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

                            <div>{error ? "Something went wrong" : "No results found"}</div>
                        </div>
                    )}

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
                                className={copied ? "button green" : "button blue"}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `https://chat-app.mart1d4.dev/${inviteLink}`
                                    );
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        {error && <div style={{ color: "var(--error-1)" }}>{error}</div>}

                        {!error && (
                            <div>
                                Your invite link expires in 24 hours.{" "}
                                <span className={styles.editLink}>Edit invite link.</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
