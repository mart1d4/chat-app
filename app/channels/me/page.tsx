import styles from "./FriendsPage.module.css";
import { AppHeader } from "@components";
import { type Metadata } from "next";
import Content from "./Content";
import Aside from "./Aside";

export const metadata: Metadata = {
    title: "Spark | Friends",
};

export default function FriendsPage() {
    return (
        <div className={styles.main}>
            <AppHeader />

            <div className={styles.content}>
                <Content />
                <Aside />
            </div>
        </div>
    );
}
