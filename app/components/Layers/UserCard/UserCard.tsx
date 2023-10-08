"use client";

import { useData, useLayers, useTooltip } from "@/lib/store";
import { translateCap, trimMessage } from "@/lib/strings";
import { AnimatePresence, motion } from "framer-motion";
import { getButtonColor } from "@/lib/colors/getColors";
import { useState, useRef, useEffect } from "react";
import useContextHook from "@/hooks/useContextHook";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { Icon } from "@components";

const colors = {
    ONLINE: "#22A559",
    IDLE: "#F0B232",
    DO_NOT_DISTURB: "#F23F43",
    INVISIBLE: "#80848E",
    OFFLINE: "#80848E",
};

const masks = {
    ONLINE: "",
    IDLE: "status-mask-idle",
    DO_NOT_DISTURB: "status-mask-dnd",
    INVISIBLE: "status-mask-offline",
    OFFLINE: "status-mask-offline",
};

export function UserCard({ content }: any) {
    const [note, setNote] = useState<string>("");
    const [originalNote, setOriginalNote] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [user, setUser] = useState<TCleanUser>(content.user);

    const { setShowSettings }: any = useContextHook({ context: "layer" });
    const currentUser = useData((state) => state.user) as TCleanUser;
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const { sendRequest } = useFetchHelper();

    const noteRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRendered = useRef<boolean>(false);
    const animation = content?.animation;
    const router = useRouter();

    useEffect(() => {
        if (!noteRef.current) return;

        if (noteRef.current.scrollHeight > noteRef.current.clientHeight) {
            noteRef.current.style.height = `${noteRef.current.scrollHeight}px`;
        }

        // If the note is less big than the textarea, reset the height
        if (noteRef.current.scrollHeight < noteRef.current.clientHeight) {
            noteRef.current.style.height = "auto";
        }
    }, [noteRef, note]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === "Enter" && e.shiftKey === false) {
                e.preventDefault();
                if (message.length > 0) {
                    setLayers({
                        settings: {
                            type: "USER_CARD",
                            setNull: true,
                        },
                    });

                    const channel = channels.find(
                        (channel) => channel.type === 0 && channel.recipientIds.includes(user.id)
                    );

                    let data;
                    if (!channel) {
                        data = await sendRequest({
                            query: "CHANNEL_CREATE",
                            data: { recipients: [user.id] },
                        });
                    }

                    const response = await sendRequest({
                        query: "SEND_MESSAGE",
                        params: {
                            channelId: channel?.id || (data?.channelId as string),
                        },
                        data: {
                            message: {
                                content: trimMessage(message),
                                attachments: [],
                                messageReference: null,
                            },
                        },
                    });

                    if (channel) router.push(`/channels/me/${channel.id}`);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [message]);

    useEffect(() => {
        if (!user) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setLayers({
                    settings: {
                        type: "USER_CARD",
                        setNull: true,
                    },
                });
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const getNote = async () => {
            const response = await sendRequest({
                query: "GET_NOTE",
                params: {
                    userId: user.id,
                },
            });

            if (response.success) {
                setNote(response.note);
                setOriginalNote(response.note);
            }
        };

        const env = process.env.NODE_ENV;

        if (env == "development") {
            if (hasRendered.current) getNote();
            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            getNote();
        }
    }, [user]);

    return (
        <AnimatePresence>
            {content?.user && (
                <motion.div
                    ref={containerRef}
                    className={styles.cardContainer}
                    style={
                        {
                            "--card-primary-color": user.primaryColor,
                            "--card-accent-color": user.accentColor,
                            "--card-overlay-color": "hsla(0, 0%, 0%, 0.6)",
                            "--card-background-color": "hsla(0, 0%, 0%, 0.45)",
                            "--card-background-hover": "hsla(0, 0%, 100%, 0.16)",
                            "--card-note-background": "hsla(0, 0%, 0%, 0.3)",
                            "--card-divider-color": "hsla(0, 0%, 100%, 0.24)",
                            "--card-button-color": getButtonColor(user.primaryColor, user.accentColor),
                            "--card-border-color": user.primaryColor,
                        } as React.CSSProperties
                    }
                    initial={{
                        transform: animation !== "OFF" ? `translateX(${animation === "LEFT" ? "-" : "+"}20px)` : "",
                    }}
                    animate={{ transform: "translateX(0px)" }}
                    transition={{ ease: "easeOut" }}
                >
                    <div>
                        {currentUser.id === user.id && (
                            <div
                                className={styles.editProfileButton}
                                aria-label="Edit Profile"
                                role="button"
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "Edit Profile",
                                        element: e.currentTarget,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setLayers({
                                        settings: {
                                            type: "USER_CARD",
                                            setNull: true,
                                        },
                                    });
                                    setShowSettings({
                                        type: "Profiles",
                                    });
                                }}
                            >
                                <Icon
                                    name="edit"
                                    size={18}
                                />
                            </div>
                        )}

                        <svg
                            className={styles.cardBanner}
                            viewBox={`0 0 340 ${user.banner ? "120" : "90"}`}
                        >
                            <mask id="card-banner-mask">
                                <rect
                                    fill="white"
                                    x="0"
                                    y="0"
                                    width="100%"
                                    height="100%"
                                />
                                <circle
                                    fill="black"
                                    cx="58"
                                    cy={user.banner ? 112 : 82}
                                    r="46"
                                />
                            </mask>

                            <foreignObject
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                overflow="visible"
                                mask="url(#card-banner-mask)"
                            >
                                <div>
                                    <div
                                        className={styles.cardBannerBackground}
                                        style={{
                                            backgroundColor: !user.banner ? user.primaryColor : "",
                                            backgroundImage: user.banner
                                                ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}/`
                                                : "",
                                            height: user.banner ? "120px" : "90px",
                                        }}
                                    />
                                </div>
                            </foreignObject>
                        </svg>

                        <div
                            className={styles.cardAvatar}
                            style={{ top: user.banner ? "76px" : "46px" }}
                        >
                            <div
                                className={styles.avatarImage}
                                style={{
                                    backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`,
                                }}
                                onClick={() => {
                                    setLayers({
                                        settings: {
                                            type: "USER_CARD",
                                            setNull: true,
                                        },
                                    });
                                    setLayers({
                                        settings: {
                                            type: "USER_PROFILE",
                                        },
                                        content: {
                                            user,
                                        },
                                    });
                                }}
                            />

                            <div className={styles.avatarOverlay}>{`View Profile`}</div>

                            <div
                                className={styles.cardAvatarStatus}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: translateCap(user.status),
                                        element: e.currentTarget,
                                        gap: 5,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <div style={{ backgroundColor: "black" }} />

                                <svg>
                                    <rect
                                        height="100%"
                                        width="100%"
                                        rx={8}
                                        ry={8}
                                        fill={colors[user.status as EUserStatus]}
                                        mask={`url(#${masks[user.status as EUserStatus]})`}
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className={styles.cardBadges}></div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardSection}>
                                <h4>{user.displayName}</h4>
                                <div>{user.username}</div>
                            </div>

                            {user.customStatus && (
                                <div className={styles.cardSection}>
                                    <div>{user.customStatus}</div>
                                </div>
                            )}

                            <div className={styles.cardDivider} />

                            {user.description && (
                                <div className={styles.cardSection}>
                                    <h4>About me</h4>
                                    <div>{user.description}</div>
                                </div>
                            )}

                            <div className={styles.cardSection}>
                                <h4>Chat App Member Since</h4>
                                <div>
                                    {new Intl.DateTimeFormat("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }).format(new Date(user.createdAt))}
                                </div>
                            </div>

                            <div className={styles.cardSection}>
                                <h4>Note</h4>
                                <div>
                                    <textarea
                                        className={styles.cardInput + " scrollbar"}
                                        ref={noteRef}
                                        value={note}
                                        placeholder="Click to add a note"
                                        aria-label="Note"
                                        maxLength={256}
                                        autoCorrect="off"
                                        onInput={(e) => {
                                            setNote(e.currentTarget.value);
                                        }}
                                        onBlur={async () => {
                                            if (note !== originalNote) {
                                                const response = await sendRequest({
                                                    query: "SET_NOTE",
                                                    params: {
                                                        userId: user.id,
                                                    },
                                                    data: {
                                                        newNote: trimMessage(note),
                                                    },
                                                });

                                                if (response.success) {
                                                    setOriginalNote(trimMessage(note));
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {currentUser.id !== user.id && (
                                <div className={styles.cardSection}>
                                    <input
                                        className={styles.cardMessage}
                                        value={message}
                                        placeholder={`Message @${user.username}`}
                                        aria-label={`Message @${user.username}`}
                                        maxLength={4000}
                                        autoCorrect="off"
                                        style={{ borderColor: user.primaryColor }}
                                        onChange={(e) => setMessage(e.currentTarget.value)}
                                    />
                                </div>
                            )}

                            {content.settings && (
                                <>
                                    <div className={styles.cardDivider + " " + styles.double} />

                                    <div
                                        className={styles.button}
                                        onMouseEnter={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    gap: 20,
                                                    firstSide: "RIGHT",
                                                },
                                                content: {
                                                    type: "STATUS",
                                                },
                                            });
                                        }}
                                    >
                                        <div className={styles.separator} />
                                        <svg className={styles.settingStatus}>
                                            <rect
                                                height="12px"
                                                width="12px"
                                                rx={8}
                                                ry={8}
                                                fill={colors[user.status as EUserStatus]}
                                                mask={`url(#${masks[user.status as EUserStatus]})`}
                                            />
                                        </svg>
                                        <div>{translateCap(user.status)}</div>
                                        <Icon name="arrow" />
                                    </div>

                                    <div
                                        className={styles.button}
                                        onClick={() => {
                                            setLayers({
                                                settings: {
                                                    type: "USER_CARD",
                                                    setNull: true,
                                                },
                                            });
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                },
                                                content: {
                                                    type: "USER_STATUS",
                                                    user,
                                                },
                                            });
                                        }}
                                    >
                                        <Icon name="smiling" />
                                        <div>{user.customStatus ? "Edit " : "Set "}Custom Status</div>

                                        {user.customStatus && (
                                            <div
                                                className={styles.deleteStatus}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const response = await sendRequest({
                                                        query: "UPDATE_USER",
                                                        data: {
                                                            customStatus: "",
                                                        },
                                                    });
                                                }}
                                            >
                                                <Icon
                                                    name="closeFilled"
                                                    viewbox="0 0 14 14"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.cardDivider + " " + styles.double} />

                                    <div
                                        className={styles.button}
                                        style={{ marginBottom: "8px" }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.id);
                                            setLayers({
                                                settings: {
                                                    type: "USER_CARD",
                                                    setNull: true,
                                                },
                                            });
                                        }}
                                    >
                                        <Icon name="id" />
                                        <div>Copy User ID</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
