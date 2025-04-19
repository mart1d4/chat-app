"use client";

import { type DMChannelWithRecipients, type Guild, type GuildChannel } from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useFetchPinnedMessages } from "@/hooks/useFetchData";
import { usePermissions } from "@/hooks/usePermissions";
import { FixedMessage, Icon } from "@components";
import { usePopoverContext } from "../Popover";
import styles from "./Pinned.module.css";

export function Pinned({
    channel,
    guild,
}: {
    channel: DMChannelWithRecipients | GuildChannel;
    guild?: Guild;
}) {
    const { hasPermission } = usePermissions({ guildId: guild?.id });
    const { data: pinned } = useFetchPinnedMessages(channel.id);
    const { setOpen } = usePopoverContext();
    const user = useAuthenticatedUser();

    const friend = channel.type === 0 && channel.recipients.find((r) => r.id !== user.id);

    const canPin = [0, 1].includes(channel.type)
        ? true
        : hasPermission({
              permission: "MANAGE_MESSAGES",
              specificChannelId: channel.id,
              userId: user.id,
          });

    return (
        <div
            data-full-on-mobile
            className={styles.container}
        >
            <div>
                <h1>Pinned Messages</h1>

                <button
                    className={styles.close}
                    onClick={() => setOpen(false)}
                >
                    <Icon name="close" />
                </button>
            </div>

            <div className="scrollbar">
                {!pinned || pinned.length === 0 ? (
                    <div className={styles.noPinnedContent}>
                        <div style={{ backgroundImage: `url(/assets/system/no-pinned.svg)` }} />

                        <div>
                            This direct message doesn't have <br />
                            any pinned messages... yet.
                        </div>
                    </div>
                ) : (
                    pinned.map((message) => (
                        <div
                            key={message.id}
                            className={styles.message}
                        >
                            <FixedMessage
                                pinned
                                canPin={canPin}
                                channel={channel}
                                message={message}
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
                            {channel.type === 0 &&
                                friend &&
                                `You and ${friend.displayName} can pin a message from its cog menu.`}

                            {channel.type === 1 &&
                                "Any group member can pin a message from its cog menu."}

                            {channel.type === 2 &&
                                "Users with 'Manage Messages' can pin from the cog menu."}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
