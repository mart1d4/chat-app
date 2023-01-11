import { ConversationList } from "../";
import styles from "./NestedLayout.module.css";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const NestedLayout = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");

        let isMounted = true;
        const controller = new AbortController();

        const fetchConversations = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/channels`,
                    controller.signal
                );
                if (isMounted) setConversations(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchConversations();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    return (
        <div className={styles.container}>
            <ConversationList conversations={conversations} />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default NestedLayout;
