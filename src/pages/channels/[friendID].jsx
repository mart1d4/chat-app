import { useRouter } from "next/router";
import { AppNav, AppHeader, FriendList, Message } from "../../components";
import styles from "./Conversation.module.css";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import io from "socket.io-client";

let socket;

const Conversation = () => {
    const [friends, setFriends] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [friend, setFriend] = useState(null);
    const [conversation, setConversation] = useState(null);
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false);

    const input = useRef(null);
    const list = useRef(null);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const router = useRouter();
    const { friendID } = router.query;

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");

        let isMounted = true;
        const controller = new AbortController();

        const getFriends = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setFriends(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        const getConversation = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/channels/${friendID}`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setConversation(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        getFriends();
        getConversation();

        list.current?.scrollTo({
            top: list.current?.scrollHeight + 1000,
            behavior: "smooth",
        });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh, router.query]);

    useEffect(() => {
        setFriend(friends.find((friend) => friend._id === friendID));
    }, [friends]);

    useEffect(() => {
        const socketInitializer = async () => {
            await fetch("/api/socket/socket");
            socket = io();

            socket.on("newIncomingMessage", () => {
                refreshData();
            });
        };

        socketInitializer();
    }, []);

    const sendMessage = async () => {
        if (message === "") return;
        if (message.length > 2000) {
            window.alert("Message is too long!");
            return;
        }

        socket.emit("createdMessage", {
            message,
        });

        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/channels/${friendID}`,
                { content: message }
            );
            setMessage("");
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const checkMessageSender = (index) => {
        if (
            conversation.messages[index - 1]?.sender._id !==
            conversation.messages[index].sender._id
        )
            return true;
        return false;
    };

    const refreshData = () => {
        setRefresh(!refresh);
    };

    return (
        <>
            <Head>
                <title>Unthrust | @{friend?.username}</title>
            </Head>
            <div className={styles.container}>
                <AppNav />
                <FriendList friends={friends} refresh={refresh} />

                <div className={styles.main}>
                    <AppHeader content="channels" friend={friend} />
                    <div className={styles.content}>
                        <ul className={styles.messages} ref={list}>
                            {conversation &&
                                conversation.messages &&
                                conversation?.messages.map((message, index) => (
                                    <li
                                        key={index}
                                        onMouseEnter={() => setHover(index)}
                                        onMouseLeave={() => setHover(false)}
                                        style={{
                                            marginTop: !checkMessageSender(
                                                index
                                            )
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
                                ref={input}
                                type="text-area"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                            />
                            <button onClick={() => sendMessage()}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Conversation;
