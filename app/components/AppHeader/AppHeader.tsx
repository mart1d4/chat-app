"use client";

import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useRequests } from "@/hooks/useRequests";
import type { Guild, GuildChannel } from "@/type";
import styles from "./AppHeader.module.css";
import { useState } from "react";
import { Call } from "./Call";
import {
    useWindowSettings,
    useTriggerDialog,
    useShowChannels,
    useActiveVoice,
    useSettings,
    useVoice,
    useData,
} from "@/store";
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
    guildId,
    channelId,
    initChannel,
}: {
    guildId?: number;
    channelId?: number;
    requests?: number;
    initChannel?: GuildChannel;
}) {
    const { updateChannel: updateLocalChannel, received } = useData();
    const { channelId: voiceId, setChannelId } = useVoice();
    const { settings, setSettings } = useSettings();
    const { setShowChannels } = useShowChannels();
    const { triggerDialog } = useTriggerDialog();
    const { updateChannel } = useRequests();
    const user = useAuthenticatedUser();

    const widthThresholds = useWindowSettings((state) => state.widthThresholds);
    const { 1200: width1200, 562: width562 } = widthThresholds;

    const guild = useData((state) => state.guilds).find((g) => g.id === guildId);

    const channel = initChannel
        ? initChannel
        : useData((state) => state.channels).find((c) => c.id === channelId);

    const friend = channel?.type === 0 ? channel?.recipients.find((r) => r.id !== user.id) : null;

    const [isShowingVideos, setIsShowingVideos] = useState(false);
    const [oldName, setOldName] = useState(channel?.name || "");
    const [name, setName] = useState(channel?.name || "");
    const [fullScreen, setFullScreen] = useState(false);
    const [hideChat, setHideChat] = useState(false);

    if (channel?.name && channel.name !== oldName) {
        setOldName(channel.name);
        setName(channel.name);
    }

    const tabs = [
        { name: "Online", func: "online" },
        { name: "All", func: "all" },
        { name: "Pending", func: "pending" },
        { name: "Blocked", func: "blocked" },
        { name: "Add Friend", func: "add" },
    ];

    const inVoice = !!voiceId && voiceId === channel?.id;
    const activeRoom = useActiveVoice((s) => s.rooms).find(
        (room) => room.channelId === channel?.id
    );
    const hasVoice = activeRoom && (!activeRoom.guildId || inVoice);

    if (!inVoice && (isShowingVideos || fullScreen || hideChat)) {
        setIsShowingVideos(false);
        setFullScreen(false);
        setHideChat(false);
    }

    if (!isShowingVideos && (fullScreen || hideChat)) {
        setFullScreen(false);
        setHideChat(false);
    }

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
                      popover: (
                          <Pinned
                              guild={guild}
                              channel={channel}
                          />
                      ),
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
                      name: hasVoice ? "Join Voice Call" : "Start Voice Call",
                      icon: "call",
                      hidden: inVoice,
                      func: () => setChannelId(channel.id),
                  },
                  {
                      name: "Start Video Call",
                      icon: "video",
                      hidden: inVoice || hasVoice,
                      func: () => setChannelId(channel.id),
                  },
                  {
                      icon: "pin",
                      name: "Pinned Messages",
                      id: "pinned-messages-trigger",
                      popover: (
                          <Pinned
                              guild={guild}
                              channel={channel}
                          />
                      ),
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

    const classNames = [
        styles.wrapper,
        (inVoice || hasVoice || channel?.type === 3) && styles.inCall,
        isShowingVideos && styles.hasVideos,
        fullScreen && styles.fullScreen,
        (hideChat || activeRoom?.guildId || channel?.type === 3) && styles.hideChat,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classNames}>
            <section
                className={`${styles.container} ${
                    inVoice || hasVoice || channel?.type === 3 ? styles.inCall : ""
                }`}
            >
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
                                        fill="var(--fg-5)"
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
                                                <div className={styles.badge}>
                                                    {received.length}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <div className={styles.icon}>
                                    {initChannel ? (
                                        <Icon
                                            name={
                                                initChannel.isPrivate
                                                    ? initChannel.type === 3
                                                        ? "voiceLock"
                                                        : "hashtagLock"
                                                    : initChannel.type === 3
                                                    ? "voice"
                                                    : "hashtag"
                                            }
                                        />
                                    ) : (
                                        <Avatar
                                            size={24}
                                            alt={channel?.name}
                                            generateId={friend?.id || channel?.id}
                                            // @ts-expect-error - TypeScript is so fucking stupid
                                            fileId={friend?.avatar || channel?.icon}
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
                                                    type="text"
                                                    value={name}
                                                    maxLength={100}
                                                    id="channelName"
                                                    className={styles.titleFriend}
                                                    onChange={(e) => setName(e.target.value)}
                                                    onBlur={() => {
                                                        if (name === channel.name) return;

                                                        updateChannel.send(
                                                            {
                                                                channelId: channel.id,
                                                                body: {
                                                                    name,
                                                                },
                                                            },
                                                            {
                                                                onComplete: () => {
                                                                    updateLocalChannel(channel.id, {
                                                                        name,
                                                                    });
                                                                },
                                                                onFail: () => setName(channel.name),
                                                            }
                                                        );
                                                    }}
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

                    {channel?.type !== 3 && (
                        <div className={styles.toolbar}>
                            {toolbarItems
                                .filter((i) => !i.hidden)
                                .map((item) => (
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
                    )}
                </div>
            </section>

            {(inVoice || hasVoice || channel?.type === 3) && (
                <Call
                    hideChat={hideChat}
                    notInVoice={!inVoice}
                    fullscreen={fullScreen}
                    setHideChat={setHideChat}
                    currentChannel={channel!}
                    setFullScreen={setFullScreen}
                    setIsShowingVideos={setIsShowingVideos}
                />
            )}
        </div>
    );
}

function ToolbarIcon({ item }: any) {
    if (item.popover) {
        return (
            <Popover placement="bottom-end">
                <Tooltip>
                    <TooltipTrigger>
                        <PopoverTrigger asChild>
                            <button
                                id={item.id}
                                className={`${styles.toolbarIcon} ${
                                    item.disabled ? styles.disabled : ""
                                } ${!!item.active ? styles.hideOnMobile : ""}`}
                                style={{
                                    color: item.active && !item.disabled ? "var(--fg-2)" : "",
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
                    style={{ color: item.active && !item.disabled ? "var(--fg-2)" : "" }}
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
