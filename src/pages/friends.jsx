import { useState, useEffect } from "react";
import styles from "../styles/Friends.module.css";
import {
    AppHeader,
    AddFriend,
    All,
    Blocked,
    Online,
    Pending,
    Layout,
    NestedLayout,
} from "../components";
import Head from "next/head";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";

const Friends = () => {
    const [content, setContent] = useState(
        localStorage.getItem("friendsContent") || "online"
    );

    const { auth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    const handleContent = (content) => {
        setContent(content);
        localStorage.setItem("friendsContent", content);
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
                    {content === "online" && <Online />}
                    {content === "all" && <All />}
                    {content === "pending" && <Pending />}
                    {content === "blocked" && <Blocked />}
                    {content === "add" && <AddFriend />}
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
