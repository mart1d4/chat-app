import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Pending = () => {
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { auth } = useAuth();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchReceived = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth.user._id}/friends/received`,
                    controller.signal
                );
                if (isMounted) setReceived(data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchSent = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth.user._id}/friends/sent`,
                    controller.signal
                );
                if (isMounted) setSent(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchReceived();
        fetchSent();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const cancelRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/cancel`,
            );
        } catch (err) {
            console.error(err);
        }
        setRefresh(!refresh);
    };

    const acceptRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/accept`,
            );
        } catch (err) {
            console.error(err);
        }
        setRefresh(!refresh);
    };

    const declineRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/decline`,
            );
        } catch (err) {
            console.error(err);
        }
        setRefresh(!refresh);
    };

    if (!sent.length && !received.length) {
        return (
            <div className={styles.content}>
                <h2>No pending requests</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            {sent.length > 0 && (
                <>
                    <h2>Sent</h2>
                    <div className={styles.list}>
                        {sent.map((friend) => (
                            <div key={friend._id} className={styles.userCard}>
                                <Avatar
                                    username={friend.username}
                                    avatar={friend.avatar}
                                    size="48px"
                                />
                                <p>{friend.username}</p>
                                <div className={styles.buttons}>
                                    <button
                                        onClick={() =>
                                            cancelRequest(friend._id)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {received.length > 0 && (
                <>
                    <h2>Received</h2>
                    <div className={styles.list}>
                        {received.map((friend) => (
                            <div key={friend._id} className={styles.userCard}>
                                <Avatar
                                    username={friend.username}
                                    avatar={friend.avatar}
                                    size="48px"
                                />
                                <p>{friend.username}</p>
                                <div className={styles.buttons}>
                                    <button
                                        onClick={() =>
                                            acceptRequest(friend._id)
                                        }
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() =>
                                            declineRequest(friend._id)
                                        }
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Pending;
