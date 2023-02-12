import { AppHeader, UserLists, AddFriend, Layout, NestedLayout } from "../../../components";
import { useState, useEffect } from "react";
import useUserData from "../../../hooks/useUserData";
import Head from "next/head";
import styles from "./Friends.module.css";
import Aside from "./Aside";

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

    const { friends, requests, blocked } = useUserData();

    const lists = {
        online: friends?.filter((friend) => {
            return ["Online", "Idle", "Do Not Disturb"].includes(friend?.status)
        }),
        all: friends,
        pending: requests,
        blocked: blocked,
    };

    return (
        <>
            <Head>
                <title>Unthrust | Friends</title>
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

                    <Aside />
                </div>
            </div>
        </>
    );
};

Friends.getLayout = function getLayout(page) {
    return (
        <Layout>
            <NestedLayout>
                {page}
            </NestedLayout>
        </Layout>
    );
};

export default Friends;
