import { Tooltip } from "..";
import styles from "./Avatar.module.css";
import { useState } from "react";

const Avatar = ({ username, avatar, status, size, show }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className={styles.avatar}>
            <img
                src={avatar}
                alt={username}
                style={{ width: size ?? "48px" }}
            />
            <Tooltip
                text={status?.charAt(0).toUpperCase() + status?.slice(1)}
                pos="top"
                show={show ? showTooltip : false}
                dist="-50%"
                arrow
            >
                {status && (
                    <div
                        className={styles.status}
                        style={{
                            backgroundColor:
                                status === "online"
                                    ? "green"
                                    : status === "away"
                                    ? "yellow"
                                    : status === "busy"
                                    ? "red"
                                    : "grey",
                        }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    />
                )}
            </Tooltip>
        </div>
    );
};

export default Avatar;
