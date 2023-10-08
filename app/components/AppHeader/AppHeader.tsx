"use client";

import { useData, useLayers, useSettings, useTooltip } from "@/lib/store";
import { useState, useMemo, useEffect } from "react";
import styles from "./AppHeader.module.css";
import { Icon, Avatar } from "@components";

interface Props {
    channel?: TChannel;
    friend?: TCleanUser | null;
    requests?: number;
}

export function AppHeader({ channel, friend }: Props) {
    const [widthLimitPassed, setWidthLimitPassed] = useState<boolean>(false);

    const setSettings = useSettings((state) => state.setSettings);
    const requests = useData((state) => state.requestsReceived);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const settings = useSettings((state) => state.settings);

    useEffect(() => {
        const width: number = window.innerWidth;

        if (width >= 1200) setWidthLimitPassed(true);
        else setWidthLimitPassed(false);

        const handleResize = () => {
            const width: number = window.innerWidth;

            if (width >= 1200) setWidthLimitPassed(true);
            else setWidthLimitPassed(false);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                      func: (e: any) => {
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
                              },
                          });
                      },
                  },
                  {
                      name:
                          settings.showUsers && widthLimitPassed
                              ? "Hide User Profile"
                              : `Show ${channel.type === 0 ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "userProfile" : "memberList",
                      active: settings.showUsers,
                      disabled: widthLimitPassed === false,
                      func: () => setSettings("showUsers", !settings.showUsers),
                  },
              ]
            : [
                  { name: "Start Voice Call", icon: "call", func: () => {} },
                  { name: "Start Video Call", icon: "video", func: () => {} },
                  {
                      name: "Pinned Messages",
                      icon: "pin",
                      func: (e: any) => {
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
                      name:
                          settings.showUsers && widthLimitPassed
                              ? "Hide User Profile"
                              : `Show ${channel.type === 0 ? " User Profile" : "Member List"}`,
                      icon: channel.type === 0 ? "userProfile" : "memberList",
                      active: settings.showUsers,
                      disabled: widthLimitPassed === false,
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

    return useMemo(
        () => (
            <div className={styles.header}>
                <div className={styles.nav}>
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
                                {tabs.map((tab, index) => (
                                    <li
                                        key={index}
                                        tabIndex={0}
                                        onClick={() => setSettings("friendTab", tab.func)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setSettings("friendTab", tab.func);
                                            }
                                        }}
                                        className={
                                            tab.name === "Add Friend"
                                                ? settings.friendTab === tab.func
                                                    ? styles.itemAddActive
                                                    : styles.itemAdd
                                                : settings.friendTab === tab.func
                                                ? styles.itemActive
                                                : styles.item
                                        }
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
                                        src={channel.icon || ""}
                                        relativeSrc={!channel}
                                        alt={channel.name || ""}
                                        size={24}
                                        status={friend ? friend.status : undefined}
                                    />
                                )}
                            </div>

                            <h1
                                className={styles.titleFriend}
                                onMouseEnter={(e) => {
                                    if (channel.guildId) return;
                                    setTooltip({
                                        text: channel.name || "",
                                        element: e.currentTarget,
                                        position: "BOTTOM",
                                        gap: 5,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
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
                                style={{
                                    cursor: channel.guildId ? "default" : "",
                                }}
                            >
                                {channel.name || ""}
                            </h1>
                        </>
                    )}
                </div>

                <div className={styles.toolbar}>
                    {toolbarItems.map((item) => (
                        <ToolbarIcon
                            key={item.name}
                            item={item}
                        />
                    ))}

                    {!channel ? (
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
                                <Icon
                                    name="search"
                                    size={16}
                                />
                            </div>
                        </div>
                    )}

                    <div
                        tabIndex={0}
                        className={styles.toolbarIcon}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: "Inbox",
                                element: e.currentTarget,
                                position: "BOTTOM",
                                gap: 5,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) =>
                            setTooltip({
                                text: "Inbox",
                                element: e.currentTarget,
                                position: "BOTTOM",
                                gap: 5,
                            })
                        }
                        onBlur={() => setTooltip(null)}
                    >
                        <Icon name="inbox" />
                    </div>

                    <a
                        href="/en-US/support"
                        className={styles.toolbarIcon}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: "Help",
                                element: e.currentTarget,
                                position: "BOTTOM",
                                gap: 5,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={(e) =>
                            setTooltip({
                                text: "Help",
                                element: e.currentTarget,
                                position: "BOTTOM",
                                gap: 5,
                            })
                        }
                        onBlur={() => setTooltip(null)}
                    >
                        <Icon name="help" />
                    </a>
                </div>
            </div>
        ),
        [channel, friend, requests, settings, widthLimitPassed]
    );
}

const ToolbarIcon = ({ item }: any) => {
    const setTooltip = useTooltip((state) => state.setTooltip);

    return (
        <div
            tabIndex={0}
            className={`${styles.toolbarIcon} ${item.disabled && styles.disabled}`}
            onMouseEnter={(e) => {
                setTooltip({
                    text: item.disabled ? item.name + " (Unavailable)" : item.name,
                    element: e.currentTarget,
                    position: "BOTTOM",
                    gap: 5,
                });
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={(e) => {
                if (item.disabled) return;
                item.func(e);
            }}
            onFocus={(e) => {
                setTooltip({
                    text: item.disabled ? item.name + " (Unavailable)" : item.name,
                    element: e.currentTarget,
                    position: "BOTTOM",
                    gap: 5,
                });
            }}
            onBlur={() => setTooltip(null)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    if (item.disabled) return;
                    item.func(e);
                    e.currentTarget.focus();
                }
            }}
        >
            <Icon
                name={item.icon}
                fill={item.active && !item.disabled && "var(--foreground-2)"}
            />
        </div>
    );
};
