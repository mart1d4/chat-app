"use client";

import { FriendRequests, MyAccount, Profiles, Overview, GuildRoles, GuildOverview } from "./index";
import { Dialog, DialogContent, DialogTrigger, Icon } from "@components";
import { useData, useShowSettings, useWindowSettings } from "@/store";
import { useRequests } from "@/hooks/useRequests";
import { getApiUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";

export function Settings() {
    const [minified, setMinified] = useState(false);
    const [activeTab, setActiveTab] = useState("");
    const [hideNav, setHideNav] = useState(false);
    const [loading, setLoading] = useState(false);

    const width1024 = useWindowSettings((s) => s.widthThresholds[1024]);
    const { showSettings, setShowSettings } = useShowSettings();
    const { deleteGuildChannel } = useRequests();
    const { setUser, reset } = useData();
    const router = useRouter();

    const guild = showSettings?.guild;
    const channel = showSettings?.channel;

    if (width1024 && minified) {
        setMinified(false);
    } else if (!width1024 && !minified) {
        setMinified(true);
    }

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowSettings(null);
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);

    const userTabs = [
        { name: "User Settings", type: "title" },
        {
            name: "My Account",
            component: (props) => (
                <MyAccount
                    setActiveTab={setActiveTab}
                    {...props}
                />
            ),
        },
        {
            name: "Profiles",
            component: (props) => <Profiles {...props} />,
        },
        { name: "Privacy & Safety" },
        { name: "Authorized Apps" },
        { name: "Devices" },
        { name: "Connections" },
        {
            name: "Friend Requests",
            component: (props) => <FriendRequests {...props} />,
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
        { name: "Log Out", icon: "leave", noInteraction: true },
    ];

    const guildTabs = guild
        ? [
              { name: `Server`, type: `title` },
              {
                  name: "Overview",
                  component: (props) => (
                      <GuildOverview
                          guildId={guild.id}
                          {...props}
                      />
                  ),
              },
              {
                  name: "Roles",
                  component: (props) => (
                      <GuildRoles
                          guildId={guild.id}
                          {...props}
                      />
                  ),
              },
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
              {
                  name: "Overview",
                  component: (props) => (
                      <Overview
                          channel={channel}
                          {...props}
                      />
                  ),
              },
              { name: "Permissions" },
              { name: "Invites", hide: channel.type === 4 },
              { name: "Integrations", hide: channel.type === 4 },
              { name: "separator" },
              { name: "Delete Channel", icon: "delete", noInteraction: true },
          ]
        : [];

    const tabs = {
        USER: userTabs,
        GUILD: guildTabs,
        CHANNEL: channelTabs,
    }[showSettings?.type ?? "USER"];

    if (showSettings) {
        if (minified) setHideNav(true);

        const def = ["GUILD", "CHANNEL"].includes(showSettings.type) ? "Overview" : "My Account";
        const tab = showSettings.tab || def;

        if (activeTab === "") {
            setActiveTab(tab);
        }

        // If current tab isn't present in the tabs, set it to the first one
        if (!tabs.find((t) => t.name === activeTab)) {
            setActiveTab(def);
        }
    }

    const component = tabs.find((tab) => tab.name === activeTab)?.component || (() => <></>);

    return (
        <Dialog open={showSettings !== null}>
            <DialogContent blank>
                <div className={styles.container}>
                    {(!minified || !hideNav) && (
                        <div className={styles.sidebar}>
                            <div className={styles.sidebarWrapper}>
                                <nav>
                                    {minified ? (
                                        <div
                                            className={styles.returnBack}
                                            onClick={() => setShowSettings(null)}
                                        >
                                            <Icon
                                                size={20}
                                                name="close"
                                            />
                                            Close
                                        </div>
                                    ) : (
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
                                    )}

                                    {tabs.map((tab, index) => {
                                        if ("hide" in tab && tab.hide) return null;

                                        const noInteraction =
                                            tab.name === "separator" ||
                                            tab.type === "title" ||
                                            "noInteraction" in tab;

                                        const item = (
                                            <button
                                                key={tab.name + index}
                                                tabIndex={
                                                    noInteraction && tab.name !== "Log Out" ? -1 : 0
                                                }
                                                className={
                                                    tab.type === "title"
                                                        ? "subtitle ml-[10px] mb-1"
                                                        : tab.name === "separator"
                                                        ? styles.separator
                                                        : activeTab === tab.name
                                                        ? styles.tabActive
                                                        : styles.tab
                                                }
                                                onClick={() => {
                                                    if (!noInteraction) {
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
                                                        viewBox={
                                                            tab.icon === "boost"
                                                                ? "0 0 8 12"
                                                                : "0 0 24 24"
                                                        }
                                                    />
                                                )}
                                            </button>
                                        );

                                        if (tab.name === "Log Out") {
                                            return (
                                                <Dialog key={tab.name + index}>
                                                    <DialogTrigger>{item}</DialogTrigger>

                                                    <DialogContent
                                                        heading="Log Out"
                                                        description="Are you sure you want to logout?"
                                                        confirmColor="red"
                                                        confirmLabel="Log Out"
                                                        confirmLoading={loading}
                                                        onConfirm={async () => {
                                                            setLoading(true);

                                                            await fetch(
                                                                `${getApiUrl}/auth/logout`,
                                                                {
                                                                    method: "POST",
                                                                    credentials: "include",
                                                                }
                                                            ).then(() => {
                                                                setLoading(false);
                                                                setShowSettings(null);
                                                                router.refresh();
                                                                reset();
                                                            });
                                                        }}
                                                    />
                                                </Dialog>
                                            );
                                        }

                                        if (tab.name === "Delete Channel") {
                                            const type =
                                                channel.type === 4 ? "Category" : "Channel";

                                            return (
                                                <Dialog key={tab.name + index}>
                                                    <DialogTrigger>{item}</DialogTrigger>

                                                    <DialogContent
                                                        heading={`Delete ${type}`}
                                                        description={`Are you sure you want to delete ${
                                                            channel.type === 2 ? "#" : ""
                                                        }${channel.name}? This cannot be undone.`}
                                                        confirmColor="red"
                                                        confirmLabel={`Delete ${type}`}
                                                        confirmLoading={loading}
                                                        onConfirm={() => {
                                                            deleteGuildChannel.send(
                                                                { channelId: channel.id },
                                                                {
                                                                    onComplete: () => {
                                                                        setShowSettings(null);
                                                                        router.refresh();
                                                                    },
                                                                }
                                                            );
                                                        }}
                                                    />
                                                </Dialog>
                                            );
                                        }

                                        return item;
                                    })}
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
                                        <div
                                            className={styles.returnBack}
                                            onClick={() => setHideNav(false)}
                                        >
                                            <Icon
                                                size={20}
                                                name="arrow"
                                            />
                                            Back
                                        </div>
                                    )}

                                    {component({})}
                                </div>

                                {!minified && (
                                    <div className={styles.closeButton}>
                                        <div>
                                            <button
                                                autoFocus
                                                onClick={() => setShowSettings(null)}
                                            >
                                                <Icon
                                                    name="close"
                                                    size={18}
                                                />
                                            </button>

                                            <div>ESC</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
