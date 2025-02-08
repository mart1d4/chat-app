"use client";

import { Dialog, DialogContent, DialogTrigger, Icon } from "@components";
import { FriendRequests, MyAccount, Profiles, Overview, GuildRoles } from "./index";
import useRequestHelper from "@/hooks/useFetchHelper";
import { getApiUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useShowSettings } from "@/store";

export function Settings() {
    const [activeTab, setActiveTab] = useState("");
    const [minified, setMinified] = useState(false);
    const [hideNav, setHideNav] = useState(false);
    const [loading, setLoading] = useState(false);

    const { showSettings, setShowSettings } = useShowSettings();
    const { sendRequest } = useRequestHelper();
    const router = useRouter();

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
        { name: "Log Out", icon: "leave", noInteraction: true },
    ];

    const guildTabs = guild
        ? [
              { name: `Server`, type: `title` },
              { name: "Overview" },
              { name: "Roles", component: <GuildRoles guildId={guild.id} /> },
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
              { name: "Delete Channel", icon: "delete", noInteraction: true },
          ]
        : [];

    const tabs = {
        USER: userTabs,
        GUILD: guildTabs,
        CHANNEL: channelTabs,
    }[showSettings?.type ?? "USER"];

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
                                        if (tab.hide) return null;

                                        const noInteraction =
                                            tab.name === "separator" ||
                                            tab.type === "title" ||
                                            tab.noInteraction;

                                        const item = (
                                            <button
                                                key={tab.name + index}
                                                tabIndex={
                                                    noInteraction && tab.name !== "Log Out" ? -1 : 0
                                                }
                                                className={
                                                    tab.type === "title"
                                                        ? styles.title
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
                                                        onConfirm={async () => {
                                                            setLoading(true);

                                                            const { errors } = await sendRequest({
                                                                query: "GUILD_CHANNEL_DELETE",
                                                                params: {
                                                                    channelId: channel.id,
                                                                },
                                                            });

                                                            if (!errors) {
                                                                setShowSettings(null);
                                                                router.refresh();
                                                            }

                                                            setLoading(false);
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

                                    {tabs.find((tab) => tab.name === activeTab)?.component}
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
