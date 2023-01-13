import { useRouter } from "next/router";
import { AppHeader, Layout, NestedLayout, Message } from "../../components";
import styles from "./Channels.module.css";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Channels = () => {
    const [channelID, setChannelID] = useState(null);
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState(null);
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(false);
    const [listHeight, setListHeight] = useState(0);

    const { auth } = useAuth();
    const router = useRouter();
    const list = useRef(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (list.current) {
            setListHeight(list.current.scrollHeight);
        }
    }, [messages]);

    useEffect(() => {
        if (list.current) {
            list.current.scrollTop = list.current.scrollHeight;
        }
    }, [listHeight]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const { channelID } = router.query;
        setChannelID(channelID);

        const fetchConversation = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/channels/${channelID}/get`,
                    controller.signal
                );
                if (isMounted) {
                    setMessages(data.messages);
                    setFriend(
                        data.members?.find(
                            (member) => member._id !== auth?.user._id
                        )
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchConversation();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [router.query]);

    const sendMessage = () => {
        if (message.length > 4000) return;
        if (message.length === 0) return;

        setMessages((messages) => [
            ...messages,
            {
                sender: auth?.user,
                content: message,
                createdAt: new Date(),
            },
        ]);

        axiosPrivate.post(
            `/users/${auth?.user._id}/channels/${channelID}/send`,
            {
                message: {
                    sender: auth?.user._id,
                    content: message,
                },
            }
        );

        setMessage("");
    };

    const checkMessageSender = (index) => {
        if (
            messages[index]?.sender?._id
            !== messages[index - 1]?.sender?._id
        ) return true;
        return false;
    };

    return (
        <>
            <Head>
                <title>Unthrust | @{friend?.username}</title>
            </Head>
            <div className={styles.main}>
                <AppHeader content="channels" friend={friend} />
                <div className={styles.content}>
                    <ul className={styles.messages} ref={list}>
                        {messages &&
                            messages.map((message, index) => (
                                <li
                                    key={index}
                                    onMouseEnter={() => setHover(index)}
                                    onMouseLeave={() => setHover(false)}
                                    style={{
                                        marginTop: !checkMessageSender(index)
                                            ? ""
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
                        <div className={styles.typingIndicator}></div>
                        <input
                            type="text-area"
                            placeholder={`Send a message to @${friend?.username}`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                        <div className={styles.lettersCount}>
                            <span
                                style={{
                                    color:
                                        message.length > 4000 ? "#ff6868" : "",
                                }}
                            >
                                {message.length}
                            </span>
                            /4000
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

Channels.getLayout = function getLayout(page) {
    return (
        <Layout>
            <NestedLayout>{page}</NestedLayout>
        </Layout>
    );
};

export default Channels;
