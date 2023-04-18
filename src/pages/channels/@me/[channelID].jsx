import { useRouter } from "next/router";
import {
    AppHeader,
    Layout,
    NestedLayout,
    Message,
    TextArea,
    MemberList,
    MessageSkeleton,
} from "../../../components";
import styles from "./Channels.module.css";
import Head from "next/head";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useUserData from "../../../hooks/useUserData";
import useAuth from "../../../hooks/useAuth";
import Image from "next/image";
import { parseISO, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import useComponents from "../../../hooks/useComponents";

const Channels = () => {
    const [channel, setChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState(null);
    const [edit, setEdit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [friend, setFriend] = useState(null);
    const [outgoing, setOutgoing] = useState(false);
    const [incoming, setIncoming] = useState(false);
    const [userBlocked, setUserBlocked] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    const { auth } = useAuth();
    const { friends, setFriends, requests, setRequests,
        blocked, setBlocked, channels,
    } = useUserData();
    const { setFixedLayer, setUserProfile } = useComponents();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    const scrollableContainer = useCallback(node => {
        if (node) node.scrollTop = node.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const sameChannel = channels?.find((channel) => channel._id === router.query.channelID);
        if (!sameChannel) router.push("/channels/@me");
        else setChannel(sameChannel);
        setFixedLayer(null);
        setUserProfile(null);
    }, [router.query.channelID, channels]);

    useEffect(() => {
        if (!channel) return;

        localStorage.setItem(
            "channel-url",
            `/channels/@me/${channel?._id}`
        );

        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel?._id}`));
        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        if (channel?.type === 0) {
            setFriend(channel?.recipients?.find((member) => member?._id !== auth?.user?._id));
        } else {
            setFriend(null);
        };

        const getMessages = async () => {
            setIsLoading(true);

            const response = await axiosPrivate.get(
                `/channels/${channel._id}/messages`,
            );

            if (response?.data?.success) {
                setMessages(response.data.messages);
                setHasMoreMessages(response.data.hasMoreMessages);
            }

            setIsLoading(false);
        };

        getMessages();

    }, [channel]);

    useEffect(() => {
        if (!friend) return;

        setOutgoing(requests?.find((request) => request.user._id === friend._id && request?.type === 0));
        setIncoming(requests?.find((request) => request.user._id === friend._id && request?.type === 1));
        setUserBlocked(blocked?.find((blocked) => blocked._id === friend._id));
        setIsFriend(friends?.find((user) => user._id === friend._id));
    }, [friend, requests, blocked, friends]);

    const addFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${friend._id}`,
        );

        if (response?.data?.success) {
            if (response.data.message.includes("sent")) {
                setRequests([...requests, response.data.request]);
            } else if (response.data.message.includes("accepted")) {
                setFriends([...friends, response.data.friend]);
                setRequests(requests.filter(
                    (request) => request.user._id !== response.data.friend._id
                ));
            }
        };
    };

    const deleteFriend = async () => {
        const response = await axiosPrivate.delete(
            `/users/@me/friends/${friend._id}`,
        );

        if (response?.data?.success) {
            if (response.data.message.includes("removed")) {
                setFriends(friends.filter(
                    (user) => user._id !== friend._id
                ));
            } else if (response.data.message.includes("cancelled")) {
                setRequests(requests.filter(
                    (request) => request.user._id !== friend._id
                ));
            }
        }
    };

    const blockUser = async () => {
        const response = await axiosPrivate.delete(
            `/users/${friend._id}`,
        );

        if (response?.data?.success) {
            setBlocked((prev) => [...prev, response.data.blocked]);
            setFriends(friends.filter((user) => user._id !== friend._id));
            setRequests(requests.filter((request) => request.user._id !== friend._id));
        }
    };

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${friend._id}`,
        );

        if (response?.data?.success) {
            setBlocked(blocked.filter((blocked) => blocked._id !== friend._id));
        }
    };

    const isMoreThan5Minutes = (date1, date2) => {
        if (typeof date1 === "string") date1 = parseISO(date1);
        if (typeof date2 === "string") date2 = parseISO(date2);
        return Math.abs(date1 - date2) > 300000;
    };

    const isFullMessage = (index) => {
        if (index === 0) return true;
        if (messages[index - 1]?.type === 2) return true;
        if ((messages[index - 1].author?._id !== messages[index].author?._id)
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

    const FirstMessage = useMemo(() => (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.imageWrapper}>
                <Image
                    src={(channel?.type === 0 ?
                        friend?.avatar : channel?.icon) || "/assets/default-avatars/blue.png"}
                    alt={channel?.type === 0 ?
                        "Avatar" : "Icon"}
                    width={80}
                    height={80}
                />
            </div>

            <h3 className={styles.friendUsername}>
                {channel?.type === 0 ? friend?.username : channel?.name}
            </h3>

            <div className={styles.descriptionContainer}>
                {channel?.type === 0 ? (
                    <>
                        This is the beginning of your direct message history with
                        <strong> @{friend?.username}</strong>.
                    </>
                ) : (
                    <>
                        Welcome to the beginning of the
                        <strong> {channel?.name}</strong> group.
                    </>
                )}

                {channel?.type === 0 && (
                    <div className={styles.descriptionActions}>
                        {isFriend ? (
                            <>
                                <button
                                    className="grey"
                                    onClick={() => deleteFriend()}
                                >
                                    Remove Friend
                                </button>

                                <button
                                    className="grey"
                                    onClick={() => blockUser()}
                                >
                                    Block
                                </button>
                            </>
                        ) : outgoing ? (
                            <>
                                <button className="blue disabled">
                                    Friend Request Sent
                                </button>

                                <button
                                    className="grey"
                                    onClick={() => blockUser()}
                                >
                                    Block
                                </button>
                            </>
                        ) : incoming ? (
                            <>
                                <button
                                    className="grey"
                                    onClick={() => addFriend()}
                                >
                                    Accept Friend Request
                                </button>

                                <button
                                    className="grey"
                                    onClick={() => blockUser()}
                                >
                                    Block
                                </button>
                            </>
                        ) : userBlocked ? (
                            <button
                                className="grey"
                                onClick={() => unblockUser()}
                            >
                                Unblock
                            </button>
                        ) : (
                            <>
                                <button
                                    className="blue"
                                    onClick={() => addFriend()}
                                >
                                    Add Friend
                                </button>

                                <button
                                    className="grey"
                                    onClick={() => blockUser()}
                                >
                                    Block
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    ), [outgoing, incoming, userBlocked, isFriend, friend, channel]);

    return useMemo(() => (
        <>
            <Head>
                <title>Discord | @{channel?.type === 0 ? friend?.username : channel?.name}</title>
            </Head>

            <div className={styles.container}>
                <AppHeader channel={channel} />

                <div className={styles.content}>
                    <main className={styles.main}>
                        <div className={styles.messagesWrapper}>
                            <div
                                ref={scrollableContainer}
                                className={styles.messagesScrollableContainer + " scrollbar"}
                            >
                                <div className={styles.scrollContent}>
                                    <ol className={styles.scrollContentInner}>
                                        {isLoading ? <MessageSkeleton /> : (
                                            <>
                                                {hasMoreMessages ? <MessageSkeleton /> : FirstMessage}

                                                {messages.map((message, index) => (
                                                    <div key={uuidv4()}>
                                                        {isNewDay(index) && (
                                                            <div className={styles.messageDivider}>
                                                                <span>
                                                                    {format(
                                                                        new Date(message.createdAt),
                                                                        "PPP"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <Message
                                                            channelID={channel?._id}
                                                            message={message}
                                                            setMessages={setMessages}
                                                            start={isFullMessage(index)}
                                                            edit={edit}
                                                            setEdit={setEdit}
                                                            reply={reply}
                                                            setReply={setReply}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        <div className={styles.scrollerSpacer} />
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <TextArea
                            friend={friend}
                            userBlocked={userBlocked}
                            channel={channel}
                            setMessages={setMessages}
                            reply={reply}
                            setReply={setReply}
                        />
                    </main >

                    <MemberList channel={channel} />
                </div >
            </div >
        </>
    ), [isLoading, channel, messages, edit, reply]);
};

Channels.getLayout = function getLayout(page) {
    return (
        <Layout>
            <NestedLayout>
                {page}
            </NestedLayout>
        </Layout>
    );
};

export default Channels;
