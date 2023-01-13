import styles from "./Message.module.css";
import { format, formatRelative } from "date-fns";
import { Tooltip } from "../";
import { useState } from "react";
import { motion } from "framer-motion";

const Message = ({ message, big, hover }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const checkMessageDate = (date) => {
        // Checks if the date was today or yesterday
        // Return true if it is, false otherwise
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
            format(new Date(date), "PPPP") === format(today, "PPPP") ||
            format(new Date(date), "PPPP") === format(yesterday, "PPPP")
        );
    };

    return big ? (
        <div className={styles.message}>
            <motion.img
                src={message.sender.avatar}
                alt={message.sender.username}
                className={styles.avatar}
                whileTap={{ scale: 0.955 }}
            />
            <div>
                <h3 className={styles.messageHeader}>
                    <span className={styles.username}>
                        {message.sender.username}
                    </span>
                    <span className={styles.timestamp}>
                        <span
                            onMouseEnter={() => setShowTooltip(1)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <Tooltip
                                show={showTooltip === 1}
                                text={format(new Date(message.createdAt), "PPPP p")}
                            >
                                {checkMessageDate(message.createdAt)
                                    ? formatRelative(
                                        new Date(message.createdAt),
                                        new Date()
                                    )
                                        .charAt(0)
                                        .toUpperCase() +
                                    formatRelative(
                                        new Date(message.createdAt),
                                        new Date()
                                    ).slice(1)
                                    : format(
                                        new Date(message.createdAt),
                                        "P p"
                                    )}
                            </Tooltip>
                        </span>
                    </span>
                </h3>
                <div className={styles.messageContent}>{message.content}</div>
            </div>
        </div>
    ) : (
        <div className={styles.messageLittle}>
            <div
                className={styles.messageContent}
                onMouseEnter={() => setShowTooltip(3)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {message.content}
            </div>
            {hover && (
                <div className={styles.timestampLittle}>
                    <span
                        onMouseEnter={() => setShowTooltip(2)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <Tooltip
                            show={showTooltip === 2}
                            text={format(new Date(message.createdAt), "PPPP p")}
                        >
                            {format(new Date(message.createdAt), "p")}
                        </Tooltip>
                    </span>
                </div>
            )}
        </div>
    );
};

export default Message;
