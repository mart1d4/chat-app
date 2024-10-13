"use client";

import styles from "./Message.module.css";
import { useLayers } from "@/store";
import { Icon } from "@components";

export function MessageEmbeds({ message, functions }: { message: TMessage; functions: any }) {
    return (
        <div className={styles.attachments}>
            <div style={{ borderRadius: "4px" }}>
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
                                message={message}
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
    embed: TAttachment;
    message: TMessage;
    functions: any;
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
                                alt={embed.name || "image"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Embed({
    embed,
    message,
    functions,
}: {
    embed: TAttachment;
    message: TMessage;
    functions: any;
}) {
    return (
        <div
            className={styles.embed}
            style={{ borderColor: embed.color ? `#${embed.color}` : "" }}
        >
            <div>
                <div>
                    <div
                        className={styles.embedRemove}
                        onClick={(e) => {
                            e.stopPropagation();

                            if (e.shiftKey) {
                                functions.removeEmbeds();
                            } else {
                                // setLayers({
                                //     settings: {
                                //         type: "POPUP",
                                //     },
                                //     content: {
                                //         type: "REMOVE_EMBEDS",
                                //         onConfirm: () => functions.removeEmbeds(),
                                //     },
                                // });
                            }
                        }}
                    >
                        <Icon name="close" />
                    </div>

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
                                <div
                                    onClick={() => {
                                        const attachment = {
                                            type: "image",
                                            url: embed.image.url,
                                            dimensions: {
                                                width: embed.image.width,
                                                height: embed.image.height,
                                            },
                                        };

                                        // setLayers({
                                        //     settings: {
                                        //         type: "POPUP",
                                        //     },
                                        //     content: {
                                        //         type: "ATTACHMENT_PREVIEW",
                                        //         attachments: [attachment],
                                        //         current: 0,
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
