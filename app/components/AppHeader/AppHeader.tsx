"use client";

import {
    useData,
    useLayers,
    useSettings,
    useShowChannels,
    useTooltip,
    useWidthThresholds,
} from "@/lib/store";
import { ChannelTable, UserTable } from "@/lib/db/types";
import styles from "./AppHeader.module.css";
import { Icon, Avatar } from "@components";

interface Props {
    channel?: Partial<ChannelTable>;
    friend?: Partial<UserTable>;
    requests?: number;
}

export function AppHeader({ channel, friend }: Props) {
    const width1200 = useWidthThresholds((state) => state.widthThresholds)[1200];
    const width562 = useWidthThresholds((state) => state.widthThresholds)[562];

    const setShowChannels = useShowChannels((state) => state.setShowChannels);

    const setSettings = useSettings((state) => state.setSettings);
    const requests = useData((state) => state.received);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const settings = useSettings((state) => state.settings);

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

    const func = (e: any, text: string) => {
        setTooltip({
            text: text,
            element: e.currentTarget,
            position: "BOTTOM",
            gap: 5,
        });
    };

    return (
        <div className={styles.header}>
            <div className={styles.nav}>
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
                                    status={friend ? friend.status : undefined}
                                />
                            )}
                        </div>

                        <h1
                            className={styles.titleFriend}
                            onMouseEnter={(e) => {
                                if (channel.guildId) return;
                                func(e, channel.name);
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
                            style={{ cursor: channel.guildId ? "default" : "" }}
                        >
                            {channel.name}
                        </h1>
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

                <button
                    className={styles.toolbarIcon}
                    onMouseEnter={(e) => func(e, "Inbox")}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={(e) => func(e, "Inbox")}
                    onBlur={() => setTooltip(null)}
                >
                    <Icon name="inbox" />
                </button>

                <a
                    href="/en-US/support"
                    className={styles.toolbarIcon}
                    onMouseEnter={(e) => func(e, "Help")}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={(e) => func(e, "Help")}
                    onBlur={() => setTooltip(null)}
                >
                    <Icon name="help" />
                </a>
            </div>
        </div>
    );
}

const ToolbarIcon = ({ item }: any) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const func = (e: any) => {
        setTooltip({
            text: `${item.name}${item.disabled ? " (Unavailable)" : ""}`,
            element: e.currentTarget,
            position: "BOTTOM",
            gap: 5,
        });
    };

    return (
        <button
            className={`${styles.toolbarIcon} ${item.disabled ? styles.disabled : ""} ${
                !!item.active ? styles.hideOnMobile : ""
            }`}
            onClick={(e) => {
                if (item.disabled) return;
                item.func(e);
            }}
            onMouseEnter={(e) => func(e)}
            onMouseLeave={() => setTooltip(null)}
            onFocus={(e) => func(e)}
            onBlur={() => setTooltip(null)}
            style={{ color: item.active && !item.disabled ? "var(--foreground-2)" : "" }}
        >
            <Icon name={item.icon} />
        </button>
    );
};
