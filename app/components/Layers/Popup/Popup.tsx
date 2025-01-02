"use client";

import { statuses, colors, masks } from "@/lib/statuses";
import { sanitizeString } from "@/lib/strings";
import { getRelativeDate } from "@/lib/time";
import "keen-slider/keen-slider.min.css";
import styles from "./Popup.module.css";
import { Fragment } from "react";
import Image from "next/image";
import {
    FixedMessage,
    InvitePopup,
    LoadingDots,
    EmojiPicker,
    Checkbox,
    Avatar,
    Input,
    Icon,
} from "@components";

export function Popup({
    content,
    element,
    closing,
}: {
    content: any;
    element: any;
    closing: boolean;
}) {
    async function submitInvite() {
        dispatch({
            type: "SET_LOADING",
            payload: true,
        });

        // state.guild.invite can be anything, so we need to check if it's a valid invite

        let code = state.guild.invite;

        if (code.length < 2 || code.length > 100) {
            dispatch({
                type: "SET_ERRORS",
                payload: { guildInvite: "Invalid invite link." },
            });
            dispatch({
                type: "SET_LOADING",
                payload: false,
            });
            return;
        }

        if (code.includes("https://spark.mart1d4.dev/")) {
            code = code.split("/").pop();
        }

        const response = await sendRequest({
            query: "ACCEPT_INVITE",
            params: {
                inviteId: code,
            },
            body: {
                isGuild: true,
            },
        });

        if (response.success) {
            // setLayers({
            //     settings: {
            //         type: "POPUP",
            //         setNull: true,
            //     },
            // });

            if (response.guild) {
                addGuild(response.guild);
                router.push(`/channels/${response.guild.id}`);
            }
        } else {
            dispatch({
                type: "SET_ERRORS",
                payload: { guildInvite: response.message },
            });
        }

        dispatch({
            type: "SET_LOADING",
            payload: false,
        });
    }

    async function submitGuild() {
        if (state.loading) return;
        dispatch({
            type: "SET_LOADING",
            payload: true,
        });

        const response = await sendRequest({
            query: "GUILD_CREATE",
            body: {
                name: state.guild.name,
                icon: state.guild.icon,
                template: state.guild.template,
            },
        });

        if (response.guild) {
            // setLayers({
            //     settings: {
            //         type: "POPUP",
            //         setNull: true,
            //     },
            // });

            addGuild(response.guild);
            router.push(`/channels/${response.guild.id}`);
        } else if (response.errors) {
            dispatch({
                type: "SET_ERRORS",
                payload: response.errors,
            });
        }

        dispatch({
            type: "SET_LOADING",
            payload: false,
        });
    }

    const props: PopupContent = {
        GUILD_CHANNEL_CREATE: {
            title: `Create ${content.isCategory ? "Category" : "Channel"}`,
            description: content.category
                ? `in ${content.category.name}`
                : content.isCategory
                ? undefined
                : " ",
            button: {
                color: "blue",
                text: state.channel.locked
                    ? "Next"
                    : `Create ${content.isCategory ? "Category" : "Channel"}`,
                disabled: !state.channel.name || state.channel.locked,
            },
            function: () => {
                if (!state.channel.name || state.channel.locked) return;
                sendRequest({
                    query: "GUILD_CHANNEL_CREATE",
                    params: {
                        guildId: content.guild,
                    },
                    body: {
                        name: state.channel.name,
                        type: content.isCategory ? 4 : state.channel.type,
                        locked: state.channel.locked,
                        categoryId: content.category?.id,
                    },
                });
            },
        },
        GUILD_CHANNEL_DELETE: {
            title: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            description: `Are you sure you want to delete ${
                content.channel?.type === 2 ? "#" : ""
            }${content.channel?.name}? This cannot be undone.`,
            button: {
                color: "red",
                text: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            },
            function: () => {
                sendRequest({
                    query: "GUILD_CHANNEL_DELETE",
                    params: {
                        channelId: content.channel?.id,
                    },
                });
            },
        },
        PIN_MESSAGE: {
            title: "Pin It. Pin It Good.",
            description:
                "Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?",
            button: {
                color: "blue",
                text: "Oh yeah. Pin it",
            },
            function: () => {
                sendRequest({
                    query: "PIN_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                });
            },
        },
        UNPIN_MESSAGE: {
            title: "Unpin Message",
            description: "You sure you want to remove this pinned message?",
            button: {
                color: "red",
                text: "Remove it please!",
            },
            function: () => {
                sendRequest({
                    query: "UNPIN_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                });
            },
        },
        LOGOUT: {
            title: "Log Out",
            description: "Are you sure you want to logout?",
            button: {
                color: "red",
                text: "Log Out",
            },
            function: () => {
                fetch(`${apiUrl}/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                }).then(() => router.refresh());
            },
        },
        CHANNEL_EXISTS: {
            title: "Confirm New Group",
            description:
                "You already have a group with these people! Are you sure you want to create a new one?",
            button: {
                color: "blue",
                text: "Create New Group",
            },
            function: () => {
                if (content.addUsers) {
                    content.addUsers();
                } else if (content.recipients) {
                    sendRequest({
                        query: "CHANNEL_CREATE",
                        body: {
                            recipients: content.recipients,
                        },
                        skipCheck: true,
                    });
                }
            },
        },
        GROUP_OWNER_CHANGE: {
            title: "Transfer Group Ownership",
            button: {
                color: "blue",
                text: "Confirm",
            },
            function: () => {
                sendRequest({
                    query: "CHANNEL_RECIPIENT_OWNER",
                    params: {
                        channelId: content.channelId,
                        recipientId: content.recipient.id,
                    },
                });
            },
        },
        LEAVE_CONFIRM: {
            title: `Leave '${content.channel ? content.channel.name : content.guild?.name}'`,
            description: `Are you sure you want to leave ${
                content.channel ? content.channel.name : content.guild?.name
            }? You won't be able to rejoin this ${
                content.guild ? "server" : "group"
            } unless your are re-invited.`,
            button: {
                color: "red",
                text: `Leave ${content.channel ? "Group" : "Server"}`,
            },
            function: () => {
                if (content.channel) {
                    sendRequest({
                        query: "CHANNEL_RECIPIENT_REMOVE",
                        params: {
                            channelId: content.channel?.id,
                            recipientId: user.id,
                            hideDeparture: state.notify,
                        },
                    });
                } else if (content.guild && !content.isOwner) {
                    sendRequest({
                        query: "GUILD_MEMBER_LEAVE",
                        params: {
                            guildId: content.guild.id,
                        },
                    });
                }
            },
        },
        RATE_LIMIT: {
            title: "WOAH THERE. WAY TOO SPICY",
            centered: true,
            description: "You're sending messages to quickly",
            button: {
                color: "blue",
                text: "Enter the chill zone",
                big: true,
            },
            function: () => {},
        },
        CHANNEL_TOPIC: {
            title: content?.channel?.name,
            description: content?.channel?.topic,
            noButtons: true,
            function: () => {},
        },
        USER_STATUS: {
            title: "Set a custom status",
            button: {
                color: "blue",
                text: "Save",
            },
            function: () => {
                const correctStatus = statuses[state.status];

                if (correctStatus !== user.status || state.customStatus !== user.customStatus) {
                    sendRequest({
                        query: "UPDATE_USER",
                        data: {
                            status: correctStatus === user.status ? null : correctStatus,
                            customStatus:
                                state.customStatus === user.customStatus
                                    ? null
                                    : sanitizeString(state.customStatus),
                        },
                    });
                }
            },
        },
    };

    const warnings = {
        FILE_TYPE: {
            title: "Invalid File Type",
            description: "Hm.. I don't think we support that type of file",
        },
        UPLOAD_FAILED: {
            title: "Upload Failed",
            description: "Something went wrong. try again later",
        },
    };

    if (type === "GUILD_INVITE") {
        return (
            <InvitePopup
                content={content}
                closing={closing}
            />
        );
    }

    return (
        <>
            {type === "CREATE_GUILD" ? (
                <div
                    ref={sliderRef}
                    className={`${styles.container} keen-slider`}
                    style={{
                        animationName: closing ? styles.popOut : "",
                        flexDirection: "row",
                        width: 440,
                    }}
                >
                    <div
                        className={`${styles.slider} keen-slider__slide`}
                        style={{ maxHeight: 558 }}
                    >
                        <header className={styles.centered}>
                            <div>Customize your server</div>
                            <div>
                                Give your new server a personality with a name and an icon. You can
                                always change it later
                            </div>

                            {CloseButton}
                        </header>

                        <main className={`${styles.content} scrollbar`}>
                            <div>
                                {[
                                    ["Create My Own", "/assets/system/own.svg"],
                                    ["Gaming", "/assets/system/gaming.svg"],
                                    ["School Club", "/assets/system/school.svg"],
                                    ["Study Group", "/assets/system/study.svg"],
                                    ["Friends", "/assets/system/friends.svg"],
                                    ["Artists & Creators", "/assets/system/artists.svg"],
                                    ["Local Community", "/assets/system/community.svg"],
                                ].map((template, index) => (
                                    <Fragment key={template[1]}>
                                        <button
                                            type="button"
                                            className={styles.serverTemplate}
                                            onClick={() => {
                                                dispatch({
                                                    type: "SET_GUILD",
                                                    payload: { template: index + 1 },
                                                });
                                                instanceRef.current?.next();
                                            }}
                                        >
                                            <img
                                                src={template[1]}
                                                alt={template[0]}
                                            />
                                            <div>{template[0]} </div>
                                            <Icon name="caret" />
                                        </button>

                                        {index === 0 && (
                                            <div className={styles.serverTemplateTitle}>
                                                Start from a template
                                            </div>
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        </main>

                        <footer className={styles.column}>
                            <h2>Have an invite already?</h2>

                            <button
                                type="button"
                                className={`grey button ${styles.big}`}
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GUILD",
                                        payload: { join: true },
                                    });
                                    instanceRef.current?.next();
                                }}
                            >
                                Join server
                            </button>
                        </footer>
                    </div>

                    <div
                        className={`${styles.slider} keen-slider__slide`}
                        style={{ maxHeight: 396 }}
                    >
                        <header className={styles.centered}>
                            {state.guild.join ? (
                                <>
                                    <div>Join a Server</div>
                                    <div>Enter an invite below to join an existing server</div>
                                </>
                            ) : (
                                <>
                                    <div>Create a server</div>
                                    <div>
                                        Your server is where you and your friends hang out. Make
                                        yours and start talking.
                                    </div>
                                </>
                            )}

                            {CloseButton}
                        </header>

                        <main className={`${styles.content} scrollbar`}>
                            {state.guild.join ? (
                                <div>
                                    <Input
                                        required
                                        maxLength={100}
                                        name="guild-invite"
                                        label="Invite Link"
                                        value={state.guild.invite}
                                        error={state.errors.guildInvite}
                                        placeholder="https://spark.mart1d4.dev/hTKzmak"
                                        onChange={(value) => {
                                            dispatch({
                                                type: "SET_GUILD",
                                                payload: { invite: value },
                                            });
                                            dispatch({
                                                type: "SET_ERRORS",
                                                payload: { guildInvite: "" },
                                            });
                                        }}
                                    />

                                    <div className={styles.input}>
                                        <label htmlFor="">Invites should look like</label>

                                        <ol
                                            style={{
                                                listStyle: "none",
                                                color: "var(--foreground-1)",
                                            }}
                                        >
                                            {[
                                                "hTKzmak",
                                                "https://spark.mart1d4.dev/hTKzmak",
                                                "https://spark.mart1d4.dev/cool-invite",
                                            ].map((invite) => (
                                                <li
                                                    key={invite}
                                                    onClick={() => {
                                                        dispatch({
                                                            type: "SET_GUILD",
                                                            payload: { invite },
                                                        });
                                                    }}
                                                >
                                                    {invite}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <form>
                                    <div className={styles.uploadIcon}>
                                        <div>
                                            {state.guild.icon ? (
                                                <Image
                                                    src={URL.createObjectURL(state.guild.icon)}
                                                    alt="Guild Icon"
                                                    width={80}
                                                    height={80}
                                                    style={{
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ) : (
                                                <Icon
                                                    size={80}
                                                    name="fileUpload"
                                                    viewbox="0 0 80 80"
                                                />
                                            )}

                                            <div
                                                role="button"
                                                aria-label="Upload a Server Icon"
                                                onClick={() => guildIconInput.current?.click()}
                                            />
                                        </div>

                                        <input
                                            type="file"
                                            ref={guildIconInput}
                                            accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                                            onChange={async (e) => {
                                                // wmjiodpajwi
                                            }}
                                        />
                                    </div>

                                    <Input
                                        required
                                        maxLength={100}
                                        name="guild-name"
                                        label="Server name"
                                        value={state.guild.name}
                                        error={state.errors.name}
                                        onChange={(value) => {
                                            dispatch({
                                                type: "SET_GUILD",
                                                payload: { name: value },
                                            });
                                        }}
                                    />
                                </form>
                            )}
                        </main>

                        <footer className={styles.spaced}>
                            <button
                                type="button"
                                className="button underline"
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GUILD",
                                        payload: { template: 0 },
                                    });
                                    if (state.guild.join) {
                                        dispatch({
                                            type: "SET_GUILD",
                                            payload: { join: false },
                                        });
                                    }
                                    instanceRef.current?.prev();
                                }}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className={`blue button ${
                                    state.guild.template && !state.guild.name ? "disabled" : ""
                                }`}
                                onClick={async () => {
                                    const disabled = state.guild.template && !state.guild.name;
                                    if (state.loading || disabled) return;

                                    if (state.guild.join && state.guild.invite) {
                                        await submitInvite();
                                    } else {
                                        await submitGuild();
                                    }
                                }}
                            >
                                {state.loading ? (
                                    <LoadingDots />
                                ) : state.guild.join ? (
                                    "Join Server"
                                ) : (
                                    "Create"
                                )}
                            </button>
                        </footer>
                    </div>
                </div>
            ) : (
                <div
                    className={`${styles.container} ${
                        type === "FILE_EDIT"
                            ? styles.fileEdit
                            : type === "GUILD_CHANNEL_CREATE"
                            ? styles.guildChannelCreate
                            : ""
                    } ${type === "CREATE_GUILD" ? "keen-slider" : ""}`}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ animationName: closing ? styles.popOut : "" }}
                >
                    {type === "USER_STATUS" && (
                        <Image
                            className={styles.headerImage + " " + styles.centered}
                            src="/assets/system/user-status.svg"
                            alt="Status"
                            width={200}
                            height={120}
                        />
                    )}

                    <header
                        className={prop.centered ? styles.centered : ""}
                        style={{
                            justifyContent: type === "USER_STATUS" ? "center" : "left",
                        }}
                    >
                        <h1>{prop.title}</h1>
                        {prop.centered && <p>{prop.description}</p>}
                        {prop.centered && CloseButton}
                    </header>

                    <main className={`${styles.content} scrollbar`}>
                        {!prop.centered && prop.description && (
                            <div
                                className={`${styles.description} ${
                                    type === "GUILD_CHANNEL_CREATE" ? styles.small : ""
                                }`}
                            >
                                {prop.description}
                            </div>
                        )}

                        {!prop.centered && prop.tip && (
                            <div style={{ color: "var(--foreground-5)", userSelect: "none" }}>
                                {prop.tip}
                            </div>
                        )}

                        {!prop.centered && content.message && type !== "DELETE_ATTACHMENT" && (
                            <div className={styles.messagesContainer}>
                                <FixedMessage
                                    message={content.message}
                                    pinned={false}
                                />
                            </div>
                        )}

                        {content.type === "LEAVE_CONFIRM" && content.channel && (
                            <div className={styles.checkbox}>
                                <Checkbox
                                    checked={state.notify}
                                    onChange={() => {
                                        dispatch({
                                            type: "SET_NOTIFY",
                                            payload: !state.notify,
                                        });
                                    }}
                                    inputFor={`leave-${content.channel.id}`}
                                    box
                                />

                                <label htmlFor={`leave-${content.channel.id}`}>
                                    Leave without notifying other members
                                </label>
                            </div>
                        )}

                        {type === "USER_STATUS" && (
                            <form>
                                <Input
                                    label={`What's cookin', ${user.username}?`}
                                    maxLength={100}
                                    value={state.customStatus}
                                    error={state.errors.customStatus}
                                    placeholder="Support has arrived!"
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_CUSTOM_STATUS",
                                            payload: value,
                                        });
                                    }}
                                    leftItem={<EmojiPicker />}
                                    rightItem={
                                        state.customStatus && (
                                            <div
                                                onClick={() => {
                                                    dispatch({
                                                        type: "SET_CUSTOM_STATUS",
                                                        payload: "",
                                                    });
                                                }}
                                                className={styles.clearInput}
                                            >
                                                <Icon
                                                    name="closeFilled"
                                                    viewbox="0 0 14 14"
                                                />
                                            </div>
                                        )
                                    }
                                />

                                <div className={styles.divider} />

                                <div className={styles.input}>
                                    <label>Status</label>
                                    <div
                                        className={styles.divInput}
                                        style={{
                                            borderRadius: state.showOptions ? "4px 4px 0 0" : "",
                                        }}
                                        onClick={(e) => {
                                            if (state.showOptions)
                                                dispatch({
                                                    type: "SET_SHOW_OPTIONS",
                                                    payload: null,
                                                });
                                            else
                                                dispatch({
                                                    type: "SET_SHOW_OPTIONS",
                                                    payload: e.currentTarget,
                                                });
                                        }}
                                    >
                                        {statuses[state.status as keyof typeof statuses]}

                                        <div
                                            className={styles.inputIcon}
                                            style={{
                                                transform: state.showOptions
                                                    ? "translateY(-50%) rotate(-90deg)"
                                                    : "translateY(-50%) rotate(90deg)",
                                            }}
                                        >
                                            <Icon name="caret" />
                                        </div>

                                        {state.showOptions && (
                                            <ul className={styles.options}>
                                                {["online", "idle", "dnd", "offline"].map((s) => (
                                                    <li
                                                        className={
                                                            state.status === s
                                                                ? styles.selected
                                                                : ""
                                                        }
                                                        key={s}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dispatch({
                                                                type: "SET_STATUS",
                                                                payload: s,
                                                            });
                                                            dispatch({
                                                                type: "SET_SHOW_OPTIONS",
                                                                payload: null,
                                                            });
                                                        }}
                                                    >
                                                        <div>
                                                            <svg className={styles.settingStatus}>
                                                                <rect
                                                                    height="10px"
                                                                    width="10px"
                                                                    rx={8}
                                                                    ry={8}
                                                                    fill={colors[s]}
                                                                    mask={`url(#${masks[s]})`}
                                                                />
                                                            </svg>
                                                            {statuses[s]}
                                                        </div>

                                                        {state.status === s && (
                                                            <Icon
                                                                name="selected"
                                                                fill="var(--accent-1)"
                                                            />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}

                        {type === "CHANNEL_EXISTS" && (
                            <div
                                className={styles.channelItem}
                                onClick={() => {
                                    // setLayers({
                                    //     settings: {
                                    //         type: "POPUP",
                                    //         setNull: true,
                                    //     },
                                    // });
                                    router.push(`/channels/me/${content.channel.id}`);
                                }}
                            >
                                <Avatar
                                    src={content.channel.icon}
                                    alt={content.channel.name}
                                    type="icons"
                                    size={24}
                                />

                                <span>{content.channel.name}</span>
                                <span>{getRelativeDate(content.channel.updatedAt)}</span>
                            </div>
                        )}

                        {type === "GROUP_OWNER_CHANGE" && (
                            <div className={styles.ownerChange}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 80 16"
                                    height="16"
                                    width="80"
                                >
                                    <g
                                        fill="none"
                                        fillRule="evenodd"
                                        opacity=".6"
                                    >
                                        <path d="m0 0h80v16h-80z" />
                                        <g stroke="var(--foreground-3)">
                                            <path d="m71 1h4v4.16" />
                                            <path
                                                d="m2 1h4v4.16"
                                                transform="matrix(-1 0 0 1 8 0)"
                                            />
                                            <path d="m51 1h4m6 0h4m-24 0h4m-14 0h4m-14 0h4m-23 11v-2m9-9h4" />
                                            <path d="m72.13 10.474 2.869 3.12 2.631-3.12" />
                                        </g>
                                    </g>
                                </svg>

                                <div className={styles.ownerAvatars}>
                                    <div>
                                        <Avatar
                                            src={user.avatar}
                                            alt={user.username}
                                            type="avatars"
                                            size={80}
                                        />
                                    </div>

                                    <div>
                                        <Avatar
                                            src={content.recipient.avatar}
                                            alt={content.recipient.username}
                                            type="avatars"
                                            size={80}
                                        />
                                    </div>
                                </div>

                                <div>
                                    Transfer ownership of this group to {content.recipient.username}
                                    ?
                                </div>
                            </div>
                        )}

                        {type === "GUILD_CHANNEL_CREATE" && (
                            <>
                                {!content.isCategory && (
                                    <div className={styles.channelType}>
                                        <h2>Channel Type</h2>

                                        <div
                                            tabIndex={0}
                                            className={styles.typePick}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_CHANNEL",
                                                    payload: { type: 2 },
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    dispatch({
                                                        type: "SET_CHANNEL",
                                                        payload: { type: 2 },
                                                    });
                                                }
                                            }}
                                            style={{
                                                backgroundColor:
                                                    state.channel.type === 2
                                                        ? "var(--background-hover-2)"
                                                        : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color:
                                                            state.channel.type === 2
                                                                ? "var(--foreground-1)"
                                                                : "",
                                                    }}
                                                >
                                                    <Icon
                                                        name={
                                                            state.channel.type === 2
                                                                ? "circleChecked"
                                                                : "circle"
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon
                                                            name={
                                                                state.channel.locked
                                                                    ? "hashtagLock"
                                                                    : "hashtag"
                                                            }
                                                        />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Text</div>
                                                        <div>
                                                            Send messages, images, GIFs, emoji,
                                                            opinions, and puns
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            tabIndex={0}
                                            className={styles.typePick}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_CHANNEL",
                                                    payload: { type: 3 },
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    dispatch({
                                                        type: "SET_CHANNEL",
                                                        payload: { type: 3 },
                                                    });
                                                }
                                            }}
                                            style={{
                                                backgroundColor:
                                                    state.channel.type === 3
                                                        ? "var(--background-hover-2)"
                                                        : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color:
                                                            state.channel.type === 3
                                                                ? "var(--foreground-1)"
                                                                : "",
                                                    }}
                                                >
                                                    <Icon
                                                        name={
                                                            state.channel.type === 3
                                                                ? "circleChecked"
                                                                : "circle"
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon
                                                            name={
                                                                state.channel.locked
                                                                    ? "voiceLock"
                                                                    : "voice"
                                                            }
                                                        />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Voice</div>
                                                        <div>
                                                            Hang out together with voice, video, and
                                                            screen share
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Input
                                    required
                                    maxLength={100}
                                    name="channel-name"
                                    label="Channel name"
                                    value={state.channel.name}
                                    error={state.errors.channelName}
                                    placeholder={
                                        content.isCategory ? "New Category" : "new-channel"
                                    }
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_CHANNEL",
                                            payload: { name: value },
                                        });
                                    }}
                                    leftItem={
                                        !content.isCategory && (
                                            <Icon
                                                name={
                                                    state.channel.type === 2
                                                        ? state.channel.locked
                                                            ? "hashtagLock"
                                                            : "hashtag"
                                                        : state.channel.locked
                                                        ? "voiceLock"
                                                        : "voice"
                                                }
                                            />
                                        )
                                    }
                                />

                                <div className={styles.privateCheck}>
                                    <div
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_CHANNEL",
                                                payload: { locked: !state.channel.locked },
                                            })
                                        }
                                    >
                                        <label>
                                            <Icon name="lock" />
                                            {content.isCategory
                                                ? "Private Category"
                                                : "Private Channel"}
                                        </label>

                                        <div>
                                            <Checkbox checked={state.channel.locked} />
                                        </div>
                                    </div>

                                    <div>
                                        {content.isCategory
                                            ? "By making a category private, only selected members and roles will be able to view this category. Synced channels in this category will automatically match to this setting."
                                            : "Only selected members and roles will be able to view this channel."}
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            )}
        </>
    );
}
