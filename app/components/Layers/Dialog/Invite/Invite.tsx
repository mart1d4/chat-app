"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { GuildChannel, UserGuild } from "@/type";
import { useState, useRef, useMemo } from "react";
import { useRequests } from "@/hooks/useRequests";
import { lowercaseContains } from "@/lib/strings";
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

export function InviteDialog({ channel, guild }: { channel: GuildChannel; guild: UserGuild }) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");
    const [link, setLink] = useState("");

    const [editInvite, setEditInvite] = useState(false);
    const [inviteSettings, setInviteSettings] = useState({
        maxUses: 100,
        maxAge: 86400,
        temporary: false,
    });

    const [loading, setLoading] = useState<number[]>([]);
    const [sentTo, setSentTo] = useState<number[]>([]);
    const [failed, setFailed] = useState<number[]>([]);

    const { sendMessage, createInvite } = useRequests();
    const { setOpen } = useDialogContext();
    const user = useAuthenticatedUser();
    const { channels } = useData();

    const inputLinkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!link && !createInvite.error && !createInvite.isLoading) {
        createInvite.send(
            { channelId: channel.id, body: inviteSettings },
            { onComplete: (data) => setLink(data.invite.code) }
        );
    }

    async function invite(channelId: number) {
        setLoading((prev) => [...prev, channelId]);

        sendMessage.send(
            {
                channelId,
                message: { content: `${window.location.origin}/${link}` },
                senderShouldReceive: true,
            },
            {
                onComplete: () => {
                    if (failed.includes(channelId)) {
                        setFailed(failed.filter((id) => id !== channelId));
                    }
                    setSentTo((prev) => [...prev, channelId]);
                },
                onFail: () => setFailed((prev) => [...prev, channelId]),
            }
        );

        setLoading(loading.filter((id) => id !== channelId));
    }

    const filteredList = useMemo(() => {
        if (search) return channels.filter((c) => lowercaseContains(c.name, search));
        return channels;
    }, [search, channels]);

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
                        type="text"
                        ref={inputRef}
                        value={search}
                        role="combobox"
                        spellCheck="false"
                        aria-expanded="true"
                        aria-haspopup="true"
                        aria-autocomplete="list"
                        placeholder={"Search for friends"}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div>
                        <Icon name="search" />
                    </div>
                </div>
            </div>

            {filteredList.length > 0 && !errors.server ? (
                <div className={styles.scroller + " scrollbar"}>
                    {filteredList.map((channel) => {
                        const friend =
                            channel.type === 0
                                ? channel.recipients.find((r) => r.id !== user.id)
                                : null;

                        return (
                            <div
                                key={channel.id}
                                className={styles.friend}
                            >
                                <div>
                                    <div className={styles.friendAvatar}>
                                        <Avatar
                                            size={32}
                                            alt={channel.name}
                                            status={friend?.status}
                                            generateId={friend?.id || channel.id}
                                            fileId={friend?.avatar || channel.icon}
                                            type={channel.type === 0 ? "user" : "channel"}
                                        />
                                    </div>

                                    <div className={styles.friendUsername}>{channel.name}</div>
                                </div>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            className={`
                                                button regular ${styles.inviteButton}
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
                        );
                    })}
                </div>
            ) : (
                <div className={styles.noFriends}>
                    <div
                        style={{
                            width: "85px",
                            height: "85px",
                            backgroundImage: `url(/assets/system/nothing-found.svg)`,
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
                            value={`${window.location.origin}/${link}`}
                            onClick={() => inputLinkRef.current?.select()}
                        />
                    </div>

                    <button
                        className={copied ? "button regular green" : "button regular blue"}
                        onClick={() => {
                            try {
                                navigator.clipboard.writeText(`${window.location.origin}/${link}`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1000);
                            } catch (error) {
                                setErrors((prev) => ({ ...prev, invite: "Failed to copy" }));
                            }
                        }}
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>

                <div>
                    {createInvite.error && (
                        <div style={{ color: "var(--danger-0)" }}>{createInvite.error}</div>
                    )}

                    {link && (
                        <div>
                            Your invite link expires in {inviteSettings.maxAge / 60 / 60} hours.
                            <span className={styles.editLink}>Edit invite link.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
