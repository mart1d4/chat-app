"use client";

import { Checkbox, DialogContent, Icon, Input, useDialogContext } from "@components";
import useRequestHelper from "@/hooks/useFetchHelper";
import type { AppGuild, GuildChannel } from "@/type";
import styles from "./CreateGuildChannel.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateGuildChannel({
    channel,
    guild,
    isCategory,
}: {
    channel?: GuildChannel;
    guild: AppGuild;
    isCategory?: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("text");
    const [lock, setLock] = useState(false);
    const [name, setName] = useState("");

    const { sendRequest } = useRequestHelper();
    const { setOpen } = useDialogContext();

    async function createChannel() {
        if (loading || !name) return;
        setLoading(true);

        try {
            const { data } = await sendRequest({
                query: "GUILD_CHANNEL_CREATE",
                params: {
                    guildId: guild.id,
                },
                body: {
                    name,
                    type: isCategory ? 4 : type === "text" ? 2 : 3,
                    locked: lock,
                    categoryId: channel?.id,
                },
            });

            if (data?.channelId) {
                setName("");
                setLock(false);
                setType("text");
                setOpen(false);
            }
        } catch (e) {
            console.error(e);
        }

        setLoading(false);
    }

    return (
        <DialogContent
            showClose
            width={460}
            noHeadingGap
            confirmDisabled={!name}
            confirmLoading={loading}
            onConfirm={createChannel}
            description={channel ? `In ${channel.name}` : ""}
            heading={`Create ${isCategory ? "Category" : "Channel"}`}
            confirmLabel={lock ? "Next" : `Create ${isCategory ? "Category" : "Channel"}`}
        >
            {!isCategory && (
                <div className={styles.channelType}>
                    <h2>Channel Type</h2>

                    {["text", "voice"].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`${styles.typePick} ${type === t ? styles.active : ""}`}
                        >
                            <div>
                                <div className={styles.check}>
                                    <Icon name={type === t ? "circleChecked" : "circle"} />
                                </div>

                                <div>
                                    <div className={styles.icon}>
                                        <Icon
                                            name={
                                                lock
                                                    ? t === "text"
                                                        ? "hashtagLock"
                                                        : "voiceLock"
                                                    : t === "text"
                                                    ? "hashtag"
                                                    : "voice"
                                            }
                                        />
                                    </div>

                                    <div className={styles.content}>
                                        <h3>{t === "text" ? "Text" : "Voice"}</h3>

                                        <div>
                                            {t === "text"
                                                ? "Send messages, images, GIFs, emoji, opinions, and puns"
                                                : "Hang out together with voice, video, and screen share"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <Input
                required
                value={name}
                maxLength={100}
                name="channel-name"
                label="Channel name"
                onChange={(v) => setName(v as string)}
                placeholder={isCategory ? "New Category" : "new-channel"}
                leftItem={
                    !isCategory && (
                        <Icon
                            size={16}
                            name={
                                type === "text"
                                    ? lock
                                        ? "hashtagLock"
                                        : "hashtag"
                                    : lock
                                    ? "voiceLock"
                                    : "voice"
                            }
                        />
                    )
                }
                leftItemSmall
            />

            <div className={styles.privateCheck}>
                <div onClick={() => setLock((prev) => !prev)}>
                    <label>
                        <Icon name="lock" />
                        {isCategory ? "Private Category" : "Private Channel"}
                    </label>

                    <div>
                        <Checkbox checked={lock} />
                    </div>
                </div>

                <div>
                    {isCategory
                        ? "By making a category private, only selected members and roles will be able to view this category. Synced channels in this category will automatically match to this setting."
                        : "Only selected members and roles will be able to view this channel."}
                </div>
            </div>
        </DialogContent>
    );
}
