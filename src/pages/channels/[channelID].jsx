import { useRouter } from "next/router";
import {
    AppHeader,
    Conversation,
    Layout,
    NestedLayout
} from "../../components";
import styles from "./Channels.module.css";
import Head from "next/head";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Channels = () => {
    const [conversationID, setConversationID] = useState(null);
    const [conversation, setConversation] = useState(null);
    const [friend, setFriend] = useState(null);

    const { auth } = useAuth();
    const router = useRouter();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const { channelID } = router.query;
        if (channelID) setConversationID(channelID);
    }, [router.query]);

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");

        let isMounted = true;
        const controller = new AbortController();

        const fetchConversation = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/channels/${conversationID}/get`,
                    controller.signal
                );
                if (isMounted) setConversation(data);
            } catch (err) {
                console.error(err);
            }
        };

        conversationID && fetchConversation();
        // if (conversationID && auth?.user  && auth?.user?.conversations ) {
        //     // If conversation not in user's conversation list, redirect to /friends
        //     if (
        //         auth.user.conversations.filter(
        //             (channel) =>
        //                 channel.toString() === conversationID.toString()
        //         ).length === 0
        //     ) {
        //         router.push("/friends");
        //     }
        // }

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [conversationID]);

    useEffect(() => {
        const friend = conversation?.members?.filter(
            (member) => member._id !== auth?.user._id
        )[0];
        setFriend(friend);
    }, [conversation]);

    return (
        <>
            <Head>
                <title>Unthrust | @{friend?.username}</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.main}>
                    <AppHeader content="channels" friend={friend} />
                    <Conversation conversationID={conversationID} friend={friend} />
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
