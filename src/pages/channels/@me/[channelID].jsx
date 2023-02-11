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
import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useUserData from "../../../hooks/useUserData";
import Image from "next/image";
import { parseISO, format } from "date-fns";

const Channels = () => {
    const [friend, setFriend] = useState(null);
    const [friendStatus, setFriendStatus] = useState({
        1: null,
        2: null,
        3: null,
    });
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    const {
        auth,
        friends,
        setFriends,
        requests,
        setRequests,
        blocked,
        setBlocked,
        channels,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const buttons = {
        add: {
            text: "Add Friend",
            func: () => addFriend(),
            disabled: false,
            class: styles.blue,
        },
        remove: {
            text: "Remove Friend",
            func: () => deleteFriend(),
            disabled: false,
            class: styles.grey,
        },
        sent: {
            text: "Friend Request Sent",
            func: () => { },
            disabled: true,
            class: styles.blue,
        },
        received: {
            text: "Accept",
            func: () => addFriend(),
            disabled: false,
            class: styles.green,
        },
        ignore: {
            text: "Ignore",
            func: () => deleteFriend(),
            disabled: false,
            class: styles.grey,
        },
        block: {
            text: "Block",
            func: () => blockUser(),
            disabled: false,
            class: styles.grey,
        },
        unblock: {
            text: "Unblock",
            func: () => unblockUser(),
            disabled: false,
            class: styles.grey,
        },
    }

    const scrollableContainer = useCallback(node => {
        if (node !== null) {
            node.scrollTop = node.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (
            !router.query.channelID ||
            !channels ||
            !channels.length ||
            !channels.find((channel) => channel._id === router.query.channelID)
        ) {
            router.push("/channels/@me");
            return;
        }

        let isMounted = true;
        const controller = new AbortController();

        const friendID = channels.find(
            (channel) => channel._id === router.query.channelID
        )?.recipients?.find(
            (recipient) => recipient._id !== auth.user._id
        )._id;

        if (!friendID) return;

        const response = axiosPrivate.get(
            `/users/${friendID}`,
            { signal: controller.signal }
        );

        response.then((data) => {
            isMounted && setFriend(data.data.user);
        });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [router.query.channelID, friends, requests, blocked, channels]);

    useEffect(() => {
        if (!friend) return;

        if (friends?.find((user) => user?._id === friend?._id)) {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                1: "remove",
                2: null,
            }));
        } else if (requests?.find((request) => request?.user?._id === friend?._id && request?.type === 0)) {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                1: "sent",
                2: null,
            }));
        } else if (requests.find((request) => request?.user?._id === friend?._id && request?.type === 1)) {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                1: "received",
                2: "ignore",
            }));
        } else {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                1: "add",
                2: null,
            }));
        }

        if (blocked?.find((blocked) => blocked?._id === friend?._id)) {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                3: "unblock",
            }));
        } else {
            setFriendStatus((friendStatus) => ({
                ...friendStatus,
                3: "block",
            }));
        }
    }, [friend]);

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Friend request sent") {
                setRequests([
                    ...requests,
                    response.data.request,
                ]);
            } else if (response.data.message === "Friend request accepted") {
                setFriends([
                    ...friends,
                    response.data.friend,
                ]);

                setRequests(requests.filter(
                    (request) => request.user._id !== response.data.friend._id
                ));
            }
        } else {
            setError("An error occurred.");
        }
    };

    const deleteFriend = async () => {
        const response = await axiosPrivate.delete(
            `/users/@me/friends/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            if (response.data.message === "Friend removed") {
                setFriends(friends.filter((friend) => friend._id.toString() !== friend._id));
            } else if (response.data.message === "Request cancelled") {
                setRequests(requests.filter((request) => request.user._id.toString() !== friend._id));
            }
        } else {
            setError("An error occurred.");
        }
    };

    const blockUser = async () => {
        const response = await axiosPrivate.delete(
            `/users/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked((prev) => [...prev, response.data.blocked]);
            setFriends(friends.filter((friend) => friend._id.toString() !== friend._id));
            setRequests(requests.filter((request) => request.user._id.toString() !== friend._id));
        } else {
            setError("An error occurred.");
        }
    };

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked(blocked.filter((blocked) => blocked._id.toString() !== friend._id));
        } else {
            setError("An error occurred.");
        }
    };

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
                <title>Unthrust | {("@" + friend?.username) || "Loading"}</title>
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
                                                        src={friend.avatar}
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
                                                    {friendStatus[3] === "block" && (
                                                        <button
                                                            className={buttons[friendStatus[1]]?.class}
                                                            disabled={buttons[friendStatus[1]]?.disabled}
                                                            onClick={() => buttons[friendStatus[1]]?.func()}
                                                        >
                                                            {buttons[friendStatus[1]]?.text}
                                                        </button>
                                                    )}

                                                    {friendStatus[2] && (
                                                        <button
                                                            className={buttons[friendStatus[2]].class}
                                                            onClick={() => buttons[friendStatus[2]].func()}
                                                        >
                                                            {buttons[friendStatus[2]].text}
                                                        </button>
                                                    )}

                                                    <button
                                                        className={buttons[friendStatus[3]]?.class}
                                                        onClick={() => buttons[friendStatus[3]]?.func()}
                                                    >
                                                        {buttons[friendStatus[3]]?.text}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {messages.map((message, index) => (
                                            <React.Fragment key={uuidv4()}>
                                                {isNewDay(index) && (
                                                    <div
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
                                                    message={message}
                                                    start={isStart(index)}
                                                    setError={setError}
                                                    setMessages={setMessages}
                                                />
                                            </React.Fragment>
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
