import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import styles from "../styles/App.module.css";
import { useRouter } from "next/router";
import { AppNav } from '../components';

const app = () => {
    const { auth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    return (
        <div
            className={styles.main}
        >
            <AppNav />
            <div
                className={styles.content}
            >
                e
            </div>
        </div>
    );
}

export default app;
