"use client";

import { DialogContent, Input, Icon, EmojiButton, useDialogContext } from "@components";
import { getStatusColor, getStatusLabel, getStatusMask } from "@/lib/utils";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import useRequestHelper from "@/hooks/useFetchHelper";
import styles from "./UpdateStatus.module.css";
import { useData } from "@/store";
import { useState } from "react";

const expirations = [
    { label: "Today", value: "today" },
    { label: "4 hours", value: "4h" },
    { label: "1 hour", value: "1h" },
    { label: "30 minutes", value: "30m" },
    { label: "Don't clear", value: "no" },
];

export function UpdateStatus() {
    const { sendRequest } = useRequestHelper();
    const { setOpen } = useDialogContext();
    const user = useAuthenticatedUser();
    const { setUser } = useData();

    const [customStatus, setCustomStatus] = useState(user.customStatus || "");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [showExpirations, setShowExpirations] = useState(false);
    const [expiration, setExpiration] = useState("today");
    const [showOptions, setShowOptions] = useState(false);
    const [status, setStatus] = useState(user.status);
    const [loading, setLoading] = useState(false);

    async function save() {
        if (loading) return;
        setLoading(true);

        if (user.customStatus === customStatus && user.status === status) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    customStatus,
                    status,
                    expiration,
                },
            });

            if (data?.user) {
                setUser(data.user);
                setOpen(false);
            } else {
                console.error("Failed to update user status");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <DialogContent
            centered
            onConfirm={save}
            noContentOverflow
            confirmLabel="Save"
            headingIcon="userStatus"
            confirmLoading={loading}
            heading="Set a custom status"
        >
            <Input
                maxLength={100}
                value={customStatus}
                leftItem={
                    <EmojiButton
                        open={emojiPickerOpen}
                        setOpen={setEmojiPickerOpen}
                    />
                }
                placeholder="Support has arrived!"
                label={`What's cookin', ${user.username}?`}
                onChange={(v) => setCustomStatus(v as string)}
                rightItem={
                    customStatus && (
                        <div
                            className={styles.clearInput}
                            onClick={() => setCustomStatus("")}
                        >
                            <Icon
                                size={16}
                                name="closeFilled"
                                viewbox="0 0 14 14"
                            />
                        </div>
                    )
                }
            />

            <div className={styles.input}>
                <label>Clear after</label>

                <div
                    className={styles.divInput}
                    style={{ borderRadius: showExpirations ? "4px 4px 0 0" : "" }}
                    onClick={() => {
                        if (showExpirations) setShowExpirations(false);
                        else setShowExpirations(true);
                    }}
                >
                    {expirations.find((e) => e.value === expiration)?.label}

                    <div
                        className={styles.inputIcon}
                        style={{
                            transform: showExpirations
                                ? "translateY(-50%) rotate(-90deg)"
                                : "translateY(-50%) rotate(90deg)",
                        }}
                    >
                        <Icon name="caret" />
                    </div>

                    {showExpirations && (
                        <ul className={styles.options}>
                            {expirations.map((e) => (
                                <li
                                    className={expiration === e.value ? styles.selected : ""}
                                    key={e.value}
                                    onClick={() => {
                                        setExpiration(e.value);
                                        setShowExpirations(false);
                                    }}
                                >
                                    <div>{e.label}</div>

                                    {expiration === e.value && (
                                        <Icon
                                            name="selected"
                                            fill="var(--accent-1)"
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.input}>
                <label>Status</label>

                <div
                    className={styles.divInput}
                    style={{ borderRadius: showOptions ? "4px 4px 0 0" : "" }}
                    onClick={() => {
                        if (showOptions) setShowOptions(false);
                        else setShowOptions(true);
                    }}
                >
                    {getStatusLabel(status)}

                    <div
                        className={styles.inputIcon}
                        style={{
                            transform: showOptions
                                ? "translateY(-50%) rotate(-90deg)"
                                : "translateY(-50%) rotate(90deg)",
                        }}
                    >
                        <Icon name="caret" />
                    </div>

                    {showOptions && (
                        <ul className={styles.options}>
                            {["online", "idle", "dnd", "offline"].map((s) => (
                                <li
                                    className={status === s ? styles.selected : ""}
                                    key={s}
                                    onClick={() => {
                                        setStatus(s);
                                        setShowOptions(false);
                                    }}
                                >
                                    <div>
                                        <svg className={styles.settingStatus}>
                                            <rect
                                                rx={8}
                                                ry={8}
                                                width="10px"
                                                height="10px"
                                                fill={getStatusColor(s)}
                                                mask={`url(#${getStatusMask(s)})`}
                                            />
                                        </svg>

                                        {getStatusLabel(s)}
                                    </div>

                                    {status === s && (
                                        <Icon
                                            name="selected"
                                            fill="var(--accent-1)"
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </DialogContent>
    );
}
