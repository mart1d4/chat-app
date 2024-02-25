"use client";

import { usePathname, useRouter } from "next/navigation";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Message.module.css";
import { useData } from "@/lib/store";

export function MessageInvite({
    invite,
    message,
}: {
    invite: {
        code: string;
        type: string;
        inviterId: string;
        channel: ChannelTable;
        guild?: GuildTable;
    };
    message: MessageTable;
}) {
    const channels = useData((state) => state.channels);
    const guilds = useData((state) => state.guilds);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className={styles.guildInvite}>
            <h3>
                {!("type" in invite)
                    ? user.id == invite.inviterId
                        ? `You sent an invite to join a ${invite.guild ? "server" : "group dm"}`
                        : `You've been invited to join a ${invite.guild ? "server" : "group dm"}`
                    : user.id == message.author.id
                    ? "You sent an invite, but..."
                    : "You received an invite, but..."}
            </h3>

            <div className={styles.content}>
                <div className={styles.headline}>
                    <div
                        className={
                            "type" in invite
                                ? styles.inviteIconPoop
                                : !invite.guild || invite.guild.icon
                                ? styles.inviteIcon
                                : styles.inviteAcronym
                        }
                        style={{
                            backgroundImage:
                                "type" in invite
                                    ? "url(https://ucarecdn.com/968c5fbf-9c28-40ae-9bba-7d54d582abe7/)"
                                    : invite.guild
                                    ? invite.guild.icon &&
                                      `url(${process.env.NEXT_PUBLIC_CDN_URL}/${invite.guild.icon}/)`
                                    : `url(${process.env.NEXT_PUBLIC_CDN_URL}/${invite.channel.icon}/)`,
                            borderRadius: "type" in invite ? "" : invite.guild ? "16px" : "999px",
                        }}
                    >
                        {!("type" in invite) &&
                            invite.guild &&
                            !invite.guild?.icon &&
                            (invite.guild.name
                                .toLowerCase()
                                .match(/\b(\w)/g)
                                ?.join("") ??
                                "")}
                    </div>

                    <div>
                        <h3
                            style={{
                                color:
                                    "type" in invite && invite.type === "notfound"
                                        ? "var(--error-1)"
                                        : "",
                            }}
                            className={
                                !("type" in invite) &&
                                (guilds.find((guild) => guild.id == invite.guild?.id) ||
                                    channels.find((channel) => channel.id == invite.channel.id))
                                    ? styles.link
                                    : ""
                            }
                            onClick={() => {
                                if (!("type" in invite)) {
                                    if (invite.guild) {
                                        if (guilds.find((guild) => guild.id == invite.guild?.id)) {
                                            if (
                                                pathname !==
                                                `/channels/${invite.guild.id}/${invite.channel.id}`
                                            ) {
                                                router.push(
                                                    `/channels/${invite.guild.id}/${invite.channel.id}`
                                                );
                                            }
                                        } else {
                                            sendRequest({
                                                query: "ACCEPT_INVITE",
                                                params: {
                                                    inviteId: invite.code,
                                                },
                                            });
                                        }
                                    } else {
                                        if (
                                            channels.find(
                                                (channel) => channel.id == invite.channelId
                                            )
                                        ) {
                                            if (pathname !== `/channels/me/${invite.channel.id}`) {
                                                router.push(`/channels/me/${invite.channel.id}`);
                                            }
                                        } else {
                                            sendRequest({
                                                query: "ACCEPT_INVITE",
                                                params: {
                                                    inviteId: invite.code,
                                                },
                                            });
                                        }
                                    }
                                }
                            }}
                        >
                            {"type" in invite
                                ? invite.type === "notfound"
                                    ? "Invalid Invite"
                                    : "Something Went Wrong"
                                : invite.guild?.name ?? invite.channel.name}
                        </h3>
                        <strong>
                            {"type" in invite ? (
                                invite.type === "notfound" ? (
                                    user.id == message.author.id ? (
                                        "Try sending a new invite!"
                                    ) : (
                                        `Ask ${message.author.username} for a new invite!`
                                    )
                                ) : (
                                    "Try again later"
                                )
                            ) : (
                                <>
                                    <span>
                                        <span className={styles.onlineDot} />
                                        {invite.guild
                                            ? invite.guild?.members.length
                                            : invite.channel.recipients.length}{" "}
                                        Online
                                    </span>

                                    <span>
                                        <span className={styles.offlineDot} />
                                        {invite.guild
                                            ? invite.guild?.members.length
                                            : invite.channel.recipients.length}{" "}
                                        Member
                                        {(invite.guild
                                            ? invite.guild?.members.length
                                            : invite.channel.recipients.length) > 1 && "s"}
                                    </span>
                                </>
                            )}
                        </strong>
                    </div>
                </div>

                {!("type" in invite) && (
                    <button
                        onClick={() => {
                            if (invite.guild) {
                                if (guilds.find((guild) => guild.id == invite.guild?.id)) {
                                    if (
                                        pathname !==
                                        `/channels/${invite.guild.id}/${invite.channel.id}`
                                    ) {
                                        router.push(
                                            `/channels/${invite.guild.id}/${invite.channel.id}`
                                        );
                                    }
                                } else {
                                    sendRequest({
                                        query: "ACCEPT_INVITE",
                                        params: {
                                            inviteId: invite.code,
                                        },
                                    });
                                }
                            } else {
                                if (channels.find((channel) => channel.id == invite.channelId)) {
                                    if (pathname !== `/channels/me/${invite.channel.id}`) {
                                        router.push(`/channels/me/${invite.channel.id}`);
                                    }
                                } else {
                                    sendRequest({
                                        query: "ACCEPT_INVITE",
                                        params: {
                                            inviteId: invite.code,
                                        },
                                    });
                                }
                            }
                        }}
                        className="button green"
                    >
                        {guilds.find((guild) => guild.id == invite.guild?.id) ||
                        channels.find((channel) => channel.id == invite.channel.id)
                            ? "Joined"
                            : "Join"}
                    </button>
                )}

                {"type" in invite &&
                    invite.type === "notfound" &&
                    user.id !== message.author.id && (
                        <button
                            className="button blue"
                            onClick={() => setMention(message.author)}
                        >
                            Mention
                        </button>
                    )}
            </div>
        </div>
    );
}
