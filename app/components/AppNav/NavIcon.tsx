"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useData, useLayers, useUrls } from "@/store";
import { useState, useEffect } from "react";
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
    count,
    user,
}: {
    green?: boolean;
    special?: boolean;
    guild?: any;
    name: string;
    link: string;
    src?: string;
    svg?: JSX.Element;
    count?: number;
    user?: any;
}) {
    const [markHeight, setMarkHeight] = useState(0);
    const [active, setActive] = useState(false);

    const setLayers = useLayers((state) => state.setLayers);
    const requests = useData((state) => state.received);
    const guildUrls = useUrls((state) => state.guilds);
    const layers = useLayers((state) => state.layers);
    const meUrl = useUrls((state) => state.me);

    let url;
    if (special) {
        url = !meUrl ? "/channels/me" : `/channels/me/${meUrl}`;
    } else if (guild) {
        const guildUrl = guildUrls.find((obj) => obj.guildId === guild.id);
        url = guildUrl ? `/channels/${guild.id}/${guildUrl.channelId}` : `/channels/${guild.id}`;
    } else {
        url = link;
    }

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname.startsWith(special ? "/channels/me" : link)) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(count ? 7 : 0);
        }
    }, [pathname, special, guild, link, count]);

    let firstLetters =
        name
            .toLowerCase()
            .match(/\b(\w)/g)
            ?.join("") ?? "";

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
                placement="right"
                gap={15}
                big
            >
                <TooltipTrigger>
                    {name !== "Add a Server" ? (
                        <Link
                            href={url}
                            className={`${styles.wrapper} ${active ? styles.active : ""}`}
                            onMouseEnter={() => !active && setMarkHeight(20)}
                            onMouseLeave={() => !active && setMarkHeight(count ? 7 : 0)}
                            onFocus={() => !active && setMarkHeight(20)}
                            onBlur={() => !active && setMarkHeight(count ? 7 : 0)}
                            onClick={() => router.push(link)}
                            onContextMenu={(event) => {
                                setLayers({
                                    settings: { type: "MENU", event },
                                    content: {
                                        type: guild ? "GUILD_ICON" : "USER",
                                        guild,
                                        user,
                                    },
                                });
                            }}
                            style={{
                                fontSize:
                                    !src && !svg
                                        ? firstLetters?.length < 3
                                            ? "18px"
                                            : firstLetters?.length < 4
                                            ? "16px"
                                            : firstLetters?.length < 5
                                            ? "14px"
                                            : firstLetters?.length < 6
                                            ? "12px"
                                            : "10px"
                                        : "",
                                backgroundColor: src ? "transparent" : "",
                            }}
                        >
                            {((requests.length > 0 && special) ||
                                (count !== undefined && count > 0)) && (
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
                                        {count ? count : requests.length}
                                    </div>
                                </div>
                            )}

                            {src ? (
                                <img
                                    src={src}
                                    alt={name}
                                />
                            ) : svg ? (
                                svg
                            ) : (
                                firstLetters
                            )}
                        </Link>
                    ) : (
                        <button
                            className={`${styles.wrapper} ${styles.add} ${
                                active ||
                                layers?.POPUP?.find((obj) => obj.content.type === "CREATE_GUILD")
                                    ? styles.active
                                    : ""
                            }`}
                            onClick={() => {
                                setLayers({
                                    settings: { type: "POPUP" },
                                    content: { type: "CREATE_GUILD" },
                                });
                            }}
                        >
                            {svg && svg}
                        </button>
                    )}
                </TooltipTrigger>

                <TooltipContent>{name}</TooltipContent>
            </Tooltip>
        </div>
    );
}
