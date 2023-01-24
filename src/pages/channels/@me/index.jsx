import { useState, useEffect } from "react";
import styles from "./Friends.module.css";
import {
    AppHeader,
    UserLists,
    AddFriend,
    All,
    Blocked,
    Online,
    Pending,
    Layout,
    NestedLayout,
} from "../../../components";
import Head from "next/head";
import useUserData from "../../../hooks/useUserData";

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
        online: friends.filter((friend) => friend.status === "Online"),
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
                    {/* {content === "online" && <Online />}
                    {content === "all" && <All />}
                    {content === "pending" && <Pending />}
                    {content === "blocked" && <Blocked />}
                    {content === "add" && <AddFriend />} */}
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
