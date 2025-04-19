"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { ChannelInvite, ResponseMessage } from "@/type";
import { useRequests } from "@/hooks/useRequests";
import { Icon, LoadingDots } from "@components";
import { getCdnUrl } from "@/lib/uploadthing";
import { getRandomImage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import styles from "./Invite.module.css";
import { useData } from "@/store";

export function MessageInvite({
    invite,
    message,
}: {
    invite: ChannelInvite | { error: true; code: string; inviterId: number };
    message: ResponseMessage;
}) {
    const { acceptInvite } = useRequests();
    const user = useAuthenticatedUser();
    const router = useRouter();

    const isLocal = "error" in invite;

    const inChannel = !isLocal
        ? useData((state) => state.channels).find((c) => c.id == invite.channel.id)
        : null;

    const inGuild = !isLocal
        ? useData((state) => state.guilds).find((g) => g.id == invite.guild?.id)
        : null;

    async function handleAcceptInvite() {
        if ((inChannel || inGuild) && !isLocal) {
            let url = `/channels/${invite.guild?.id}/${invite.channel.id}`;

            if (inChannel) {
                url = `/channels/me/${invite.channel.id}`;
            }

            return router.push(url);
        }

        acceptInvite.send({ inviteId: invite.code });
    }

    if (isLocal) {
        const isSender = user.id == message.author.id;

        return (
            <div className={styles.guildInvite}>
                <h3>
                    {isSender ? "You sent an invite, but..." : "You received an invite, but..."}
                </h3>

                <div className={styles.content}>
                    <div className={styles.headline}>
                        <div
                            className={styles.inviteIconPoop}
                            style={{ backgroundImage: `url(/assets/system/poop.svg)` }}
                        />

                        <div>
                            <h3 style={{ color: "var(error-1)" }}>Invalid Invite</h3>

                            <strong>
                                {isSender
                                    ? "Try sending a new invite!"
                                    : `Ask ${message.author.displayName} for a new invite!`}
                            </strong>
                        </div>
                    </div>

                    {!isSender && (
                        <button
                            className="button regular blue"
                            // onClick={() => setMention(message.author.id)}
                        >
                            Mention
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.guildInvite}>
            <h3>
                {user.id == invite.inviterId
                    ? `You sent an invite to join a ${invite.guild ? "server" : "group dm"}`
                    : `You've been invited to join a ${invite.guild ? "server" : "group dm"}`}
            </h3>

            <div className={styles.content}>
                <div className={styles.headline}>
                    <div
                        className={
                            !invite.guild || invite.guild.icon
                                ? styles.inviteIcon
                                : styles.inviteAcronym
                        }
                        style={{
                            backgroundImage: invite.guild
                                ? invite.guild.icon && `url(${getCdnUrl}${invite.guild.icon}/)`
                                : `url(${
                                      invite.channel.icon
                                          ? `${getCdnUrl}${invite.channel.icon}`
                                          : `${getRandomImage(invite.channel.id, "icon")}`
                                  })`,
                            borderRadius: invite.guild ? "16px" : "999px",
                        }}
                    >
                        {invite.guild &&
                            !invite.guild?.icon &&
                            (invite.guild.name.match(/\b(\w)/g)?.join("") ?? "")}
                    </div>

                    <div>
                        <h3
                            onClick={handleAcceptInvite}
                            className={inChannel || inGuild ? styles.link : ""}
                        >
                            {invite.guild?.name ??
                                invite.channel.name ??
                                invite.recipients.map((r) => r.username).join(", ")}
                        </h3>

                        <strong>
                            {invite.guild ? (
                                <span className={styles.channelName}>
                                    <Icon
                                        size={14}
                                        name="hashtag"
                                    />
                                    {invite.channel.name}
                                </span>
                            ) : (
                                <>
                                    <span>
                                        <span className={styles.onlineDot} />
                                        {
                                            invite.recipients.filter((r) => r.status === "online")
                                                .length
                                        }{" "}
                                        Online
                                    </span>

                                    <span>
                                        <span className={styles.offlineDot} />
                                        {invite.recipients.length} Member
                                        {invite.recipients.length > 1 && "s"}
                                    </span>
                                </>
                            )}
                        </strong>
                    </div>
                </div>

                <button
                    className="button regular green"
                    onClick={handleAcceptInvite}
                >
                    {acceptInvite.isLoading ? (
                        <LoadingDots />
                    ) : inGuild || inChannel ? (
                        "Joined"
                    ) : (
                        "Join"
                    )}
                </button>
            </div>
        </div>
    );
}
