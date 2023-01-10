import styles from "./Message.module.css";
import { format } from "date-fns";
import { Tooltip } from "../";
import { useState } from "react";
import { motion } from "framer-motion";

const Message = ({ message, big, hover }) => {
    const [showTooltip, setShowTooltip] = useState(false);

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
                    <span
                        className={styles.timestamp}
                    >
                        <Tooltip
                            show={showTooltip === 1}
                            text={format(new Date(message.sentAt), "PPPP p")}
                            arrow
                            pos="top"
                            dist='5px'
                        >
                            <span
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                {format(new Date(message.sentAt), "P p")}
                            </span>
                        </Tooltip>
                    </span>
                </h3>
                <div>{message.content}</div>
            </div>
        </div>
    ) : (
        <div className={styles.messageLittle}>
            <div
                onMouseEnter={() => setShowTooltip(3)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {message.content}
            </div>
            {hover && (
                <div className={styles.timestampLittle}>
                    {format(new Date(message.sentAt), "p")}
                </div>
            )}
        </div>
    );
};

export default Message;
