"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Avatar, Icon, LoadingDots } from "@components";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Invite.module.css";
import { useData } from "@/store";

export function InvitePopup({ content, closing }) {
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");
    const [errors, setErrors] = useState<{
        invite?: string;
        server?: string;
    }>({});
    const [link, setLink] = useState("");

    const [loading, setLoading] = useState<number[]>([]);
    const [sentTo, setSentTo] = useState<number[]>([]);
    const [failed, setFailed] = useState<number[]>([]);

    const channels = useData((state) => state.channels);
    const { sendRequest } = useFetchHelper();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                // setLayers({
                //     settings: {
                //         type: "POPUP",
                //         setNull: true,
                //     },
                // });
            }
        }

        getLink();

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const filteredList = useMemo(() => {
        if (search) {
            return channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
        }
        return channels;
    }, [search, channels]);

    async function getLink() {
        try {
            const response = await sendRequest({
                query: "CREATE_INVITE",
                params: {
                    channelId: content.channel.id,
                },
                body: {
                    maxUses: 100,
                    maxAge: 86400,
                    temporary: false,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setLink(data.data.invite.code);
            } else {
                setErrors(data.errors);
            }
        } catch (error) {
            setErrors((prev) => ({ ...prev, server: "Something went wrong" }));
        }
    }

    async function invite(channelId: number) {
        if (loading.includes(channelId)) return;
        setLoading((prev) => [...prev, channelId]);

        try {
            const response = await sendRequest({
                query: "SEND_MESSAGE",
                params: {
                    channelId,
                },
                body: {
                    message: {
                        content: `https://spark.mart1d4.dev/${link}`,
                        attachments: [],
                        messageReference: null,
                    },
                },
            });

            if (response.ok) {
                setSentTo((prev) => [...prev, channelId]);
                if (failed.includes(channelId)) {
                    setFailed(failed.filter((id) => id !== channelId));
                }
            } else {
                setFailed((prev) => [...prev, channelId]);
            }
        } catch (error) {
            console.error(error);
            setFailed((prev) => [...prev, channelId]);
        }

        setLoading(loading.filter((id) => id !== channelId));
    }

    return (
        <div
            className={styles.popup}
            style={{ animationName: closing ? styles.popOut : "" }}
        >
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
                    onClick={
                        () => {}
                        // setLayers({
                        //     settings: {
                        //         type: "POPUP",
                        //         setNull: true,
                        //     },
                        // })
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
                    {filteredList.length > 0 ? (
                        <div className={styles.scroller + " scrollbar"}>
                            {filteredList.map((channel) => (
                                <div
                                    key={channel.id}
                                    className={styles.friend}
                                >
                                    <div>
                                        <div className={styles.friendAvatar}>
                                            <Avatar
                                                src={channel.icon}
                                                alt={channel.name}
                                                type="icons"
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
                                                // setTooltip({
                                                //     element: e.currentTarget,
                                                //     text: "Retry sending invite",
                                                // });
                                            }
                                        }}
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
                                    backgroundImage: `url(/assets/system/nothing-found.svg)`,
                                    width: "85px",
                                    height: "85px",
                                }}
                            />

                            <div>No results found</div>
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
                                    value={`https://spark.mart1d4.dev/${link}`}
                                    onClick={() => inputLinkRef.current?.select()}
                                />
                            </div>

                            <button
                                className={copied ? "button green" : "button blue"}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `https://spark.mart1d4.dev/${link}`
                                    );
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1000);
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        {(errors.invite || errors.server) && (
                            <div style={{ color: "var(--error-1)" }}>
                                {errors.invite || errors.server}
                            </div>
                        )}

                        {link && (
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
