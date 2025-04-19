"use client";

import { Checkbox, DialogContent, Icon, Input, useDialogContext } from "@components";
import type { GuildChannel, UserGuild } from "@/type";
import styles from "./CreateGuildChannel.module.css";
import { useState } from "react";
import { useRequests } from "@/hooks/useRequests";

export function CreateGuildChannel({
    channel,
    guild,
    isCategory,
}: {
    channel?: GuildChannel;
    guild: UserGuild;
    isCategory?: boolean;
}) {
    const [type, setType] = useState("text");
    const [lock, setLock] = useState(false);
    const [name, setName] = useState("");

    const { createGuildChannel } = useRequests();
    const { setOpen } = useDialogContext();

    async function createChannel() {
        if (createGuildChannel.isLoading || !name) return;

        await createGuildChannel.send(
            {
                guildId: guild.id,
                body: {
                    name,
                    type: isCategory ? 4 : type === "text" ? 2 : 3,
                    locked: lock,
                    categoryId: channel?.id,
                },
            },
            {
                onComplete: () => {
                    setName("");
                    setLock(false);
                    setType("text");
                    setOpen(false);
                },
            }
        );
    }

    return (
        <DialogContent
            showClose
            width={460}
            noHeadingGap
            confirmDisabled={!name}
            onConfirm={createChannel}
            confirmLoading={createGuildChannel.isLoading}
            description={channel ? `In ${channel.name}` : ""}
            heading={`Create ${isCategory ? "Category" : "Channel"}`}
            confirmLabel={lock ? "Next" : `Create ${isCategory ? "Category" : "Channel"}`}
        >
            {!isCategory && (
                <div className={styles.channelType}>
                    <Input
                        value={type}
                        type="radio"
                        radioSide="right"
                        label="Channel Type"
                        onChange={(v) => setType(v as string)}
                        choices={[
                            {
                                label: "Text",
                                value: "text",
                                icon: lock ? "hashtagLock" : "hashtag",
                                description:
                                    "Send messages, images, GIFs, emoji, opinions, and puns",
                            },
                            {
                                label: "Voice",
                                value: "voice",
                                icon: lock ? "voiceLock" : "voice",
                                description:
                                    "Hang out together with voice, video, and screen share",
                            },
                        ]}
                    />
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
                    isCategory ? undefined : (
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
                leftItemSmall={isCategory ? undefined : true}
            />

            <div className={styles.privateCheck}>
                <div className="flex items-center gap-2">
                    <Icon
                        name="lock"
                        size={18}
                    />

                    <div className="grow">
                        <Input
                            value={lock}
                            type="checkbox"
                            onChange={(v) => setLock(v as boolean)}
                            label={isCategory ? "Private Category" : "Private Channel"}
                        />
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
