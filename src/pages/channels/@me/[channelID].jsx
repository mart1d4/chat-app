import { useRouter } from "next/router";
import {
    AppHeader,
    Layout,
    NestedLayout,
    Message,
    TextArea,
} from "../../../components";
import styles from "./Channels.module.css";
import Head from "next/head";
import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useUserData from "../../../hooks/useUserData";
import Image from "next/image";
import { parseISO, format } from "date-fns";

const Channels = () => {
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    const { auth, channelList, setChannelList } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const scrollableContainer = useCallback(node => {
        if (node !== null) {
            node.scrollTop = node.scrollHeight;
            console.log(node.scrollHeight);
        }
    }, [messages]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getMessages = async () => {
            const data = await axiosPrivate.get(
                `/private/${router.query.channelID}/messages`,
                { signal: controller.signal }
            );
            if (data.data.error) {
                isMounted && setError(data.data.error);
            } else {
                isMounted && setMessages(data.data.messages);
            }
        }

        setFriend(channelList?.filter(
            (channel) => channel._id.toString() === router.query.channelID
        )[0]?.members[0]);

        getMessages();
        console.log(
            '%c[channelID]',
            'color: hsl(38, 96%, 54%)',
            ': Fetching data...'
        );

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const isMoreThan5Minutes = (date1, date2) => {
        if (typeof date1 === "string") date1 = parseISO(date1);
        if (typeof date2 === "string") date2 = parseISO(date2);
        return Math.abs(date1 - date2) > 300000;
    };

    const isStart = (index) => {
        if (index === 0) return true;
        if ((messages[index - 1].sender._id !== messages[index].sender._id)
            || isMoreThan5Minutes(
                messages[index - 1].createdAt,
                messages[index].createdAt
            )
        ) return true;
        return false;
    };

    const isNewDay = (index) => {
        if (index === 0) return true;
        let date1 = messages[index - 1].createdAt;
        let date2 = messages[index].createdAt;
        if (typeof date1 === "string") date1 = parseISO(date1);
        if (typeof date2 === "string") date2 = parseISO(date2);
        return date1.getDate() !== date2.getDate();
    };

    const sendMessage = async (message) => {
        if (message.length === 0) return;
        if (message.length > 4000) {
            return setError("Message too long");
        }

        while (message[0] === "\\" && message[1] === "n") {
            message = message.slice(2);
        }

        while (message[message.length - 2] === "\\" && message[message.length - 1] === "n") {
            message = message.slice(0, message.length - 2);
        }

        const newMessage = {
            sender: auth.user,
            content: message,
            createdAt: new Date(),
        }

        const data = await axiosPrivate.post(
            `/private/${router.query.channelID}/send`,
            { message: newMessage }
        );

        if (data.data.error) {
            setError(data.data.error);
        } else {
            setMessages((messages) => [...messages, data.data.message]);

            // Move the channel to the top of the list
            const channelIndex = channelList.findIndex(
                (channel) => channel._id.toString() === router.query.channelID
            );
            const channel = channelList[channelIndex];
            const newChannelList = [
                channel,
                ...channelList.slice(0, channelIndex),
                ...channelList.slice(channelIndex + 1),
            ];
            setChannelList(newChannelList);
        }
    };

    return (
        <>
            <Head>
                <title>Discord | @{friend?.username}</title>
            </Head>

            <div className={styles.container}>
                <AppHeader
                    content="channels"
                    friend={friend}
                />
                <div className={styles.content}>
                    <main className={styles.main}>
                        <div className={styles.messagesWrapper}>
                            <div
                                ref={scrollableContainer}
                                className={styles.messagesScrollableContainer}
                            >
                                <div className={styles.scrollContent}>
                                    <ol className={styles.scrollContentInner}>
                                        <div className={styles.firstTimeMessageContainer}>
                                            <div className={styles.imageWrapper}>
                                                {friend?.avatar && (
                                                    <Image
                                                        src={friend?.avatar}
                                                        alt="Avatar"
                                                        width={80}
                                                        height={80}
                                                    />
                                                )}
                                            </div>
                                            <h3 className={styles.friendUsername}>
                                                {friend?.username}
                                            </h3>
                                            <div className={styles.descriptionContainer}>
                                                This is the beginning of your direct message history with <strong>@{friend?.username}</strong>.
                                                <div className={styles.descriptionActions}>
                                                    <button
                                                        style={{
                                                            backgroundColor: "var(--accent-1)",
                                                        }}
                                                    >
                                                        Add Friend
                                                    </button>
                                                    <button
                                                        style={{
                                                            backgroundColor: "var(--background-light)",
                                                        }}
                                                    >
                                                        Block
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {messages.map((message, index) => (
                                            <>
                                                {isNewDay(index) && (
                                                    <div
                                                        key={uuidv4()}
                                                        className={styles.messageDivider}
                                                    >
                                                        <span>
                                                            {format(
                                                                new Date(message.createdAt),
                                                                "PPP"
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <Message
                                                    key={uuidv4()}
                                                    message={message}
                                                    start={isStart(index)}
                                                    setError={setError}
                                                    setMessages={setMessages}
                                                />
                                            </>
                                        ))}

                                        <div className={styles.scrollerSpacer} />
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <TextArea
                            friend={friend}
                            sendMessage={sendMessage}
                        />
                    </main>
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
