import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import styles from "./Style.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const All = () => {
    const [friends, setFriends] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const { auth } = useAuth();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchFriends = async () => {
            try {
                const { data } = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends`,
                    controller.signal
                );
                if (isMounted) setFriends(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFriends();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [refresh]);

    const removeFriend = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/remove`,
            );
            setRefresh(!refresh);
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/channels/${friendID}/add`,
            );
            router.push(`/channels/${friendID}`);
        } catch (err) {
            console.error(err);
        }
    };

    if (!friends.length) {
        return (
            <div className={styles.content}>
                <h2>You don't have any friends</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <h2>All Friends</h2>
            <div className={styles.list}>
                {friends.map((friend) => (
                    <div key={friend._id} className={styles.userCard}>
                        <Avatar
                            username={friend.username}
                            avatar={friend.avatar}
                            size="48px"
                        />
                        <p>{friend.username}</p>
                        <div className={styles.buttons}>
                            <button
                                onClick={() => removeFriend(friend._id)}
                            >
                                Remove
                            </button>
                            <button
                                onClick={() => startConversation(friend._id)}
                            >
                                Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default All;
