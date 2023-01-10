import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";

const All = ({ friends, refresh }) => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const removeFriend = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/remove`,
            );
        } catch (err) {
            console.error(err);
        }
        refresh();
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
                            <button onClick={() => removeFriend(friend._id)}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default All;
