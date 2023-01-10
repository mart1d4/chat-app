import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";

const Online = ({ friends, refresh }) => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const onlineFriends = friends.filter(
        (friend) => friend.status === "online"
    );

    const removeFriend = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/remove`
            );
        } catch (err) {
            console.error(err);
        }
        refresh();
    };

    if (!onlineFriends.length) {
        return (
            <div className={styles.content}>
                <h2>No friends online</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <h2>Online Friends</h2>
            <div className={styles.list}>
                {onlineFriends.map((friend) => (
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

export default Online;
