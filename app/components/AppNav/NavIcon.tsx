"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@components";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGuildSettings } from "@/store/settings";
import { getRandomImage } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useData, useUrls } from "@/store";
import { isStillMuted } from "@/lib/mute";
import styles from "./AppNav.module.css";
import Link from "next/link";

export default function NavIcon({
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
    const [markHeight, setMarkHeight] = useState(0);
    const [active, setActive] = useState(false);

    const requests = useData((state) => state.received);
    const guildUrls = useUrls((state) => state.guilds);
    const meUrl = useUrls((state) => state.me);

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

    const { guilds } = useGuildSettings();
    const pathname = usePathname();
    const router = useRouter();

    const guildSettings = guilds[guild?.id];
    const isMuted = guildSettings
        ? isStillMuted(guildSettings.duration, guildSettings.started)
        : false;

    useEffect(() => {
        if (pathname.startsWith(special ? "/channels/me" : link)) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(hasUnread ? 7 : 0);
        }
    }, [pathname]);

    const firstLetters = name
        .split(" ")
        .map((word) => word[0])
        .join("");

    return (
        <div className={`${styles.navIcon} ${green ? styles.green : ""}`}>
            <div className={styles.marker}>
                <AnimatePresence>
                    {markHeight > 0 && (
                        <motion.span
                            initial={{
                                opacity: 0,
                                scale: 0,
                                height: 0,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                height: markHeight,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0,
                                height: 0,
                            }}
                            transition={{
                                duration: 0.15,
                                ease: "easeInOut",
                            }}
                        />
                    )}
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
                            className={`${styles.wrapper} ${active ? styles.active : ""}`}
                            onMouseEnter={() => !active && setMarkHeight(20)}
                            onMouseLeave={() => !active && setMarkHeight(hasUnread ? 7 : 0)}
                            style={{
                                fontWeight: !src && !svg ? "500" : "",
                                backgroundColor: src ? "transparent" : "",
                            }}
                        >
                            {((requests.length > 0 && special) ||
                                (pings !== undefined && pings > 0)) && (
                                <div
                                    className={styles.badgeContainer}
                                    style={{ width: requests.length > 99 ? "30px" : "" }}
                                >
                                    <div
                                        style={{
                                            width: requests.length > 99 ? "20px" : "",
                                            fontSize: requests.length > 99 ? "10px" : "",
                                        }}
                                    >
                                        {pings ? pings : requests.length}
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
}

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
