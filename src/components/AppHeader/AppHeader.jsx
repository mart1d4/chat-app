import styles from "./AppHeader.module.css";
import { Tooltip, Icon, AvatarStatus } from "../";
import { useState } from "react";
import useUserData from "../../hooks/useUserData";
import useComponents from "../../hooks/useComponents";
import { v4 as uuidv4 } from "uuid";

const AppHeader = ({ content, setContent, showUsers, setShowUsers, friend }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [recipients, setRecipients] = useState([]);

    const { requests } = useUserData();
    const { setUserProfile } = useComponents();
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
        { name: "Pinned Messages", icon: "pin", func: () => { } },
        { name: "Add Friends to DM", icon: "addUser", func: () => { } },
        {
            name: friend ? (
                !showUsers ? "Show User Profile" : "Hide User Profile"
            ) : "Show Member List",
            icon: friend ? "userProfile" : "memberList",
            func: () => {
                localStorage.setItem("show-users", !showUsers);
                setShowUsers((prev) => !prev);
            },
        },
    ] : [
        { name: "New Group DM", icon: "newDM", func: () => { } },
    ];

    if (
        !friend &&
        !content &&
        !recipients.length
    ) return null;

    return (
        <div className={styles.header}>
            <div className={styles.nav}>
                {content ? (
                    <>
                        <div className={styles.icon}>
                            <Icon name="friends" fill="var(--foreground-4)" />
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
                    friend ? (
                        <>
                            <div className={styles.icon}>
                                <Icon name="at" fill="var(--foreground-4)" />
                            </div>
                            <h1
                                className={styles.titleFriend}
                                onClick={() => setUserProfile({ user: friend })}
                            >
                                {friend.username || ""}
                            </h1>
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
                        </>
                    ) : (
                        <div>
                            hey
                        </div>
                    )
                )}
            </div>

            <div className={styles.toolbar}>
                {toolbarItems.map((item, index) => (
                    <div
                        key={uuidv4()}
                        className={styles.toolbarIcon}
                        onMouseEnter={() => setShowTooltip(index)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => item.func()}
                    >
                        <Icon name={item.icon} />

                        <Tooltip
                            show={showTooltip === index}
                            pos="bottom"
                        >
                            {item.name}
                        </Tooltip>
                    </div>
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
                    >
                        Inbox
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default AppHeader;
