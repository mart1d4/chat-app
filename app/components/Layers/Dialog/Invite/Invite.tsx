"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import type { AppGuild, GuildChannel } from "@/type";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Invite.module.css";
import { useData } from "@/store";
import {
    useDialogContext,
    TooltipContent,
    TooltipTrigger,
    LoadingDots,
    Tooltip,
    Avatar,
    Icon,
} from "@components";

export function InviteDialog({ channel, guild }: { channel: GuildChannel; guild: AppGuild }) {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");
    const [link, setLink] = useState("");

    const [loading, setLoading] = useState<number[]>([]);
    const [sentTo, setSentTo] = useState<number[]>([]);
    const [failed, setFailed] = useState<number[]>([]);

    const channels = useData((state) => state.channels);
    const { sendRequest } = useFetchHelper();
    const { setOpen } = useDialogContext();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getLink();
    }, []);

    const filteredList = useMemo(() => {
        if (search) {
            return channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
        }

        return channels;
    }, [search, channels]);

    async function getLink() {
        try {
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
                setLink(data.invite.code);
            } else if (errors) {
                throw new Error("Failed to create invite link");
            }
        } catch (error) {
            setErrors((prev) => ({ ...prev, server: "Something went wrong" }));
        }
    }

    async function invite(channelId: number) {
        if (loading.includes(channelId) || errors.server) return;
        setLoading((prev) => [...prev, channelId]);

        try {
            const { errors } = await sendRequest({
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

            if (!errors) {
                if (failed.includes(channelId)) {
                    setFailed(failed.filter((id) => id !== channelId));
                }
                setSentTo((prev) => [...prev, channelId]);
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
        <div className={styles.popup}>
            <div className={styles.header}>
                <button onClick={() => setOpen(false)}>
                    <Icon name="close" />
                </button>

                <h1>Invite Friends to {guild.name}</h1>
                <div># {channel.name}</div>

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
            </div>

            {filteredList.length > 0 && !errors.server ? (
                <div className={styles.scroller + " scrollbar"}>
                    {filteredList.map((channel) => (
                        <div
                            key={channel.id}
                            className={styles.friend}
                        >
                            <div>
                                <div className={styles.friendAvatar}>
                                    <Avatar
                                        size={32}
                                        type="channel"
                                        alt={channel.name}
                                        fileId={channel.icon}
                                        generateId={channel.id}
                                    />
                                </div>

                                <div className={styles.friendUsername}>{channel.name}</div>
                            </div>

                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        className={`
                                            button ${styles.inviteButton}
                                            ${failed.includes(channel.id) ? styles.failed : ""}
                                            ${sentTo.includes(channel.id) ? styles.sent : ""}
                                        `}
                                        onClick={() => {
                                            if (
                                                !sentTo.includes(channel.id) &&
                                                !loading.includes(channel.id)
                                            ) {
                                                invite(channel.id);
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
                                </TooltipTrigger>
                                {failed.includes(channel.id) && (
                                    <TooltipContent>Retry sending invite</TooltipContent>
                                )}
                            </Tooltip>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noFriends}>
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

                <div id="inviteLink">
                    <div>
                        <input
                            readOnly
                            type="text"
                            ref={inputLinkRef}
                            focus-id="inviteLink"
                            value={`https://spark.mart1d4.dev/${link}`}
                            onClick={() => inputLinkRef.current?.select()}
                        />
                    </div>

                    <button
                        className={copied ? "button green" : "button blue"}
                        onClick={() => {
                            try {
                                navigator.clipboard.writeText(`https://spark.mart1d4.dev/${link}`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1000);
                            } catch (error) {
                                setErrors((prev) => ({
                                    ...prev,
                                    invite: "Failed to copy",
                                }));
                            }
                        }}
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>

                <div>
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
            </div>
        </div>
    );
}
