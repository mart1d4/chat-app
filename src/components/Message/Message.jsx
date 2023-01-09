import styles from "./Message.module.css";
import { format } from "date-fns";
import { Tooltip } from "../";
import { useState } from "react";

const Message = ({ message, big, hover }) => {
    return (
        <div
            className={styles.message}
        >
            <div
                className={styles.aside}
                style={{
                    width: !big ? "calc(48px + 1rem)" : "48px",
                    marginRight: !big ? "0" : "1rem",
                    justifyContent: !big ? "flex-start" : "center",
                }}
            >
                {big ? (
                    <img
                        src={message.sender.avatar}
                        alt={message.sender.username}
                    />
                ) : (
                    hover && (
                        <p className={styles.time}>
                            {format(new Date(message.sentAt), "p")}
                        </p>
                    )
                )}
            </div>

            {big ? (
                <div>
                    <p>
                        <span>{message.sender.username}</span>
                        {message.content}
                    </p>
                </div>
            ) : (
                <p>{message.content}</p>
            )}
        </div>
    );
};

export default Message;
