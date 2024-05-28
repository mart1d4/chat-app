"use client";

import { TooltipContent, TooltipTrigger, Tooltip } from "../Tooltip/Tooltip";
import { useData, useLayers, useShowSettings } from "@/store";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getButtonColor } from "@/lib/getColors";
import { sanitizeString } from "@/lib/strings";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { statuses } from "@/lib/statuses";
import { Icon } from "@components";

const colors = {
    online: "#22A559",
    idle: "#F0B232",
    dnd: "#F23F43",
    invisible: "#80848E",
    offline: "#80848E",
};

const masks = {
    online: "",
    idle: "status-mask-idle",
    dnd: "status-mask-dnd",
    invisible: "status-mask-offline",
    offline: "status-mask-offline",
};

export function UserCard({ content }: any) {
    const [note, setNote] = useState("");
    const [originalNote, setOriginalNote] = useState("");
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(content.user);

    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const setLayers = useLayers((state) => state.setLayers);
    const channels = useData((state) => state.channels);
    const currentUser = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const noteRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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
        async function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                if (message.length > 0) {
                    setLayers({
                        settings: { type: "USER_CARD", setNull: true },
                    });

                    // Check whether channel exists
                    const channel = channels.find((channel) => {
                        if (channel.type === 0) {
                            return channel.recipients.every((r) =>
                                [user.id, currentUser.id].includes(r)
                            );
                        }
                    });

                    let channelId;
                    if (!channel) {
                        const response = await sendRequest({
                            query: "CHANNEL_CREATE",
                            body: { recipients: [user.id] },
                        });

                        if (response.data.channel) {
                            channelId = response.data.channel.id;
                        } else {
                            return console.error("Failed to create channel");
                        }
                    }

                    await sendRequest({
                        query: "SEND_MESSAGE",
                        params: {
                            channelId: channel ? channel.id : channelId,
                        },
                        body: {
                            message: {
                                content: sanitizeString(message),
                                attachments: [],
                                messageReference: null,
                            },
                        },
                    });

                    if (channel || channelId) {
                        router.push(`/channels/me/${channel.id || channelId}`);
                    }
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [message]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setLayers({
                    settings: {
                        type: "USER_CARD",
                        setNull: true,
                    },
                });
            }
        }

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    useEffect(() => {
        if (!user) return;

        const getNote = async () => {
            const response = await sendRequest({
                query: "GET_NOTE",
                params: { userId: user.id },
            });

            if (response?.ok) {
                const data = await response.json();
                setNote(data.note);
                setOriginalNote(data.note);
            }
        };

        getNote();
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
                            "--card-button-color": getButtonColor(
                                user.primaryColor,
                                user.accentColor
                            ),
                            "--card-border-color": user.primaryColor,
                        } as React.CSSProperties
                    }
                    initial={{
                        transform:
                            animation !== "OFF"
                                ? `translateX(${animation === "LEFT" ? "-" : "+"}20px)`
                                : "",
                    }}
                    animate={{ transform: "translateX(0px)" }}
                    transition={{ ease: "easeOut" }}
                >
                    <div>
                        {currentUser.id === user.id && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        className={styles.editProfileButton}
                                        onClick={() =>
                                            setShowSettings({ type: "USER", tab: "Profiles" })
                                        }
                                    >
                                        <Icon
                                            name="edit"
                                            size={18}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Edit Profile</TooltipContent>
                            </Tooltip>
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
                                                ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}`
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
                                    backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}`,
                                }}
                                onClick={() => {
                                    setLayers({
                                        settings: { type: "USER_PROFILE" },
                                        content: { user },
                                    });
                                }}
                            />

                            <div className={styles.avatarOverlay}>{`View Profile`}</div>

                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={styles.cardAvatarStatus}>
                                        <div style={{ backgroundColor: "black" }} />

                                        <svg>
                                            <rect
                                                height="100%"
                                                width="100%"
                                                rx={8}
                                                ry={8}
                                                fill={colors[user.status as keyof typeof colors]}
                                                mask={`url(#${
                                                    masks[user.status as keyof typeof masks]
                                                })`}
                                            />
                                        </svg>
                                    </div>
                                </TooltipTrigger>

                                <TooltipContent>{statuses[user.status]}</TooltipContent>
                            </Tooltip>
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
                                <h4>Spark Member Since</h4>
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
                                                    params: { userId: user.id },
                                                    body: { note: sanitizeString(note) },
                                                });

                                                if (response.success) {
                                                    setOriginalNote(sanitizeString(note));
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

                                    <button
                                        className={styles.button}
                                        onMouseEnter={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    gap: 20,
                                                    firstSide: "RIGHT",
                                                },
                                                content: { type: "STATUS" },
                                            });
                                        }}
                                        onMouseLeave={(e) => {
                                            const menu = document.querySelector("#status-menu");
                                            if (!menu?.contains(e.relatedTarget as Node)) {
                                                setLayers({
                                                    settings: {
                                                        type: "MENU",
                                                        setNull: true,
                                                    },
                                                });
                                            }
                                        }}
                                        onFocus={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    gap: 20,
                                                    firstSide: "RIGHT",
                                                },
                                                content: { type: "STATUS" },
                                            });
                                        }}
                                        onBlur={() => {
                                            setLayers({
                                                settings: { type: "MENU", setNull: true },
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
                                                fill={colors[user.status as keyof typeof colors]}
                                                mask={`url(#${
                                                    masks[user.status as keyof typeof masks]
                                                })`}
                                            />
                                        </svg>
                                        <div>{statuses[user.status]}</div>
                                        <Icon name="caret" />
                                    </button>

                                    <button
                                        className={styles.button}
                                        onClick={() => {
                                            setLayers({
                                                settings: {
                                                    type: "USER_CARD",
                                                    setNull: true,
                                                },
                                            });
                                            setLayers({
                                                settings: { type: "POPUP" },
                                                content: { type: "USER_STATUS", user },
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setLayers({
                                                    settings: { type: "USER_CARD", setNull: true },
                                                });
                                                setLayers({
                                                    settings: { type: "POPUP" },
                                                    content: { type: "USER_STATUS", user },
                                                });
                                            }
                                        }}
                                    >
                                        <Icon name="smiling" />
                                        <div>
                                            {user.customStatus ? "Edit " : "Set "}Custom Status
                                        </div>

                                        {user.customStatus && (
                                            <div
                                                className={styles.deleteStatus}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendRequest({
                                                        query: "UPDATE_USER",
                                                        body: {
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
                                    </button>

                                    <div className={styles.cardDivider + " " + styles.double} />

                                    <button
                                        className={styles.button}
                                        onMouseEnter={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    gap: 20,
                                                    firstSide: "RIGHT",
                                                },
                                                content: { type: "STATUS" },
                                            });
                                        }}
                                        onMouseLeave={(e) => {
                                            const menu = document.querySelector("#status-menu");
                                            if (!menu?.contains(e.relatedTarget as Node)) {
                                                setLayers({
                                                    settings: { type: "MENU", setNull: true },
                                                });
                                            }
                                        }}
                                        onFocus={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    gap: 20,
                                                    firstSide: "RIGHT",
                                                },
                                                content: { type: "STATUS" },
                                            });
                                        }}
                                        onBlur={() => {
                                            setLayers({
                                                settings: { type: "MENU", setNull: true },
                                            });
                                        }}
                                    >
                                        <Icon
                                            name="switch"
                                            viewbox="0 0 18 18"
                                        />
                                        <div>Switch Accounts</div>
                                        <Icon name="caret" />
                                    </button>

                                    <div className={styles.cardDivider + " " + styles.double} />

                                    <button
                                        className={styles.button}
                                        style={{ marginBottom: "8px" }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.id);
                                            setLayers({
                                                settings: { type: "USER_CARD", setNull: true },
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                navigator.clipboard.writeText(user.id);
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        setNull: true,
                                                    },
                                                });
                                            }
                                        }}
                                    >
                                        <Icon name="id" />
                                        <div>Copy User ID</div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
