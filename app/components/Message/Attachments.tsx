"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { useData, useLayers } from "@/store";
import styles from "./Message.module.css";
import { Icon } from "@components";
import { useState } from "react";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

export function MessageAttachments({ message, functions }: { message: TMessage; functions: any }) {
    const ImageComponent = ({ attachment }) => (
        <Image
            attachment={attachment}
            message={message}
            functions={functions}
        />
    );

    const attachments = message.attachments;
    const length = attachments.length;

    return (
        <div className={styles.attachments}>
            <div>
                {length === 1 && (
                    <div className={styles.gridOneBig}>
                        <ImageComponent attachment={attachments[0]} />
                    </div>
                )}

                {length == 2 && (
                    <div className={styles.gridTwo}>
                        {attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {length == 3 && (
                    <div className={styles.gridTwo}>
                        <div className={styles.gridOneSolo}>
                            <ImageComponent
                                key={attachments[0].id}
                                attachment={attachments[0]}
                            />
                        </div>

                        <div className={styles.gridTwoColumn}>
                            <div>
                                {attachments.slice(1, 3).map((attachment) => (
                                    <div key={attachment.id}>
                                        <ImageComponent attachment={attachment} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {length == 4 && (
                    <div className={styles.gridFour}>
                        {attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {length == 5 && (
                    <>
                        <div className={styles.gridTwo}>
                            {attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {attachments.slice(2, 5).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}

                {length == 6 && (
                    <div className={styles.gridThree}>
                        {attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {length == 7 && (
                    <>
                        <div className={styles.gridOne}>
                            <ImageComponent
                                key={attachments[0].id}
                                attachment={attachments[0]}
                            />
                        </div>

                        <div className={styles.gridThree}>
                            {attachments.slice(1, 7).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}

                {length == 8 && (
                    <>
                        <div className={styles.gridTwo}>
                            {attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {attachments.slice(2, 8).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}

                {length == 9 && (
                    <div className={styles.gridThree}>
                        {attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {length == 10 && (
                    <>
                        <div className={styles.gridOne}>
                            <ImageComponent
                                key={attachments[0].id}
                                attachment={attachments[0]}
                            />
                        </div>

                        <div className={styles.gridThree}>
                            {attachments.slice(1, 10).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function Image({
    attachment,
    message,
    functions,
}: {
    attachment: TAttachment;
    message: TMessage;
    functions: any;
}) {
    const [hideSpoiler, setHideSpoiler] = useState(false);

    const user = useData((state) => state.user);

    return (
        <div
            className={styles.image}
            onClick={() => {
                if (attachment.isSpoiler && !hideSpoiler) {
                    return setHideSpoiler(true);
                }

                const index = message.attachments.findIndex((a) => a.id === attachment.id);

                // setLayers({
                //     settings: {
                //         type: "POPUP",
                //     },
                //     content: {
                //         type: "ATTACHMENT_PREVIEW",
                //         attachments: message.attachments,
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
                //         attachment: attachment,
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
                                src={`${cdnUrl}/${attachment.id}`}
                                alt={attachment.name}
                                style={{
                                    filter: attachment.isSpoiler ? "blur(44px)" : "",
                                    width: attachment.dimensions.width,
                                    height: attachment.dimensions.height,
                                }}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = `/assets/system/poop.svg`;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {(!attachment.isSpoiler || hideSpoiler) && user.id == message.author.id && (
                <Tooltip>
                    <TooltipTrigger>
                        <button
                            className={styles.deleteImage}
                            onClick={(e) => {
                                e.stopPropagation();

                                if (message.attachments.length === 1 && !message.content) {
                                    // return setLayers({
                                    //     settings: {
                                    //         type: "POPUP",
                                    //     },
                                    //     content: {
                                    //         type: "DELETE_MESSAGE",
                                    //         channelId: message.channelId,
                                    //         message: message,
                                    //     },
                                    // });
                                }

                                const updatedAttachments = message.attachments
                                    .map((file) => file.id)
                                    .filter((id: string) => id !== attachment.id);

                                // setLayers({
                                //     settings: { type: "POPUP" },
                                //     content: {
                                //         type: "DELETE_ATTACHMENT",
                                //         message: message,
                                //         attachments: updatedAttachments,
                                //     },
                                // });
                            }}
                        >
                            <Icon name="delete" />
                        </button>
                    </TooltipTrigger>

                    <TooltipContent>Delete</TooltipContent>
                </Tooltip>
            )}

            {attachment.isSpoiler && !hideSpoiler && (
                <div className={styles.spoilerButton}>Spoiler</div>
            )}

            {attachment.description && (!attachment.isSpoiler || hideSpoiler) && (
                <Tooltip>
                    <TooltipTrigger>
                        <button className={styles.imageAlt}>ALT</button>
                    </TooltipTrigger>

                    <TooltipContent>{attachment.description}</TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
