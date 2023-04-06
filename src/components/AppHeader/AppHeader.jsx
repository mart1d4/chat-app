import styles from "./AppHeader.module.css";
import { Tooltip, Icon, AvatarStatus } from "../";
import ToolbarIcon from "./ToolbarIcon";
import { useState, useMemo } from "react";
import useUserData from "../../hooks/useUserData";
import useComponents from "../../hooks/useComponents";
import { v4 as uuidv4 } from "uuid";

const AppHeader = ({ content, setContent, friend, recipients, channel, showUsers, setShowUsers }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const { requests } = useUserData();
    const { setUserProfile, setMenu } = useComponents();
    const requestReceived = requests?.filter((request) => request.type === 1).length;

    const tabs = [
        { name: "Online", func: "online" },
        { name: "All", func: "all" },
        { name: "Pending", func: "pending" },
        { name: "Blocked", func: "blocked" },
        { name: "Add Friend", func: "add" },
    ];

    const toolbarItems = !content ? [
        { name: "Start Voice Call", icon: "call", func: () => { } },
        { name: "Start Video Call", icon: "video", func: () => { } },
        {
            name: "Pinned Messages", icon: "pin", func: (e, element, menu) => {
                if (menu?.name === "pin") {
                    setMenu(null);
                    return;
                } else {
                    setMenu({
                        event: e,
                        items: [
                            { name: "Divider" },
                            { name: "Divider" },
                            { name: "Divider" },
                            { name: "Divider" },
                            { name: "Divider" }
                        ],
                        side: "bottom",
                        side2: "right",
                        element: element,
                        gap: 5,
                        name: "pin",
                    });
                }
            }
        },
        { name: "Add Friends to DM", icon: "addUser", func: () => { } },
        {
            name: friend ? (
                !showUsers ? "Show User Profile" : "Hide User Profile"
            ) : "Show Member List",
            icon: friend ? "userProfile" : "memberList",
            func: () => {
                localStorage.setItem("show-users", !showUsers);
                setShowUsers(!showUsers);
            },
        },
    ] : [
        { name: "New Group DM", icon: "newDM", func: () => { } },
    ];

    return useMemo(() => (
        <div className={styles.header}>
            <div className={styles.nav}>
                {content ? (
                    <>
                        <div className={styles.icon}>
                            <Icon name="friends" fill="var(--foreground-5)" />
                        </div>
                        <h1 className={styles.title}>Friends</h1>
                        <div className={styles.divider}></div>
                        <ul className={styles.list}>
                            {tabs.map((tab, index) => (
                                <li
                                    key={index}
                                    onClick={() => setContent(tab.func)}
                                    className={
                                        tab.name === "Add Friend"
                                            ? content === tab.func
                                                ? styles.itemAddActive
                                                : styles.itemAdd
                                            : content === tab.func
                                                ? styles.itemActive
                                                : styles.item
                                    }
                                >
                                    {tab.name}
                                    {tab.name === "Pending" && requestReceived > 0 && (
                                        <div className={styles.badge}>{requestReceived}</div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (

                    <>
                        <div className={styles.icon}>
                            <Icon name={
                                friend ? "at" : "memberList"
                            } fill="var(--foreground-4)" />
                        </div>

                        <h1
                            className={styles.titleFriend}
                            onClick={() => setUserProfile({ user: friend })}
                        >
                            {(friend ? friend.username : channel?.name) || ""}
                        </h1>

                        {friend && (
                            <div
                                className={styles.status}
                                onMouseEnter={() => setShowTooltip("status")}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                <AvatarStatus
                                    status={friend.status}
                                    background="var(--background-4)"
                                    tooltip
                                    tooltipPos="bottom"
                                    onlyStatus
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className={styles.toolbar}>
                {toolbarItems.map((item) => (
                    <ToolbarIcon
                        key={uuidv4()}
                        item={item}
                    />
                ))}

                {content ? (
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
                                fill="var(--foreground-4)"
                            />
                        </div>
                    </div>
                )}

                <div
                    className={styles.toolbarIcon}
                    onMouseEnter={() => setShowTooltip("inbox")}
                    onMouseLeave={() => setShowTooltip(null)}
                >
                    <Icon name="inbox" />

                    <Tooltip
                        show={showTooltip === "inbox"}
                        pos="bottom"
                        dist={5}
                    >
                        Inbox
                    </Tooltip>
                </div>
            </div>
        </div>
    ), [content, setContent, friend, recipients, showUsers, showTooltip]);
};

export default AppHeader;
