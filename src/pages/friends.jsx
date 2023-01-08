import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import styles from "../styles/Friends.module.css";
import { useRouter } from "next/router";
import { Nav } from "../components";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Avatar } from "../components";

const Friends = () => {
    const { auth } = useAuth();
    const router = useRouter();
    const [friends, setFriends] = useState([]);
    const axiosPrivate = useAxiosPrivate();

    const [showTooltip, setShowTooltip] = useState(null);

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getFriends = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/friends`,
                    {
                        signal: controller.signal,
                    }
                );
                isMounted && setFriends(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        getFriends();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    return (
        <div className={styles.main}>
            <Nav />
            <div className={styles.content}>
                <div className={styles.friends}>
                    <h1>Friends</h1>

                    <ul className={styles.friendsList}>
                        {friends.map((friend, index) => (
                            <li key={friend._id} className={styles.friend}>
                                <div className={styles.avatarContainer}>
                                    <Avatar
                                        avatar={friend.avatar}
                                        username={friend.username}
                                        status={friend.status}
                                        size="32px"
                                        show
                                    />
                                </div>
                                <p
                                    className={styles.friendUsername}
                                >
                                    {friend.username}
                                    <br /> <span>{friend.customStatus}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.messages}>messages</div>
            </div>
        </div>
    );
};

export default Friends;
