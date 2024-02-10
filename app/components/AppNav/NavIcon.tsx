"use client";

import { useData, useLayers, useTooltip, useUrls } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

    const requests = useData((state) => state.received);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
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

            {name !== "Add a Server" ? (
                <Link
                    href={url}
                    className={`${styles.wrapper} ${active ? styles.active : ""}`}
                    onMouseEnter={(e) => {
                        setTooltip({
                            text: name,
                            element: e.currentTarget,
                            position: "RIGHT",
                            gap: 15,
                            big: true,
                        });
                        if (!active) setMarkHeight(20);
                    }}
                    onMouseLeave={() => {
                        setTooltip(null);
                        if (!active) setMarkHeight(count ? 7 : 0);
                    }}
                    onFocus={(e) => {
                        setTooltip({
                            text: name,
                            element: e.currentTarget,
                            position: "RIGHT",
                            gap: 15,
                            big: true,
                        });
                        if (!active) setMarkHeight(20);
                    }}
                    onBlur={() => {
                        setTooltip(null);
                        if (!active) setMarkHeight(count ? 7 : 0);
                    }}
                    onClick={() => router.push(link)}
                    onContextMenu={(e) => {
                        if (guild) {
                            setLayers({
                                settings: {
                                    type: "MENU",
                                    event: e,
                                },
                                content: {
                                    type: "GUILD_ICON",
                                    guild: guild,
                                },
                            });
                        } else if (user) {
                            setLayers({
                                settings: {
                                    type: "MENU",
                                    event: e,
                                },
                                content: {
                                    type: "USER",
                                    user: user,
                                },
                            });
                        }
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
                    {((requests.length > 0 && special) || (count !== undefined && count > 0)) && (
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
                        active || layers?.POPUP?.find((obj) => obj.content.type === "CREATE_GUILD")
                            ? styles.active
                            : ""
                    }`}
                    onMouseEnter={(e) => {
                        setTooltip({
                            text: name,
                            element: e.currentTarget,
                            position: "RIGHT",
                            gap: 15,
                            big: true,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "CREATE_GUILD",
                            },
                        });
                    }}
                    onFocus={(e) => {
                        setTooltip({
                            text: name,
                            element: e.currentTarget,
                            position: "RIGHT",
                            gap: 15,
                            big: true,
                        });
                    }}
                    onBlur={() => setTooltip(null)}
                >
                    {svg && svg}
                </button>
            )}
        </div>
    );
}
