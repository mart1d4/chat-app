import { useEffect, useState } from "react";
import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";

const Blocked = ({ refresh }) => {
    const [blocked, setBlocked] = useState([]);

    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    useEffect(() => {
        const getBlocked = async () => {
            try {
                const response = await axiosPrivate.get(
                    `/users/${auth?.user._id}/blocked`
                );
                setBlocked(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        getBlocked();
    }, []);

    const unblock = async (id) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/${id}/unblock`
            );
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
