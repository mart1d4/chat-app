import { useRouter } from "next/router";
import { AppNav, AppHeader, FriendList } from "../../components";
import styles from "./Conversation.module.css";
import Head from "next/head";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Conversation = () => {
    const [friends, setFriends] = useState([]);
    const [refresh, setRefresh] = useState(false);

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
                    `/users/${auth?.user._id}/channels`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setFriends(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        getFriends();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const refreshData = () => {
        setRefresh(!refresh);
    };

    return (
        <>
            <Head>
                <title>
                    Unthrust | Conversation with {friendID}
                </title>
            </Head>
            <div className={styles.container}>
                <AppNav />
                <FriendList friends={friends} refresh={refresh} />

                <div className={styles.main}>
                    <AppHeader
                        content="friends"
                    />
                    <div className={styles.content}>
                        <h1>Conversation with {friendID}</h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Conversation;
