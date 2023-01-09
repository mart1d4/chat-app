import { useRouter } from "next/router";
import { AppNav, AppHeader, FriendList, Message } from "../../components";
import styles from "./Conversation.module.css";
import Head from "next/head";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Conversation = () => {
    const [friends, setFriends] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const router = useRouter();
    const { friendID } = router.query;

    const friend = friends.find((friend) => friend._id === friendID);

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

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const sendMessage = async () => {
        if (message === "") return;

        try {
            const response = await axiosPrivate.post(
                `/users/${auth?.user._id}/channels/${friendID}`,
                {
                    content: message,
                }
            );
            setMessage("");
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const refreshData = () => {
        setRefresh(!refresh);
    };

    const checkMessageSender = (index) => {
        if (
            conversation.messages[index - 1]?.sender._id !==
            conversation.messages[index].sender._id
        )
            return true;
        return false;
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
                    <AppHeader content="friends" />
                    <div className={styles.content}>
                        <ul className={styles.messages}>
                            {conversation &&
                                conversation.messages &&
                                conversation?.messages.map((message, index) => (
                                    <li
                                        key={index}
                                        onMouseEnter={() => setHover(index)}
                                        onMouseLeave={() => setHover(false)}
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
                                type="text"
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
