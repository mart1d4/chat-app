import styles from "./AppHeader.module.css";
import { Tooltip } from "../";
import { useState } from "react";
import useUserData from "../../hooks/useUserData";

const AppHeader = ({ content, setContent, active, friend }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const { friendRequests } = useUserData();
    const requestReceived = friendRequests.filter((request) => request.type === "received").length;

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
                            <path d="M1 20v-2.8q0-.85.438-1.563.437-.712 1.162-1.087 1.55-.775 3.15-1.163Q7.35 13 9 13t3.25.387q1.6.388 3.15 1.163.725.375 1.162 1.087Q17 16.35 17 17.2V20Zm18 0v-3q0-1.1-.612-2.113-.613-1.012-1.738-1.737 1.275.15 2.4.512 1.125.363 2.1.888.9.5 1.375 1.112Q23 16.275 23 17v3ZM9 12q-1.65 0-2.825-1.175Q5 9.65 5 8q0-1.65 1.175-2.825Q7.35 4 9 4q1.65 0 2.825 1.175Q13 6.35 13 8q0 1.65-1.175 2.825Q10.65 12 9 12Zm10-4q0 1.65-1.175 2.825Q16.65 12 15 12q-.275 0-.7-.062-.425-.063-.7-.138.675-.8 1.037-1.775Q15 9.05 15 8q0-1.05-.363-2.025Q14.275 5 13.6 4.2q.35-.125.7-.163Q14.65 4 15 4q1.65 0 2.825 1.175Q19 6.35 19 8Z" />
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
            </div>
        );
    } else if (content === "channels") {
        return (
            <div className={styles.header}>
                <h1>@{friend?.username}</h1>
                <Tooltip
                    text={friend?.status}
                    pos="bottom"
                    arrow
                    dist="10px"
                    show={showTooltip}
                >
                    <div
                        className={styles.status}
                        style={{
                            backgroundColor:
                                friend?.status === "online"
                                    ? "green"
                                    : friend?.status === "away"
                                        ? "#ffbf00"
                                        : friend?.status === "busy"
                                            ? "#ff0000"
                                            : friend?.status === "offline" && "#96989d",
                        }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    />
                </Tooltip>
                <div className={styles.split}></div>
            </div>
        );
    }
};

export default AppHeader;
