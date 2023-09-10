"use client";

import { useState, useEffect, ReactElement, ReactNode } from "react";
import { useData, useLayers, useTooltip, useUrls } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import styles from "./AppNav.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
    green?: boolean;
    special?: boolean;
    guild?: TGuild;
    name: string;
    link: string;
    src?: string;
    svg?: ReactNode;
    count?: number;
    user?: TUser;
};

const NavIcon = ({ green, special, guild, name, link, src, svg, count, user }: Props): ReactElement => {
    const [active, setActive] = useState<boolean>(false);
    const [markHeight, setMarkHeight] = useState<number>(0);

    const requests = useData((state) => state.requestsReceived);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const guildUrls = useUrls((state) => state.guilds);
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
        if (special ? pathname.startsWith("/channels/me") : guild ? pathname.startsWith(link) : pathname === link) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(count ? 7 : 0);
        }
    }, [pathname, link, count]);

    let firstLetters =
        name
            .toLowerCase()
            .match(/\b(\w)/g)
            ?.join("") ?? "";

    return (
        <div className={green ? styles.navIcon + " " + styles.green : styles.navIcon}>
            <div className={styles.marker}>
                {markHeight > 0 && (
                    <motion.span
                        initial={{
                            opacity: 0,
                            scale: 0,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            height: markHeight,
                        }}
                        transition={{
                            duration: 0.15,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </div>

            {name !== "Add a Server" ? (
                <Link
                    href={url}
                    className={active ? styles.wrapperActive : styles.wrapper}
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
                            style={{
                                width: requests.length > 99 ? "30px" : "",
                            }}
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
                            style={{ borderRadius: active ? "33%" : "50%" }}
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
                    className={active ? styles.wrapperActive : styles.wrapper}
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
                >
                    {svg && svg}
                </button>
            )}
        </div>
    );
};

export default NavIcon;
