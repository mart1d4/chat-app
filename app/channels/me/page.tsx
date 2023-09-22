import { AppHeader, UserChannels } from "@components";
import styles from "./FriendsPage.module.css";
import { Metadata } from "next";
import Content from "./Content";
import Aside from "./Aside";

export const metadata: Metadata = {
    title: "Chat App | Friends",
};

const FriendsPage = () => {
    return (
        <>
            <UserChannels />

            <div className={styles.main}>
                <AppHeader />

                <div className={styles.content}>
                    <Content />
                    <Aside />
                </div>
            </div>
        </>
    );
};

export default FriendsPage;
