import styles from "./AppHeader.module.css";
import { Tooltip, Icon, AvatarStatus } from "../";
import { useEffect, useState } from "react";
import useUserData from "../../hooks/useUserData";
import { useRouter } from "next/router";

const AppHeader = ({ content, setContent, active }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [friend, setFriend] = useState(null);

    const router = useRouter();
    const { friendRequests, channelList } = useUserData();
    const requestReceived = friendRequests.filter((request) => request.type === "received").length;

    useEffect(() => {
        setFriend(channelList?.filter(
            (channel) => channel._id.toString() === router.query.channelID
        )[0]?.members[0]);
    }, []);

    const tabs = [
        { name: "Online", func: "online" },
        { name: "All", func: "all" },
        { name: "Pending", func: "pending" },
        { name: "Blocked", func: "blocked" },
        { name: "Add Friend", func: "add" },
    ];

    return (
        <div className={styles.header}>
            <div className={styles.nav}>
                {content === "friends" ? (
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
                                            ? active === tab.func
                                                ? styles.itemAddActive
                                                : styles.itemAdd
                                            : active === tab.func
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
                        </ul></>
                ) : (
                    <>
                        <div className={styles.icon}>
                            <Icon name="at" />
                        </div>
                        <h1 className={styles.titleFriend}>{friend?.username || "username"}</h1>
                        <div
                            className={styles.status}
                            onMouseEnter={() => setShowTooltip("status")}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <AvatarStatus
                                status={friend?.status}
                                background="var(--background-4)"
                                tooltip
                                tooltipPos="bottom"
                                onlyStatus
                            />
                        </div>
                    </>
                )}
            </div>

            <div className={styles.toolbar}>
                <div
                    onMouseEnter={() => setShowTooltip("inbox")}
                    onMouseLeave={() => setShowTooltip(null)}
                >
                    <Icon name="inbox" />

                    <Tooltip show={showTooltip === "inbox"} pos="bottom">
                        Inbox
                    </Tooltip>
                </div>

                <div
                    onMouseEnter={() => setShowTooltip("search")}
                    onMouseLeave={() => setShowTooltip(null)}
                >
                    <Icon name="pin" />

                    <Tooltip show={showTooltip === "search"} pos="bottom">
                        Pin
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default AppHeader;
