"use client";

import { getCdnUrl, useUploadThing } from "@/lib/uploadthing";
import { AnimatePresence, motion } from "framer-motion";
import { Input, Icon, LoadingDots } from "@components";
import { useData, useTriggerAlert } from "@/store";
import { useMemo, useRef, useState } from "react";
import { useRequests } from "@/hooks/useRequests";
import styles from "../../Settings.module.css";
import NextImage from "next/image";

export function Overview({ guildId }: { guildId: number }) {
    const guild = useData((state) => state.guilds.find((g) => g.id === guildId));
    const { triggerAlert } = useTriggerAlert();
    const { updateGuild } = useRequests();

    if (!guild) return null;

    const channels = useMemo(() => {
        return guild.channels
            .filter((c) => [2, 3].includes(c.type))
            .map((channel) => {
                const category = guild.channels.find((c) => c.id === channel.parentId);
                const icon = channel.type === 2 ? "hashtag" : "voice";

                return {
                    type: channel.type,
                    label: channel.name,
                    value: channel.id,
                    description: category ? category.name : undefined,
                    icon: channel.isPrivate ? `${icon}Lock` : icon,
                };
            });
    }, [guild.channels]);

    const timeouts = [1, 5, 15, 30, 60].map((t) => ({
        label: t === 60 ? "1 hour" : `${t} minute${t > 1 ? "s" : ""}`,
        value: t,
    }));

    const textChannels = useMemo(() => {
        return [
            {
                label: "No System Messages",
                value: null,
            },
            ...channels.filter((c) => c.type === 2),
        ];
    }, [channels]);

    const voiceChannels = useMemo(() => {
        return [
            {
                label: "No Inactive Channel",
                value: null,
            },
            ...channels.filter((c) => c.type === 3),
        ];
    }, [channels]);

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(guild.name);
    const [icon, setIcon] = useState<string | File | null>(guild.icon);
    const [banner, setBanner] = useState<string | File | null>(guild.banner);
    const [inactiveChannel, setInactiveChannel] = useState(guild.afkChannelId);
    const [innactiveTimeout, setInactiveTimeout] = useState(guild.afkTimeout);
    const [systemChannel, setSystemChannel] = useState(guild.systemChannelId);
    const [welcomeMessage, setWelcomeMessage] = useState(!!guild.sendWelcomeMessages);
    const [notifyEveryone, setNotifyEveryone] = useState(!!guild.notifyEveryone);
    const [bannerId, setBannerId] = useState<string | null>(null);
    const [iconId, setIconId] = useState<string | null>(null);

    const iconRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    const { startUpload: uploadIcon } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            setIconId(fileId);
            save();
        },
        onUploadError: (error) => {
            console.error(error);
            triggerAlert("error", "An error occured while uploading your icon");
            setIsLoading(false);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const { startUpload: uploadBanner } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            if (!fileId) throw new Error("No file ID returned from cdn.");
            setBannerId(fileId);
            save();
        },
        onUploadError: (error) => {
            console.error(error);
            triggerAlert("error", "An error occured while uploading your banner");
            setIsLoading(false);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const needsSaving = useMemo(() => {
        return (
            guild.name !== name ||
            guild.icon !== icon ||
            guild.banner !== banner ||
            guild.afkChannelId !== inactiveChannel ||
            guild.afkTimeout !== innactiveTimeout ||
            guild.systemChannelId !== systemChannel ||
            !!guild.sendWelcomeMessages !== welcomeMessage ||
            !!guild.notifyEveryone !== notifyEveryone
        );
    }, [
        guild,
        name,
        icon,
        banner,
        inactiveChannel,
        innactiveTimeout,
        systemChannel,
        welcomeMessage,
        notifyEveryone,
    ]);

    function resetState() {
        if (!guild) return;

        setName(guild.name);
        setIcon(guild.icon);
        setBanner(guild.banner);
        setInactiveChannel(guild.afkChannelId);
        setInactiveTimeout(guild.afkTimeout);
        setSystemChannel(guild.systemChannelId);
        setWelcomeMessage(!!guild.sendWelcomeMessages);
        setNotifyEveryone(!!guild.notifyEveryone);
    }

    async function save() {
        if (icon instanceof File && !iconId) {
            setIsLoading(true);
            await uploadIcon([icon]);
            setIsLoading(false);
            return;
        }

        if (banner instanceof File && !bannerId) {
            setIsLoading(true);
            await uploadBanner([banner]);
            setIsLoading(false);
            return;
        }

        updateGuild.send(
            {
                guildId,
                updates: {
                    name,
                    icon: iconId || undefined,
                    banner: bannerId || undefined,
                    afkChannelId: inactiveChannel,
                    afkTimeout: innactiveTimeout,
                    systemChannelId: systemChannel,
                    sendWelcomeMessages: welcomeMessage,
                    notifyEveryone: notifyEveryone,
                },
            },
            {
                onComplete: () => {
                    if (iconId) {
                        setIcon(iconId);
                        setIconId(null);
                    }

                    if (bannerId) {
                        setBanner(bannerId);
                        setBannerId(null);
                    }

                    setIsLoading(false);
                },
            }
        );
    }

    const variants = {
        enter: {
            y: 0, // Starts at the final position
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
            },
        },
        exit: {
            y: [0, -40, 1000], // Moves up slightly, then plunges down
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1], // Snappy easing
            },
        },
        initial: {
            y: 250, // Starts off-screen at the bottom
        },
    };

    return (
        <div>
            <div className={styles.sectionTitle}>
                <h2>Server Overview</h2>
            </div>

            <div>
                <div>
                    <section className={`${styles.customSection} ${styles.flex}`}>
                        <div className="flex gap-5 select-none">
                            <div className="min-w-[120px] flex flex-col items-center justify-center">
                                <div className="w-[100px] h-[100px] bg-(--accent-0) rounded-full relative flex items-center justify-center">
                                    <div className="w-full h-full rounded-full shadow-(--elevation-high) peer">
                                        <input
                                            type="file"
                                            ref={iconRef}
                                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                            className="absolute top-0 left-0 w-full h-full cursor-pointer rounded-full opacity-0"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const file = e.target.files[0];

                                                    const img = new Image();
                                                    img.src = URL.createObjectURL(file);

                                                    img.onload = () => {
                                                        if (img.width < 128 || img.height < 128) {
                                                            return triggerAlert(
                                                                "error",
                                                                "Image size should be at least 128x128"
                                                            );
                                                        }
                                                    };

                                                    if (file.size > 4 * 1024 * 1024) {
                                                        return triggerAlert(
                                                            "error",
                                                            "File size should be less than 4MB"
                                                        );
                                                    }

                                                    setIcon(file);
                                                }
                                            }}
                                        />

                                        {icon &&
                                            (typeof icon === "string" ? (
                                                <NextImage
                                                    width={100}
                                                    height={100}
                                                    alt="Current Icon"
                                                    src={`${getCdnUrl}${icon}`}
                                                    className="rounded-full fit-cover w-[100px] h-[100px] hover:shadow-[inset_0_0_120px_rgba(0,0,0,.6)]"
                                                />
                                            ) : (
                                                <NextImage
                                                    width={100}
                                                    height={100}
                                                    alt="Chosen Icon"
                                                    src={URL.createObjectURL(icon)}
                                                    className="rounded-full fit-cover w-[100px] h-[100px] peer-hover:shadow-[inset_0_0_120px_rgba(0,0,0,.6)]"
                                                />
                                            ))}
                                    </div>

                                    {!icon && (
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-2xl font-medium text-white pointer-events-none peer-hover:hidden overflow-hidden">
                                            {name.split(" ").map((n) => n[0])}
                                        </div>
                                    )}

                                    <div className="peer-hover:shadow-[inset_0_0_120px_rgba(0,0,0,.6)] z-10 absolute top-0 left-0 w-full h-full pointer-events-none rounded-full" />

                                    <div className="absolute top-0 right-[-10px] w-[28px] h-[28px] flex items-center justify-center bg-white text-gray-600 rounded-full z-30">
                                        <Icon
                                            size={16}
                                            name="upload"
                                        />
                                    </div>

                                    <div className="subtitle text-center text-[10px] mb-0 text-(--fg-1) absolute bottom-0 left-0 right-0 top-0 items-center justify-center pointer-events-none hidden peer-hover:flex peer-focus:flex z-20">
                                        Change
                                        <br />
                                        Icon
                                    </div>
                                </div>

                                {icon ? (
                                    <button
                                        onClick={() => setIcon(null)}
                                        className="mt-2.5 text-sm font-semibold hover:text-(--fg-1) cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <small className="text-xs text-gray-400 mt-2">
                                        Minimum Size: <strong>128x128</strong>
                                    </small>
                                )}
                            </div>

                            <div>
                                <p className="text-sm mb-4">
                                    We recommend an image of at least 512x512 for the server.
                                </p>

                                <button
                                    className="button regular submit grey"
                                    onClick={() => {
                                        if (iconRef.current) iconRef.current.click();
                                    }}
                                >
                                    Upload Image
                                </button>
                            </div>
                        </div>

                        <Input
                            value={name}
                            label="Server Name"
                            onChange={(v) => setName(v)}
                        />
                    </section>

                    <section className={styles.customSection}>
                        <div className={styles.flex}>
                            <Input
                                type="select"
                                value={inactiveChannel}
                                choices={voiceChannels}
                                label="Inactive Channel"
                                onChange={(v) => setInactiveChannel(v)}
                            />

                            <Input
                                type="select"
                                choices={timeouts}
                                value={innactiveTimeout}
                                label="Inactive Timeout"
                                disabled={!inactiveChannel}
                                onChange={(v) => {
                                    if (!inactiveChannel) return;
                                    setInactiveTimeout(v);
                                }}
                            />
                        </div>

                        <p className="description">
                            Automatically move members to this channel and mute them when they have
                            been idle for longer than the inactive timeout. This does not affect
                            browsers.
                        </p>
                    </section>

                    <section className={styles.customSection}>
                        <Input
                            type="select"
                            value={systemChannel}
                            choices={textChannels}
                            label="System Messages Channel"
                            onChange={(v) => setSystemChannel(v)}
                        />

                        <p className="description mb-4">
                            This is the channel we send system event messages to. These can be
                            turned off at any time.
                        </p>

                        <Input
                            type="checkbox"
                            value={welcomeMessage}
                            disabled={!systemChannel}
                            onChange={(v) => setWelcomeMessage(v)}
                            label="Send a random welcome message when someone joins this server."
                        />
                    </section>

                    <section className={styles.customSection}>
                        <label className="subtitle">Default notification settings</label>

                        <p className="description mb-4">
                            This will determine whether members who have not explicitly set their
                            notification settings receive a notification for every message sent in
                            this server or not. <br /> <br />
                            We highly recommend setting this to only @mentions for a Community
                            Server.
                        </p>

                        <Input
                            type="radio"
                            value={notifyEveryone}
                            choices={[
                                {
                                    label: "All Messages",
                                    value: true,
                                },
                                {
                                    label: "Only @mentions",
                                    value: false,
                                },
                            ]}
                            onChange={(v) => setNotifyEveryone(v)}
                        />
                    </section>
                </div>
            </div>

            <AnimatePresence>
                {needsSaving && (
                    <motion.div
                        className={styles.saveAlert}
                        variants={variants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                    >
                        <p>Careful — you have unsaved changes!</p>

                        <div>
                            <button
                                type="button"
                                onClick={resetState}
                                className="button regular underline"
                            >
                                Reset
                            </button>

                            <button
                                onClick={save}
                                className="button regular green"
                            >
                                {isLoading || updateGuild.isLoading ? (
                                    <LoadingDots />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
