import { AppHeader, UserLists, AddFriend, Layout, NestedLayout } from "../../../components";
import { useState, useEffect } from "react";
import useUserData from "../../../hooks/useUserData";
import Head from "next/head";
import styles from "./Friends.module.css";

const Friends = () => {
    const [content, setContent] = useState("online");

    useEffect(() => {
        setContent(
            localStorage.getItem("friends-tab")
            || "online"
        );
    }, [])


    const handleContent = (content) => {
        setContent(content);
        localStorage.setItem("friends-tab", content);
    };

    const { friends, friendRequests, blockedUsers } = useUserData();

    const lists = {
        online: friends.filter((friend) =>
            friend.status === "Online"
            || friend.status === "Idle"
            || friend.status === "Busy"
        ),
        all: friends,
        pending: friendRequests,
        blocked: blockedUsers,
    };

    return (
        <>
            <Head>
                <title>Discord | Friends</title>
            </Head>
            <div className={styles.main}>
                <AppHeader
                    content="friends"
                    setContent={handleContent}
                    active={content}
                />
                <div className={styles.content}>
                    {content === "add"
                        ? <AddFriend />
                        : <UserLists list={lists[content]} content={content} />}
                </div>
            </div>
        </>
    );
};

Friends.getLayout = function getLayout(page) {
    return (
        <Layout>
            <NestedLayout>{page}</NestedLayout>
        </Layout>
    );
};

export default Friends;
