"use client";

import useFetchHelper from "@/hooks/useFetchHelper";
import { type Message, type Channel } from "@/type";
import { usePopoverContext } from "../Popover";
import { useEffect, useState } from "react";
import { FixedMessage } from "@components";
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
                setPinned(data.data.messages);
            } else {
                console.error(errors);
            }
        }

        fetchPinned();
    }, []);

    return (
        <div className={styles.container}>
            <div>
                <h1>Pinned Messages</h1>

                <button
                    className={styles.close}
                    onClick={() => setOpen(false)}
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
