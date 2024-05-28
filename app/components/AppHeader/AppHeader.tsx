"use client";

import { useWindowSettings, useShowChannels, useSettings, useLayers, useData } from "@/store";
import { TooltipContent, TooltipTrigger, Tooltip } from "../Layers/Tooltip/Tooltip";
import useRequestHelper from "@/hooks/useFetchHelper";
import type { Channel, User } from "@/type";
import styles from "./AppHeader.module.css";
import { Icon, Avatar } from "@components";
import { useState } from "react";

export function AppHeader({
    channel,
    friend,
}: {
    channel?: Channel;
    friend?: User;
    requests?: number;
}) {
    const [name, setName] = useState(channel?.name || "");
    const [loading, setLoading] = useState(false);

    const width1200 = useWindowSettings((state) => state.widthThresholds)[1200];
    const width562 = useWindowSettings((state) => state.widthThresholds)[562];

    const setShowChannels = useShowChannels((state) => state.setShowChannels);

    const setSettings = useSettings((state) => state.setSettings);
    const updateChannel = useData((state) => state.updateChannel);
    const setLayers = useLayers((state) => state.setLayers);
    const settings = useSettings((state) => state.settings);
    const requests = useData((state) => state.received);

    const { sendRequest } = useRequestHelper();

    async function updateName(e) {
        e.preventDefault();

        if (loading || !channel?.name || channel.type !== 1 || name === channel.name) {
            return;
        }

        setLoading(true);

        try {
            const response = await sendRequest({
                query: "CHANNEL_UPDATE",
                params: { channelId: channel.id },
                body: { name },
            });

            if (response?.ok) {
                updateChannel(channel.id, {
                    name: name,
                });
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
        ? channel.guildId
            ? [
                  {
                      name: "Threads",
                      icon: "threads",
                      func: {},
                  },
                  {
                      name: "Notification Settings",
                      icon: "bell",
                      func: {},
                  },
                  {
                      name: "Pinned Messages",
                      icon: "pin",
                      func: (e: MouseEvent | KeyboardEvent) => {
                          setLayers({
                              settings: {
                                  type: "POPUP",
                                  element: e.currentTarget,
                                  firstSide: "BOTTOM",
                                  secondSide: "LEFT",
                                  gap: 10,
                              },
                              content: {
                                  type: "PINNED_MESSAGES",
                                  channel: channel,
                                  pinned: true,
                              },
                          });
                      },
                  },
                  {
                      name: settings.showUsers
                          ? `Hide ${!channel.type ? " User Profile" : "Member List"}`
                          : `Show ${!channel.type ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "userProfile" : "memberList",
                      active: settings.showUsers,
                      disabled: !width1200,
                      func: () => setSettings("showUsers", !settings.showUsers),
                  },
              ]
            : [
                  { name: "Start Voice Call", icon: "call", func: () => {} },
                  { name: "Start Video Call", icon: "video", func: () => {} },
                  {
                      name: "Pinned Messages",
                      icon: "pin",
                      func: (e: MouseEvent | KeyboardEvent) => {
                          setLayers({
                              settings: {
                                  type: "POPUP",
                                  element: e.currentTarget,
                                  firstSide: "BOTTOM",
                                  secondSide: "LEFT",
                                  gap: 10,
                              },
                              content: {
                                  type: "PINNED_MESSAGES",
                                  channel: channel,
                                  pinned: true,
                              },
                          });
                      },
                  },
                  {
                      name: "Add Friends to DM",
                      icon: "addUser",
                      func: (e: any) => {
                          setLayers({
                              settings: {
                                  type: "POPUP",
                                  element: e.currentTarget,
                                  firstSide: "BOTTOM",
                                  secondSide: "RIGHT",
                                  gap: 10,
                              },
                              content: {
                                  type: "CREATE_DM",
                                  channel: channel,
                              },
                          });
                      },
                  },
                  {
                      name: settings.showUsers
                          ? `Hide ${!channel.type ? " User Profile" : "Member List"}`
                          : `Show ${!channel.type ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "userProfile" : "memberList",
                      active: settings.showUsers,
                      disabled: !width1200,
                      func: () => setSettings("showUsers", !settings.showUsers),
                  },
              ]
        : [
              {
                  name: "New Group DM",
                  icon: "newDM",
                  func: (e: any) => {
                      setLayers({
                          settings: {
                              type: "POPUP",
                              element: e.currentTarget,
                              firstSide: "BOTTOM",
                              secondSide: "RIGHT",
                              gap: 10,
                          },
                          content: {
                              type: "CREATE_DM",
                              channel: channel,
                          },
                      });
                  },
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

                                        {tab.name === "Pending" && requests.length > 0 && (
                                            <div className={styles.badge}>{requests.length}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div className={styles.icon}>
                                {channel.guildId ? (
                                    <Icon name="hashtag" />
                                ) : (
                                    <Avatar
                                        size={24}
                                        src={channel.icon}
                                        alt={channel.name}
                                        type="icons"
                                        status={friend ? friend.status : undefined}
                                    />
                                )}
                            </div>

                            {channel.type === 0 ? (
                                <h1
                                    className={styles.titleFriend}
                                    onMouseEnter={(e) => {
                                        if (channel.guildId) return;
                                        func(e, channel.name);
                                    }}
                                    onClick={() => {
                                        if (channel.type !== 0) return;
                                        setLayers({
                                            settings: {
                                                type: "USER_PROFILE",
                                            },
                                            content: {
                                                user: friend,
                                            },
                                        });
                                    }}
                                    style={{ cursor: channel.guildId ? "default" : "" }}
                                >
                                    {channel.name}
                                </h1>
                            ) : (
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
                            )}

                            {channel.topic && <div className={styles.divider} />}

                            {channel.topic && (
                                <div
                                    className={styles.topic}
                                    onClick={() => {
                                        setLayers({
                                            settings: { type: "POPUP" },
                                            content: {
                                                type: "CHANNEL_TOPIC",
                                                channel: channel,
                                            },
                                        });
                                    }}
                                >
                                    {channel.topic}
                                </div>
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
