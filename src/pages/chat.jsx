import io from "socket.io-client";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import styles from "../styles/Chat.module.css";
import { useRouter } from "next/router";
import { Nav } from "../components";
import axios from "axios";

let socket;

const chat = () => {
    const { auth } = useAuth();
    const router = useRouter();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    useEffect(() => {
        socketInitializer();
    }, []);

    const socketInitializer = async () => {
        await fetch("/api/socket/socket");
        socket = io();

        socket.on("newIncomingMessage", (message) => {
            setMessages((currentMessages) => [...currentMessages, message]);
        });
    };

    const sendMessage = async () => {
        if (message === "") return;
        socket.emit("createdMessage", {
            message,
            user: auth.user,
        });
        console.log(auth.user);
        setMessages((currentMessages) => [...currentMessages, { message, user: auth.user }]);
        setMessage("");
    };

    const handleKeypress = (e) => {
        if (e.keyCode === 13) sendMessage();
    };

    return (
        <div className={styles.main}>
            <Nav />
            <div className={styles.content}>
                <div className={styles.messages}>
                    {messages.map((message, index) => (
                        <div key={index} className={styles.message}>
                            <img
                                src={message.user.avatar}
                                alt={message.user.username}
                                className={styles.avatar}
                            />
                            <div className={styles.username}>
                                {message.user.username}
                            </div>
                            <div className={styles.text}>{message.message}</div>
                        </div>
                    ))}
                </div>
                <div className={styles.input}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeypress}
                    />
                </div>
            </div>
        </div>
    );
};

export default chat;
