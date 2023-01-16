import styles from "./AppHeader.module.css";
import { Tooltip } from "../";
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

    if (content === "friends") {
        return (
            <div className={styles.header}>
                <div className={styles.nav}>
                    <div className={styles.icon}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                        >
                            <g fill="none" fillRule="evenodd">
                                <path fill="var(--foreground-tertiary)" fillRule="nonzero" d="M0.5,0 L0.5,1.5 C0.5,5.65 2.71,9.28 6,11.3 L6,16 L21,16 L21,14 C21,11.34 15.67,10 13,10 C13,10 12.83,10 12.75,10 C8,10 4,6 4,1.5 L4,0 L0.5,0 Z M13,0 C10.790861,0 9,1.790861 9,4 C9,6.209139 10.790861,8 13,8 C15.209139,8 17,6.209139 17,4 C17,1.790861 15.209139,0 13,0 Z" transform="translate(2 4)" />
                                <path d="M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z" />
                            </g>
                        </svg>
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
                                        active === tab.func && "var(--background-transparent)",
                                    cursor: active === tab.func && "default",
                                    color: active === tab.func && "var(--foreground-primary)",
                                }}
                                className={styles.item}
                            >
                                {tab.name}
                                {tab.name === "Pending" && requestReceived > 0 && (
                                    <div className={styles.badge}>{requestReceived}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className={styles.toolbar}
                >

                </div>
            </div >
        );
    } else if (content === "channels") {
        return (
            <div className={styles.header}>
                <div className={styles.nav}>
                    <div className={styles.icon}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                        >
                            <path fill="var(--foreground-tertiary)" d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z" />
                        </svg>
                    </div>
                    <h1 className={styles.titleFriend}>{friend?.username}</h1>
                    <div
                        className={styles.status}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <div
                            style={{
                                backgroundColor:
                                    friend?.status === "Online"
                                        ? "var(--valid-primary)"
                                        : friend?.status === "Idle"
                                            ? "var(--warning-primary)"
                                            : friend?.status === "Busy"
                                                ? "var(--error-primary)"
                                                : "var(--foreground-quaternary)",
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
                                {friend?.status}
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div
                    className={styles.toolbar}
                >

                </div>
            </div >
        );
    }
};

export default AppHeader;
