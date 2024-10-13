"use client";

import { FriendRequests, MyAccount, Profiles, Overview } from "./index";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useShowSettings } from "@/store";
import { Icon } from "@components";

export function Settings() {
    const [activeTab, setActiveTab] = useState("");
    const [minified, setMinified] = useState(false);
    const [hideNav, setHideNav] = useState(false);

    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const showSettings = useShowSettings((state) => state.showSettings);

    const guild = showSettings?.guild;
    const channel = showSettings?.channel;

    useEffect(() => {
        setMinified(window.innerWidth < 1024);

        const handleWindowResize = () => {
            if (window.innerWidth < 1024) setMinified(true);
            else setMinified(false);
        };

        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    useEffect(() => {
        if (showSettings !== null && showSettings.tab) {
            setActiveTab(showSettings.tab);
            if (minified) setHideNav(true);
        } else if (showSettings !== null) {
            setActiveTab(
                ["GUILD", "CHANNEL"].includes(showSettings.type) ? "Overview" : "My Account"
            );
        }
    }, [showSettings]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                // if (layers) return;
                setShowSettings(null);
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [showSettings]);

    const userTabs = [
        { name: "User Settings", type: "title" },
        {
            name: "My Account",
            component: <MyAccount setActiveTab={setActiveTab} />,
        },
        {
            name: "Profiles",
            component: <Profiles />,
        },
        { name: "Privacy & Safety" },
        { name: "Authorized Apps" },
        { name: "Devices" },
        { name: "Connections" },
        {
            name: "Friend Requests",
            component: <FriendRequests />,
        },
        { name: "separator" },
        { name: "App Settings", type: "title" },
        { name: "Appearance" },
        { name: "Accessibility" },
        { name: "Voice & Video" },
        { name: "Text & Images" },
        { name: "Notifications" },
        { name: "Keybinds" },
        { name: "Language" },
        { name: "Streamer Mode" },
        { name: "Advanced" },
        { name: "separator" },
        { name: "What's New" },
        { name: "separator" },
        {
            name: "Log Out",
            icon: "logout",
            onClick: () => {
                // setLayers({
                //     settings: {
                //         type: "POPUP",
                //     },
                //     content: {
                //         type: "LOGOUT",
                //     },
                // });
            },
        },
    ];

    const guildTabs = guild
        ? [
              { name: `Server Settings`, type: `title` },
              { name: "Overview" },
              { name: "Roles" },
              { name: "Emoji" },
              { name: "Stickers" },
              { name: "Soundboard" },
              { name: "Widget" },
              { name: "Server Template" },
              { name: "Custom Invite Link" },
              { name: "separator" },
              { name: "Apps", type: "title" },
              { name: "Integrations" },
              { name: "App Directory" },
              { name: "separator" },
              { name: "Moderation", type: "title" },
              { name: "Safety Setup" },
              { name: "AutoMod" },
              { name: "Audit Log" },
              { name: "Bans" },
              { name: "separator" },
              { name: "Community", type: "title" },
              { name: "Enable Community" },
              { name: "separator" },
              { name: "Server Boost Status", icon: "boost" },
              { name: "separator" },
              { name: "User Management", type: "title" },
              { name: "Members" },
              { name: "Invites" },
              { name: "separator" },
              { name: "Delete Server", icon: "delete" },
          ]
        : [];

    const channelTabs = channel
        ? [
              { name: channel.name, type: `title` },
              { name: "Overview", component: <Overview channel={channel} /> },
              { name: "Permissions" },
              { name: "Invites", hide: channel.type === 4 },
              { name: "Integrations", hide: channel.type === 4 },
              { name: "separator" },
              {
                  name: "Delete Channel",
                  icon: "delete",
                  onClick: () => {
                      //   setLayers({
                      //       settings: {
                      //           type: "POPUP",
                      //       },
                      //       content: {
                      //           type: "GUILD_CHANNEL_DELETE",
                      //           channel: channel,
                      //       },
                      //   });
                  },
              },
          ]
        : [];

    const tabs = {
        USER: userTabs,
        GUILD: guildTabs,
        CHANNEL: channelTabs,
    }[showSettings?.type ?? "USER"];

    return (
        <AnimatePresence>
            {showSettings !== null && (
                <motion.div
                    className={styles.container}
                    initial={{ opacity: 0, y: 20, scale: 1.2 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 1.2 }}
                    transition={{
                        ease: "easeInOut",
                        duration: 0.2,
                    }}
                >
                    {(!minified || !hideNav) && (
                        <div className={styles.sidebar}>
                            <div className={styles.sidebarWrapper}>
                                <nav>
                                    <div className={styles.closeButton}>
                                        <div>
                                            <div onClick={() => setShowSettings(null)}>
                                                <Icon
                                                    name="close"
                                                    size={16}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {tabs.map(
                                        (tab, index) =>
                                            !tab.hide && (
                                                <div
                                                    tabIndex={
                                                        tab.name === "separator" ||
                                                        tab.type === "title"
                                                            ? -1
                                                            : 0
                                                    }
                                                    key={tab.name + index}
                                                    className={
                                                        tab.type === "title"
                                                            ? styles.title
                                                            : tab.name === "separator"
                                                            ? styles.separator
                                                            : activeTab === tab.name
                                                            ? styles.tabActive
                                                            : styles.tab
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault();

                                                        if (
                                                            tab.name === "separator" ||
                                                            tab.type === "title"
                                                        ) {
                                                            return;
                                                        }

                                                        // @ts-expect-error
                                                        if (tab.onClick) {
                                                            // @ts-expect-error
                                                            return tab.onClick();
                                                        }

                                                        setActiveTab(tab.name);
                                                        if (minified) setHideNav(true);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();

                                                            if (
                                                                tab.name === "separator" ||
                                                                tab.type === "title"
                                                            ) {
                                                                return;
                                                            }

                                                            // @ts-expect-error
                                                            if (tab.onClick) {
                                                                // @ts-expect-error
                                                                return tab.onClick();
                                                            }

                                                            setActiveTab(tab.name);
                                                            if (minified) setHideNav(true);
                                                        }
                                                    }}
                                                >
                                                    {tab.name !== "separator" && tab.name}

                                                    {tab.icon && (
                                                        <Icon
                                                            size={16}
                                                            name={tab.icon}
                                                            viewbox={
                                                                tab.icon === "boost"
                                                                    ? "0 0 8 12"
                                                                    : ""
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            )
                                    )}
                                </nav>
                            </div>
                        </div>
                    )}

                    {(!minified || hideNav) && (
                        <div className={styles.contentContainer}>
                            <div className={styles.contentWrapper + " scrollbar"}>
                                <div
                                    className={styles.content}
                                    style={{
                                        paddingRight:
                                            tabs.find((tab) => tab.name === activeTab)?.name ===
                                            "Profiles"
                                                ? "10px"
                                                : "",
                                    }}
                                >
                                    {!!minified && (
                                        <div className={styles.closeButton}>
                                            <div>
                                                <div onClick={() => setHideNav(false)}>
                                                    <Icon
                                                        name="close"
                                                        size={16}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tabs.find((tab) => tab.name === activeTab)?.component}
                                </div>

                                {!minified && (
                                    <div className={styles.closeButton}>
                                        <div>
                                            <div onClick={() => setShowSettings(null)}>
                                                <Icon
                                                    name="close"
                                                    size={18}
                                                />
                                            </div>

                                            <div>ESC</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
