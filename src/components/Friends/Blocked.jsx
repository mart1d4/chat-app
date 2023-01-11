import { useEffect, useState } from "react";
import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useRouter } from "next/router";

const Blocked = () => {
    const [blocked, setBlocked] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { auth } = useAuth();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getBlocked = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends/blocked`,
                    controller.signal
                );
                if (isMounted) setBlocked(data);
            } catch (err) {
                console.error(err);
            }
        };

        getBlocked();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const unblock = async (blockedID) => {
        try {
            await axiosPrivate.post(
                `/${auth?.user._id}/friends/${blockedID}/unblock`,
            );
            setRefresh(!refresh);
        } catch (err) {
            console.error(err);
        }
    }

    if (!blocked.length) {
        return (
            <div className={styles.content}>
                <h2>You haven't blocked anyone</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <h2>Blocked Users</h2>
            <div className={styles.list}>
                {blocked.map((friend) => (
                    <div key={friend._id} className={styles.userCard}>
                        <Avatar
                            username={friend.username}
                            avatar={friend.avatar}
                            size="48px"
                        />
                        <p>{friend.username}</p>
                        <div className={styles.buttons}>
                            <button onClick={() => unblock(friend._id)}>
                                Unblock
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blocked;
