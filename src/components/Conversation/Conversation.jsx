import styles from "./Conversation.module.css";
import { Message } from "../";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import io from "socket.io-client";

let socket;

const Conversation = ({ conversationID, friend }) => {
    const [messages, setMessages] = useState(null);
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const socketInitializer = async () => {
            await fetch("/api/socket/socket");
            socket = io();

            socket.on("newIncomingMessage", (message) => {
                setMessages((prev) => [...prev, message]);
            });
        };

        let isMounted = true;
        const controller = new AbortController();

        const fetchConversation = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/channels/${conversationID}/get`,
                    controller.signal
                );
                if (isMounted) setMessages(data.messages);
            } catch (err) {
                console.error(err);
            }
        };

        conversationID && fetchConversation();
        socketInitializer();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const sendMessage = () => {
        if (message.length > 4000) return;
        if (message.length === 0) return;

        const newMessage = {
            sender: auth?.user._id,
            content: message,
        };

        socket.emit("createdMessage", {
            newMessage,
        });

        axiosPrivate.post(
            `/users/${auth?.user._id}/channels/${conversation._id}/send`,
            {
                message: newMessage,
            }
        );

        setMessage("");
    };

    const checkMessageSender = (index) => {
        if (
            messages[index - 1]?.sender._id !==
            messages[index].sender._id
        )
            return true;
        return false;
    };

    return (
        <div className={styles.content}>
            <ul className={styles.messages}>
                {messages && messages.map((message, index) => (
                    <li
                        key={index}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(false)}
                        style={{
                            marginTop: !checkMessageSender(index)
                                ? "0"
                                : index === 0
                                ? "10rem"
                                : "1.5rem",
                        }}
                    >
                        <Message
                            message={message}
                            big={checkMessageSender(index)}
                            hover={hover === index}
                        />
                    </li>
                ))}
            </ul>
            <div className={styles.messageInput}>
                <input
                    type="text-area"
                    placeholder={`Send a message to @${friend?.username}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />
            </div>
        </div>
    );
};

export default Conversation;
