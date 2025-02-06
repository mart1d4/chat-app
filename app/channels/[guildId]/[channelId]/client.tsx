"use client";

import { AppHeader, ClickLayer, GuildChannels, MemberList } from "@/app/components";
import { doesUserHaveChannelPermission, type PERMISSIONS } from "@/lib/permissions";
import type { GuildChannel, GuildMember } from "@/type";
import styles from "../../me/FriendsPage.module.css";
import Content from "./Content";

export type HasPermissionFunction = (
    permission: keyof typeof PERMISSIONS,
    specificChannel?: GuildChannel,
    otherMember?: GuildMember
) => boolean;

export function GuildChannelPageClient({
    userId,
    allChannels,
    roles,
    channel,
    member,
    ownerId,
    guildId,
    channels,
    members,
}) {
    function hasPerm(
        permission: keyof typeof PERMISSIONS,
        specificChannel?: GuildChannel,
        otherMember?: any
    ) {
        return (
            doesUserHaveChannelPermission(
                allChannels,
                roles,
                specificChannel ?? channel,
                otherMember ?? member,
                permission
            ) || ownerId === (otherMember?.id ?? userId)
        );
    }

    return (
        <>
            <GuildChannels
                guildId={guildId}
                hasPerm={hasPerm}
                channels={channels}
            />

            <ClickLayer>
                <div className={styles.main}>
                    <AppHeader
                        initChannel={
                            {
                                ...channel,
                                recipients: members,
                            } as any
                        }
                    />

                    <div className={styles.content}>
                        <Content
                            guildId={guildId}
                            members={members}
                            hasPerm={hasPerm}
                            channel={{
                                ...channel,
                                recipients: members,
                            }}
                        />

                        <MemberList
                            guildId={guildId}
                            hasPerm={hasPerm}
                            channelId={channel.id}
                            initChannel={{
                                ...channel,
                                recipients: members,
                            }}
                        />
                    </div>
                </div>
            </ClickLayer>
        </>
    );
}
