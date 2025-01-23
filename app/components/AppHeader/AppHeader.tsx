"use client";

import {
    useWindowSettings,
    useShowChannels,
    useSettings,
    useData,
    useTriggerDialog,
} from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { GuildChannel, GuildMember } from "@/type";
import useRequestHelper from "@/hooks/useFetchHelper";
import styles from "./AppHeader.module.css";
import { useState } from "react";
import {
    TooltipContent,
    TooltipTrigger,
    PopoverContent,
    PopoverTrigger,
    DialogTrigger,
    DialogContent,
    CreateDM,
    Popover,
    Tooltip,
    Avatar,
    Dialog,
    Pinned,
    Icon,
} from "@components";

export function AppHeader({
    channelId,
    initChannel,
}: {
    channelId?: number;
    requests?: number;
    initChannel?: GuildChannel & { recipients: GuildMember[] };
}) {
    const user = useAuthenticatedUser();

    const channel =
        initChannel ||
        useData((state) => state.channels).find((channel) => channel.id === channelId);
    const friend = channel?.type === 0 ? channel?.recipients.find((r) => r.id !== user.id) : null;

    const [name, setName] = useState(channel?.name || "");
    const [loading, setLoading] = useState(false);

    const { 1200: width1200, 562: width562 } = useWindowSettings((state) => state.widthThresholds);
    const { settings, setSettings } = useSettings();
    const { setShowChannels } = useShowChannels();
    const { updateChannel, received } = useData();
    const { triggerDialog } = useTriggerDialog();
    const { sendRequest } = useRequestHelper();

    async function updateName(e: React.FocusEvent<HTMLInputElement>) {
        e.preventDefault();

        if (loading || !channel?.name || channel.type !== 1 || name === channel.name) {
            return;
        }

        setLoading(true);

        try {
            const { errors } = await sendRequest({
                query: "CHANNEL_UPDATE",
                params: { channelId: channel.id },
                body: { name },
            });

            if (!errors) {
                updateChannel(channel.id, { name: name });
            } else {
                setName(channel.name);
            }
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    const tabs = [
        { name: "Online", func: "online" },
        { name: "All", func: "all" },
        { name: "Pending", func: "pending" },
        { name: "Blocked", func: "blocked" },
        { name: "Add Friend", func: "add" },
    ];

    const toolbarItems = channel
        ? initChannel
            ? [
                  {
                      name: "Threads",
                      icon: "threads",
                      func: () => {},
                  },
                  {
                      name: "Notification Settings",
                      icon: "bell",
                      func: () => {},
                  },
                  {
                      icon: "pin",
                      name: "Pinned Messages",
                      id: "pinned-messages-trigger",
                      popover: <Pinned channel={channel} />,
                  },
                  {
                      name: settings.showUsers
                          ? `Hide ${!channel.type ? " User Profile" : "Member List"}`
                          : `Show ${!channel.type ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "user-circle-dot" : "users",
                      active: settings.showUsers,
                      disabled: !width1200,
                      func: () => setSettings("showUsers", !settings.showUsers),
                  },
              ]
            : [
                  { name: "Start Voice Call", icon: "call", func: () => {} },
                  { name: "Start Video Call", icon: "video", func: () => {} },
                  {
                      icon: "pin",
                      name: "Pinned Messages",
                      id: "pinned-messages-trigger",
                      popover: <Pinned channel={channel} />,
                  },
                  {
                      name: "Add Friends to DM",
                      icon: "users-add",
                      popover: <CreateDM channel={channel} />,
                  },
                  {
                      name: settings.showUsers
                          ? `Hide ${!channel.type ? " User Profile" : "Member List"}`
                          : `Show ${!channel.type ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "user-circle-dot" : "users",
                      active: settings.showUsers,
                      disabled: !width1200,
                      func: () => setSettings("showUsers", !settings.showUsers),
                  },
              ]
        : [
              {
                  name: "New Group DM",
                  icon: "newDM",
                  popover: <CreateDM />,
              },
          ];

    return (
        <section className={styles.container}>
            <div>
                <div className={styles.content}>
                    <button
                        className={styles.backButton}
                        onClick={() => setShowChannels(true)}
                    >
                        <Icon name="back" />
                    </button>

                    {!channel ? (
                        <>
                            <div className={styles.icon}>
                                <Icon
                                    name="friends"
                                    fill="var(--foreground-5)"
                                />
                            </div>

                            <h1 className={styles.title}>Friends</h1>
                            <div className={styles.divider}></div>

                            <ul className={styles.list}>
                                {tabs.map((tab) => (
                                    <li
                                        tabIndex={0}
                                        key={tab.name}
                                        onClick={() => setSettings("friendTab", tab.func)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setSettings("friendTab", tab.func);
                                            }
                                        }}
                                        className={`${styles.item} ${
                                            settings.friendTab === tab.func ? styles.active : ""
                                        } ${tab.name === "Add Friend" ? styles.add : ""}`}
                                    >
                                        {tab.name}

                                        {tab.name === "Pending" && received.length > 0 && (
                                            <div className={styles.badge}>{received.length}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div className={styles.icon}>
                                {initChannel ? (
                                    <Icon name={channel.isPrivate ? "hashtagLock" : "hashtag"} />
                                ) : (
                                    <Avatar
                                        size={24}
                                        alt={channel.name}
                                        generateId={friend?.id || channel.id}
                                        fileId={friend?.avatar || channel.icon}
                                        type={channel.type === 0 ? "user" : "channel"}
                                    />
                                )}
                            </div>

                            {channel.type === 0 ? (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <h1
                                            className={styles.titleFriend}
                                            onClick={() => {
                                                triggerDialog({
                                                    type: "USER_PROFILE",
                                                    data: { user: friend },
                                                });
                                            }}
                                        >
                                            {channel.name}
                                        </h1>
                                    </TooltipTrigger>

                                    <TooltipContent>{channel.name}</TooltipContent>
                                </Tooltip>
                            ) : !initChannel ? (
                                <div className={styles.contentWrapper}>
                                    <div className={styles.channelName}>
                                        <div>
                                            <input
                                                id="channelName"
                                                className={styles.titleFriend}
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                maxLength={100}
                                                onBlur={updateName}
                                            />

                                            <div>{name}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <h1
                                    style={{ cursor: "default" }}
                                    className={styles.titleFriend}
                                >
                                    {channel.name}
                                </h1>
                            )}

                            {channel.topic && <div className={styles.divider} />}

                            {channel.topic && (
                                <Dialog>
                                    <DialogTrigger>
                                        <div className={styles.topic}>{channel.topic}</div>
                                    </DialogTrigger>

                                    <DialogContent
                                        showClose
                                        hideFooter
                                        heading={channel.name}
                                    >
                                        <p style={{ userSelect: "text" }}>{channel.topic}</p>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.toolbar}>
                    {toolbarItems.map((item) => (
                        <ToolbarIcon
                            item={item}
                            key={item.name}
                        />
                    ))}

                    {!channel || !width562 ? (
                        <div className={styles.divider} />
                    ) : (
                        <div className={styles.search}>
                            <div
                                role="combobox"
                                aria-expanded="false"
                                aria-haspopup="listbox"
                                aria-label="Search"
                                autoCorrect="off"
                            >
                                Search
                            </div>

                            <div>
                                <Icon name="search" />
                            </div>
                        </div>
                    )}

                    <Tooltip>
                        <TooltipTrigger>
                            <button className={styles.toolbarIcon}>
                                <Icon name="inbox" />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Inbox</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <a
                                href="/en-US/support"
                                className={styles.toolbarIcon}
                            >
                                <Icon name="help" />
                            </a>
                        </TooltipTrigger>

                        <TooltipContent>Help</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </section>
    );
}

function ToolbarIcon({ item }: any) {
    if (item.popover) {
        return (
            <Popover
                gap={20}
                placement="bottom-end"
            >
                <Tooltip>
                    <TooltipTrigger>
                        <PopoverTrigger asChild>
                            <button
                                id={item.id}
                                className={`${styles.toolbarIcon} ${
                                    item.disabled ? styles.disabled : ""
                                } ${!!item.active ? styles.hideOnMobile : ""}`}
                                style={{
                                    color:
                                        item.active && !item.disabled ? "var(--foreground-2)" : "",
                                }}
                            >
                                <Icon name={item.icon} />
                            </button>
                        </PopoverTrigger>
                    </TooltipTrigger>

                    <TooltipContent>
                        {`${item.name}${item.disabled ? " (Unavailable)" : ""}`}
                    </TooltipContent>
                </Tooltip>

                <PopoverContent>{item.popover}</PopoverContent>
            </Popover>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <button
                    className={`${styles.toolbarIcon} ${item.disabled ? styles.disabled : ""} ${
                        !!item.active ? styles.hideOnMobile : ""
                    }`}
                    onClick={(e) => {
                        if (item.disabled) return;
                        item.func(e);
                    }}
                    style={{ color: item.active && !item.disabled ? "var(--foreground-2)" : "" }}
                >
                    <Icon name={item.icon} />
                </button>
            </TooltipTrigger>

            <TooltipContent>
                {`${item.name}${item.disabled ? " (Unavailable)" : ""}`}
            </TooltipContent>
        </Tooltip>
    );
}
