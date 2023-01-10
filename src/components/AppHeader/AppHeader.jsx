import styles from "./AppHeader.module.css";
import { Tooltip } from "../";
import { useState } from "react";

const AppHeader = ({ content, setContent, active, friend }) => {
    const [showTooltip, setShowTooltip] = useState(false);

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
                <h1>Friends</h1>
                <div className={styles.split}></div>
                <ul className={styles.list}>
                    {tabs.map((tab, index) => (
                        <li
                            key={index}
                            onClick={() => setContent(tab.func)}
                            style={{
                                backgroundColor:
                                    active === tab.func && "#96989d3f",
                                cursor: active === tab.func && "default",
                            }}
                            className={styles.item}
                        >
                            {tab.name}
                        </li>
                    ))}
                </ul>
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
