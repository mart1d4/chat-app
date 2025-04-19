"use client";

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from "@components";
import { useActiveVoice, useData, useUrls } from "@/store";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTracks } from "@livekit/components-react";
import { isChannelPrivate } from "@/lib/permissions";
import { useGuildSettings } from "@/store/settings";
import { useRequests } from "@/hooks/useRequests";
import { getRandomImage } from "@/lib/utils";
import type { GuildChannel } from "@/type";
import { isStillMuted } from "@/lib/mute";
import styles from "./AppNav.module.css";
import { Track } from "livekit-client";
import { useState } from "react";
import Link from "next/link";

export const NavIcon = function NavIcon({
    voice,
    green,
    special,
    guild,
    name,
    link,
    src,
    svg,
    pings,
    hasUnread,
    channelType,
}: {
    voice?: boolean;
    green?: boolean;
    special?: boolean;
    guild?: any;
    name: string;
    link: string;
    src?: string | number;
    svg?: JSX.Element;
    pings?: number;
    hasUnread?: boolean;
    channelType?: number;
}) {
    const [hovering, setHovering] = useState(false);

    const { guilds: guildUrls, me: meUrl } = useUrls();
    const { received, updateGuild } = useData();
    const { getGuildChannels } = useRequests();
    const { guilds } = useGuildSettings();
    const pathname = usePathname();
    const router = useRouter();

    const currentGuild = useData((s) => s.guilds).find((g) => g.id === guild?.id);

    const guildHasVoice = useActiveVoice((s) => s.rooms).find((r) => r.guildId === guild?.id);
    voice = voice || !!guildHasVoice;

    const cameraTracks = useTracks([Track.Source.Camera]);
    const streamTracks = useTracks([Track.Source.ScreenShare]);

    let url;
    if (special) {
        url = !meUrl ? "/channels/me" : `/channels/me/${meUrl}`;
    } else if (guild) {
        const guildUrl = guildUrls.find((obj) => obj.guildId === guild.id);
        url = guildUrl
            ? `/channels/${guild.id}/${guildUrl.channelId || guild.systemChannelId || ""}`
            : `/channels/${guild.id}` + (guild.systemChannelId ? `/${guild.systemChannelId}` : "");
    } else {
        url = link;
    }

    const guildSettings = guilds[guild?.id];
    const isMuted = guildSettings
        ? isStillMuted(guildSettings.duration, guildSettings.started)
        : false;

    const isActive = pathname.startsWith(special ? "/channels/me" : link);

    const firstLetters = name
        .split(" ")
        .map((word) => word[0])
        .join("");

    return (
        <div className={`${styles.navIcon} ${green ? styles.green : ""}`}>
            <div className={styles.marker}>
                <AnimatePresence>
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0,
                            height: 0,
                            width: 4,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            width: isActive || hovering || hasUnread ? 8 : 0,
                            height: isActive ? 40 : hovering ? 20 : hasUnread ? 7 : 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                            height: 0,
                            width: 0,
                        }}
                        transition={{
                            duration: 0.15,
                            ease: "easeInOut",
                        }}
                    />
                </AnimatePresence>
            </div>

            <Tooltip
                big
                gap={15}
                placement="right"
            >
                <TooltipTrigger>
                    {name !== "Add a Server" ? (
                        <Link
                            href={url}
                            onClick={() => router.push(link)}
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                            className={`${styles.wrapper} ${isActive ? styles.active : ""}`}
                            style={{
                                fontWeight: !src && !svg ? "500" : "",
                                backgroundColor: src ? "transparent" : "",
                            }}
                        >
                            {((received.length > 0 && special) ||
                                (pings !== undefined && pings > 0)) && (
                                <div
                                    className={styles.badgeContainer}
                                    style={{
                                        width: (received.length || pings || 0) > 9 ? "30px" : "",
                                    }}
                                >
                                    <div
                                        style={{
                                            width:
                                                (received.length || pings || 0) > 9 ? "20px" : "",
                                            fontSize:
                                                (received.length || pings || 0) > 9 ? "11px" : "",
                                        }}
                                    >
                                        {pings ? pings : received.length}
                                    </div>
                                </div>
                            )}

                            {voice && (
                                <div className={styles.topBadge}>
                                    <div>
                                        <Icon
                                            size={12}
                                            name={
                                                !!streamTracks.length
                                                    ? "screen"
                                                    : !!cameraTracks.length
                                                    ? "video"
                                                    : "voice"
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {src ? (
                                <img
                                    src={
                                        typeof src === "string"
                                            ? src
                                            : channelType === 1
                                            ? getRandomImage(src, "icon")
                                            : getRandomImage(src, "avatar")
                                    }
                                    alt={name}
                                />
                            ) : svg ? (
                                svg
                            ) : (
                                <span
                                    style={{
                                        fontSize: getFontSize(firstLetters.length),
                                    }}
                                >
                                    {firstLetters}
                                </span>
                            )}
                        </Link>
                    ) : (
                        <button
                            className={`${styles.wrapper} ${styles.add} ${
                                // active ||
                                // layers?.POPUP?.find((obj) => obj.content.type === "CREATE_GUILD")
                                //     ? styles.active
                                //     : ""
                                "e"
                            }`}
                            onClick={() => {
                                // setLayers({
                                //     settings: { type: "POPUP" },
                                //     content: { type: "CREATE_GUILD" },
                                // });
                            }}
                        >
                            {svg && svg}
                        </button>
                    )}
                </TooltipTrigger>

                <TooltipContent>
                    <div>{name}</div>
                    {isMuted && <span data-muted>Muted</span>}
                </TooltipContent>
            </Tooltip>
        </div>
    );
};

function getFontSize(length: number) {
    if (length < 3) {
        return "18px";
    } else if (length < 4) {
        return "16px";
    } else if (length < 5) {
        return "14px";
    } else if (length < 6) {
        return "12px";
    } else {
        return "10px";
    }
}
