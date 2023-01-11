import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import styles from "../styles/App.module.css";
import { useRouter } from "next/router";
import { Layout } from "../components";

const Dashboard = () => {
    const { auth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    return (
        <div
            className={styles.main}
        >
            <div
                className={styles.content}
            >
                App dashboard
            </div>
        </div>
    );
}

Dashboard.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};

export default Dashboard;
