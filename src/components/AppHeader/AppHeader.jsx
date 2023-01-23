import styles from "./AppHeader.module.css";
import { Tooltip, Icon } from "../";
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
        router.query.channelID && setFriend(
            channelList?.filter(
                (channel) => channel._id.toString() === router.query.channelID
            )[0]?.members[0]);
    }, [router.query.channelID]);

    const tabs = [
        {
            name: "Online",
            func: "online",
        },
        {
            name: "All",
            func: "all",
        },
        {
            name: "Pending",
            func: "pending",
        },

        {
            name: "Blocked",
            func: "blocked",
        },
        {
            name: "Add Friend",
            func: "add",
        },
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
                                    style={{
                                        backgroundColor:
                                            active === tab.func ? "var(--background-transparent-1)" : "",
                                        cursor: active === tab.func ? "default" : "",
                                        color: active === tab.func ? "var(--foreground-1)" : "",
                                    }}
                                    className={styles.item}
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
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <div
                                style={{
                                    backgroundColor:
                                        friend?.status === "Online"
                                            ? "var(--valid-1)"
                                            : friend?.status === "Idle"
                                                ? "var(--warning-1)"
                                                : friend?.status === "Busy"
                                                    ? "var(--error-1)"
                                                    : "var(--foreground-4)",
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    position: "relative",
                                }}
                            >
                                <Tooltip
                                    show={showTooltip}
                                    pos="bottom"
                                    dist="10px"
                                >
                                    {friend?.status || "Offline"}
                                </Tooltip>
                            </div>
                        </div></>
                )}
            </div>

            <div className={styles.toolbar}>
            </div>
        </div>
    );
};

export default AppHeader;
