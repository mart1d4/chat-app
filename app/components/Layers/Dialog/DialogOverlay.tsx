"use client";

import { Dialog, DialogContent } from "./Dialog";
import { useTriggerDialog } from "@/store";
import styles from "./Dialog.module.css";

const warnings = {
    MESSAGE_LIMIT: {
        title: "Your message is too long...",
        description: "You've hit the 16000 character count limit.",
        confirmLabel: "Got it",
        hideCancel: true,
        boldHeading: true,
        art: "message_limit_dark_v2.png",
    },
    FILE_SIZE: {
        title: "Uh oh, this file exceeds the size limit.",
        description: "The max file size is 10MB.",
        confirmLabel: "Got it",
        hideCancel: true,
        boldHeading: true,
        art: "file_upload_dark_v2.png",
    },
    UPLOAD_FAILED: {
        title: "Upload Failed",
        description: "Something went wrong. try again later",
        confirmLabel: "Got it",
        hideCancel: true,
        boldHeading: true,
        art: undefined,
    },
};

export function DialogOverlay() {
    const { open, removeDialog } = useTriggerDialog();

    return open.map((obj, i) => {
        const { type, data } = obj;
        const warning = type in warnings ? warnings[type as keyof typeof warnings] : null;

        return (
            <Dialog
                key={type}
                open={i === open.length - 1}
                onOpenChange={(v) => !v && removeDialog(obj.type)}
            >
                {type === "DRAG_FILE" && (
                    <DialogContent blank>
                        <div
                            className={styles.warning}
                            style={{ backgroundColor: "var(--accent-1)" }}
                        >
                            <div>
                                <div className={styles.icons}>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                </div>

                                <div className={styles.title}>
                                    {`Upload to ${
                                        data?.channel?.type === 0
                                            ? "@"
                                            : data?.channel?.type === 2
                                            ? "#"
                                            : ""
                                    }${data?.channel.name}`}
                                </div>

                                <div className={styles.description}>
                                    You can add comments before uploading.
                                    <br />
                                    Hold shift to upload directly.
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}

                {type === "FILE_NUMBER" && (
                    <DialogContent blank>
                        <div className={styles.warning}>
                            <div>
                                <div className={styles.icons}>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                </div>

                                <div className={styles.title}>Too many uploads!</div>

                                <div className={styles.description}>
                                    You can only upload 10 files at a time!
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}

                {type === "UPLOAD_FAILED" && (
                    <DialogContent blank>
                        <div className={styles.warning}>
                            <div>
                                <div className={styles.icons}>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                    <div>
                                        <div />
                                    </div>
                                </div>

                                <div className={styles.title}>Upload Failed</div>

                                <div className={styles.description}>
                                    Something went wrong, try again later.
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}

                {warning && (
                    <DialogContent
                        centered
                        art={warning.art}
                        heading={warning.title}
                        hideCancel={warning.hideCancel}
                        boldHeading={warning.boldHeading}
                        description={warning.description}
                        confirmLabel={warning.confirmLabel}
                        onCancel={() => removeDialog(type)}
                        onConfirm={() => removeDialog(type)}
                    />
                )}
            </Dialog>
        );
    });
}
