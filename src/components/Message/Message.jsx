import styles from "./Message.module.css";
import { format, formatRelative } from "date-fns";
import { Tooltip, MessageMenu } from "../";
import { useState } from "react";
import { motion } from "framer-motion";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRouter } from "next/router";

const Message = ({ message, start, setError, setMessages }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [hover, setHover] = useState(false);

    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const checkMessageDate = (date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
            format(new Date(date), "PPPP") === format(today, "PPPP") ||
            format(new Date(date), "PPPP") === format(yesterday, "PPPP")
        );
    };

    const deleteMessage = async () => {
        const data = await axiosPrivate.delete(
            `/private/${router.query.channelID}/messages/${message._id}`
        );

        if (data?.data?.error) {
            setError(data.data.error);
        } else {
            setMessages((messages) => messages.filter(
                (mes) => mes._id.toString() !== message._id.toString()
            ));
        }
    };

    const editMessage = async (newContent) => {
        console.log(message._id, newContent);
    };

    const pinMessage = async () => {
        console.log(message._id);
    };

    const replyToMessage = async () => {
        console.log(message._id);
    };

    const markUnread = async () => {
        console.log(message._id);
    };

    const copyMessageLink = async () => {
        console.log(message._id);
    };

    const copyMessageID = () => {
        navigator.clipboard.writeText(message._id);
    };

    return (
        <div
            className={styles.li}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {hover && (
                <MessageMenu
                    message={message}
                    start={start}
                    functions={{
                        deleteMessage,
                        editMessage,
                        pinMessage,
                        replyToMessage,
                        markUnread,
                        copyMessageLink,
                        copyMessageID,
                    }}
                />
            )}

            {start ? (
                <div className={styles.messageStart}>
                    <div className={styles.messageContent}>
                        <motion.img
                            src={message.sender.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                            whileTap={{ y: 1 }}
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
                        <div
                            style={{
                                whiteSpace: "pre-line",
                            }}
                        >
                            {message.content}
                        </div>
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
                                        dist={3}
                                        delay={1}
                                    >
                                        {format(new Date(message.createdAt), "PPPP p")}
                                    </Tooltip>
                                </span>
                            </span>
                        )}
                        <div
                            style={{
                                whiteSpace: "pre-line",
                            }}
                        >
                            {message.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;
