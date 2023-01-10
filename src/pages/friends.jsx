import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import styles from "../styles/Friends.module.css";
import { useRouter } from "next/router";
import {
    AppNav,
    AppHeader,
    FriendList,
    AddFriend,
    All,
    Blocked,
    Online,
    Pending,
} from "../components";
import Head from "next/head";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Friends = () => {
    const [content, setContent] = useState(
        localStorage.getItem("friendsContent") || "online"
    );
    const [friends, setFriends] = useState([]);
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const router = useRouter();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

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

        const getSent = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends/sent`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setSent(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        const getReceived = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends/received`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setReceived(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        getFriends();
        getSent();
        getReceived();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const handleContent = (content) => {
        setContent(content);
        localStorage.setItem("friendsContent", content);
    };

    const refreshData = () => {
        setRefresh(!refresh);
    };

    return (
        <>
            <Head>
                <title>Unthrust | Friends</title>
            </Head>
            <div className={styles.container}>
                <AppNav />
                <FriendList friends={friends} refresh={refreshData} />

                <div className={styles.main}>
                    <AppHeader
                        content="friends"
                        setContent={handleContent}
                        active={content}
                    />
                    <div className={styles.content}>
                        {content === "online" && (
                            <Online friends={friends} refresh={refreshData} />
                        )}
                        {content === "all" && (
                            <All friends={friends} refresh={refreshData} />
                        )}
                        {content === "pending" && (
                            <Pending sent={sent} received={received} refresh={refreshData} />
                        )}
                        {content === "blocked" && (
                            <Blocked refresh={refreshData} />
                        )}
                        {content === "add" && (
                            <AddFriend refresh={refreshData} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Friends;
