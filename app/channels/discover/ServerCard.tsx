"use client";

import { getApiUrl, getCdnUrl } from "@/lib/uploadthing";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Discover.module.css";
import Image from "next/image";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogTrigger,
    Tooltip,
    Dialog,
    Icon,
} from "@/app/components";

export function ServerCard({ guild }: { guild: any }) {
    const [loading, setLoading] = useState(false);
    const [online, setOnline] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const getChannelInfo = async () => {
            const res = await fetch(`${getApiUrl}/guilds/${guild.id}/count`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            setOnline(data.count || 0);
        };

        getChannelInfo();
    }, []);

    async function joinGuild() {
        if (loading) return;
        setLoading(true);

        try {
            await fetch(`${getApiUrl}/guilds/join?vanity=${guild.vanityUrl}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
        } catch (e) {
            console.error(e);
        }

        setLoading(false);
    }

    return (
        <Dialog open={guild.isMember ? false : undefined}>
            <DialogTrigger>
                <InteractiveElement
                    element="li"
                    className={styles.guild}
                    onClick={() => {
                        if (!guild.isMember) return;
                        router.push(`/channels/${guild.id}/${guild.systemChannelId || ""}`);
                    }}
                >
                    <header>
                        <Image
                            width={300}
                            height={150}
                            draggable="false"
                            alt="Server Banner"
                            src={`${getCdnUrl}${guild.banner}`}
                        />

                        <div className={styles.icon}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 48 48"
                            >
                                <mask
                                    id="svg-mask-squircle"
                                    maskContentUnits="objectBoundingBox"
                                    viewBox="0 0 1 1"
                                >
                                    <path
                                        fill="white"
                                        d="M0 0.464C0 0.301585 0 0.220377 0.0316081 0.158343C0.0594114 0.103776 0.103776 0.0594114 0.158343 0.0316081C0.220377 0 0.301585 0 0.464 0H0.536C0.698415 0 0.779623 0 0.841657 0.0316081C0.896224 0.0594114 0.940589 0.103776 0.968392 0.158343C1 0.220377 1 0.301585 1 0.464V0.536C1 0.698415 1 0.779623 0.968392 0.841657C0.940589 0.896224 0.896224 0.940589 0.841657 0.968392C0.779623 1 0.698415 1 0.536 1H0.464C0.301585 1 0.220377 1 0.158343 0.968392C0.103776 0.940589 0.0594114 0.896224 0.0316081 0.841657C0 0.779623 0 0.698415 0 0.536V0.464Z"
                                    />
                                </mask>

                                <foreignObject
                                    x="0"
                                    y="0"
                                    width="48"
                                    height="48"
                                    overflow="visible"
                                    mask="url(#svg-mask-squircle)"
                                >
                                    <div className={styles.iconMask}>
                                        <svg
                                            width="40"
                                            height="40"
                                            viewBox="0 0 40 40"
                                        >
                                            <foreignObject
                                                x="0"
                                                y="0"
                                                width="40"
                                                height="40"
                                                overflow="visible"
                                                mask="url(#svg-mask-squircle)"
                                            >
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    draggable="false"
                                                    alt="Server Icon"
                                                    src={`${getCdnUrl}${guild.icon}`}
                                                />
                                            </foreignObject>
                                        </svg>
                                    </div>
                                </foreignObject>
                            </svg>
                        </div>
                    </header>

                    <main className={styles.content}>
                        <div>
                            {!guild.system && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={styles.badge}>
                                            <Icon
                                                size={16}
                                                name="flower-star"
                                                // @ts-ignore
                                                viewBox="0 0 16 15.2"
                                            />

                                            <Icon
                                                size={10}
                                                name="checkmark"
                                            />
                                        </div>
                                    </TooltipTrigger>

                                    <TooltipContent>Verified & Partnered</TooltipContent>
                                </Tooltip>
                            )}

                            <h2>{guild.name}</h2>
                        </div>

                        <p>{guild.description}</p>

                        <div className={styles.stats}>
                            <div>
                                <div />

                                <span>{online} Online</span>
                            </div>

                            <div>
                                <div />

                                <span>
                                    {guild.memberCount} Member{guild.memberCount === 1 ? "" : "s"}
                                </span>
                            </div>
                        </div>
                    </main>
                </InteractiveElement>
            </DialogTrigger>

            <DialogContent
                confirmLabel="Join"
                onConfirm={joinGuild}
                confirmLoading={loading}
                heading={`Join ${guild.name}`}
                description="Join this server to chat with other members."
            />
        </Dialog>
    );
}
