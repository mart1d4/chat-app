import styles from "./Message.module.css";
import { format, formatRelative } from "date-fns";
import { Tooltip } from "../";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const Message = ({ message, start }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [hover, setHover] = useState(false);

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

    return (
        <div
            className={styles.li}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {start ? (
                <div className={styles.messageStart}>
                    <div className={styles.messageContent}>
                        <Image
                            src={message.sender.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                        />
                        <h3>
                            <span className={styles.titleUsername}>
                                {message.sender.username}
                            </span>
                            <span
                                className={styles.titleTimestamp}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                {checkMessageDate(message.createdAt)
                                    ? formatRelative(
                                        new Date(message.createdAt),
                                        new Date()
                                    ).charAt(0).toUpperCase() + formatRelative(
                                        new Date(message.createdAt),
                                        new Date()).slice(1)
                                    : format(new Date(message.createdAt), "P p")}
                                <Tooltip
                                    show={showTooltip === 1}
                                    delay={1}
                                >
                                    {format(new Date(message.createdAt), "PPPP p")}
                                </Tooltip>
                            </span>
                        </h3>
                        <div>{message.content}</div>
                    </div>
                </div>
            ) : (
                <div className={styles.message}>
                    <div className={styles.messageContent}>
                        {hover && (
                            <span
                                className={styles.messageTimestamp}
                                onMouseEnter={() => setShowTooltip(2)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                <span>
                                    {format(new Date(message.createdAt), "p")}
                                    <Tooltip
                                        show={showTooltip === 2}
                                        delay={1}
                                    >
                                        {format(new Date(message.createdAt), "PPPP p")}
                                    </Tooltip>
                                </span>
                            </span>
                        )}
                        <div>{message.content}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;
