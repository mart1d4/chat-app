"use client";

import useFetchHelper from "@/hooks/useFetchHelper";
import { type Message, type Channel } from "@/type";
import { usePopoverContext } from "../Popover";
import { useEffect, useState } from "react";
import { FixedMessage, Icon } from "@components";
import styles from "./Pinned.module.css";
import { useData } from "@/store";

export function Pinned({ channel }: { channel: Channel }) {
    const [pinned, setPinned] = useState<Message[]>([]);

    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();
    const { setOpen } = usePopoverContext();

    useEffect(() => {
        async function fetchPinned() {
            const { errors, data } = await sendRequest({
                query: "CHANNEL_PINNED_MESSAGES",
                params: {
                    channelId: channel.id,
                },
            });

            if (data) {
                setPinned(data);
            } else {
                console.error(errors);
            }
        }

        fetchPinned();
    }, []);

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
                                `You and ${
                                    channel.recipients.find((r) => r.id !== user?.id)?.displayName
                                } can pin a message from its cog menu.`}

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
