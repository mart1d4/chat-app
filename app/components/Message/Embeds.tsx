"use client";

import { DialogContent, DialogTrigger, DialogProtip, ImageViewer, Dialog, Icon } from "@components";
import type { MessageFunctions } from "./Message";
import type { Embeds } from "@/lib/db/db.types";
import type { ResponseMessage } from "@/type";
import styles from "./Message.module.css";
import { useState } from "react";

export function MessageEmbeds({
    message,
    functions,
}: {
    message: ResponseMessage;
    functions: MessageFunctions;
}) {
    return (
        <div className={styles.attachments}>
            <div className={styles.embeds}>
                {message.embeds.map((embed) => (
                    <div
                        key={embed.url}
                        className={styles.gridOneBig}
                        style={{
                            borderRadius: embed.type === "image" ? "" : "4px",
                            maxHeight: embed.type === "image" ? "" : "unset",
                            overflow: embed.type === "image" ? "" : "visible",
                        }}
                    >
                        {embed.type === "image" ? (
                            <Image
                                embed={embed}
                                message={message}
                                functions={functions}
                            />
                        ) : (
                            <Embed
                                embed={embed}
                                functions={functions}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Image({
    embed,
    message,
    functions,
}: {
    embed: Embeds;
    message: ResponseMessage;
    functions: MessageFunctions;
}) {
    return (
        <div
            className={styles.image}
            onClick={() => {
                const index = message.embeds.findIndex((a) => a.url === embed.url);

                // setLayers({
                //     settings: {
                //         type: "POPUP",
                //     },
                //     content: {
                //         type: "ATTACHMENT_PREVIEW",
                //         attachments: message.embeds,
                //         current: index,
                //     },
                // });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         event: e,
                //     },
                //     content: {
                //         type: "MESSAGE",
                //         message: message,
                //         attachment: embed,
                //         functions: functions,
                //     },
                // });
            }}
        >
            <div>
                <div>
                    <div>
                        <div>
                            <img
                                src={embed.url}
                                alt={embed.title || "image"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Embed({ embed, functions }: { embed: Embeds; functions: MessageFunctions }) {
    const [loading, setLoading] = useState(false);

    return (
        <div
            className={styles.embed}
            style={{ borderColor: embed.color ? `#${embed.color}` : "" }}
        >
            <div>
                <div>
                    <Dialog>
                        <DialogTrigger>
                            <div
                                className={styles.embedRemove}
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (e.shiftKey) {
                                        functions.removeEmbeds();
                                    }
                                }}
                            >
                                <Icon name="close" />
                            </div>
                        </DialogTrigger>

                        <DialogContent
                            closeOnConfirm
                            heading="Are you sure?"
                            description="This will remove all embeds on this message for everyone."
                            confirmLabel="Remove All Embeds"
                            confirmColor="red"
                            confirmLoading={loading}
                            onConfirm={async () => {
                                setLoading(true);
                                await functions.removeEmbeds();
                                setLoading(false);
                            }}
                        >
                            <DialogProtip>
                                Hold shift when clearing embeds to skip this modal.
                            </DialogProtip>
                        </DialogContent>
                    </Dialog>

                    <div className={styles.url}>{embed.url?.split("/")[2]}</div>

                    {embed.title && (
                        <a
                            className={styles.title}
                            href={embed.url}
                            target="_blank"
                        >
                            {embed.title}
                        </a>
                    )}

                    {embed.description && <div className={styles.desc}>{embed.description}</div>}

                    {embed.image && (
                        <div className={styles.img}>
                            <div>
                                <Dialog>
                                    <DialogTrigger>
                                        <div
                                            onContextMenu={() => {
                                                // setLayers({
                                                //     settings: {
                                                //         type: "MENU",
                                                //         event: e,
                                                //     },
                                                //     content: {
                                                //         type: "MESSAGE",
                                                //         message: message,
                                                //         attachment: embed.image,
                                                //         functions: functions,
                                                //     },
                                                // });
                                            }}
                                        >
                                            <img
                                                src={embed.image.url}
                                                alt="embed"
                                            />
                                        </div>
                                    </DialogTrigger>

                                    <DialogContent blank>
                                        <ImageViewer
                                            attachments={[
                                                {
                                                    ...embed.image,
                                                    type: "image",
                                                    size: 0,
                                                    spoiler: false,
                                                    description: "",
                                                    filename: "",
                                                    file: new File([], ""),
                                                    id: "",
                                                },
                                            ]}
                                            currentIndex={0}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
