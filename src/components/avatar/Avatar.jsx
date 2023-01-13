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
            {status && (
                <div
                    className={styles.statusContainer}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
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
                >
                    <Tooltip
                        text={
                            status?.charAt(0).toUpperCase() + status?.slice(1)
                        }
                        pos="top"
                        show={showTooltip}
                        dist="15px"
                        arrow
                    >
                    </Tooltip>
                </div>
            )}
        </div>
    );
};

export default Avatar;
