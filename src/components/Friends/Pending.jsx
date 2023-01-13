import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";

const Pending = () => {
    const { auth } = useAuth();
    const {
        friendRequestsSent,
        setFriendRequestsSent,
        friendRequestsReceived,
        setFriendRequestsReceived,
        friends,
        setFriends,
        getChannels,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const cancelRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/cancel`,
            );
            setFriendRequestsSent(friendRequestsSent.filter((friend) => friend._id !== friendID));
        } catch (err) {
            console.error(err);
        }
    };

    const acceptRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/accept`,
            );
            setFriendRequestsReceived(friendRequestsReceived.filter((friend) => friend._id !== friendID));
            setFriends([...friends, friendRequestsReceived.find((friend) => friend._id === friendID)]);
            getChannels();
        } catch (err) {
            console.error(err);
        }
    };

    const declineRequest = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/decline`,
            );
            setFriendRequestsReceived(friendRequestsReceived.filter((friend) => friend._id !== friendID));
        } catch (err) {
            console.error(err);
        }
    };

    if (!friendRequestsSent.length && !friendRequestsReceived.length) {
        return (
            <div className={styles.content}>
                <h2>No pending requests</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            {friendRequestsSent.length > 0 && (
                <>
                    <h2>Requests Sent = {friendRequestsSent.length}</h2>
                    <div className={styles.list}>
                        {friendRequestsSent.map((user) => (
                            <div key={user._id} className={styles.userCard}>
                                <Avatar
                                    username={user.username}
                                    avatar={user.avatar}
                                    size="48px"
                                />
                                <p>{user.username}</p>
                                <div className={styles.buttons}>
                                    <button
                                        onClick={() =>
                                            cancelRequest(user._id)
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
            {friendRequestsReceived.length > 0 && (
                <>
                    <h2>Requests Received - {friendRequestsReceived.length}</h2>
                    <div className={styles.list}>
                        {friendRequestsReceived.map((user) => (
                            <div key={user._id} className={styles.userCard}>
                                <Avatar
                                    username={user.username}
                                    avatar={user.avatar}
                                    size="48px"
                                />
                                <p>{user.username}</p>
                                <div className={styles.buttons}>
                                    <button
                                        onClick={() =>
                                            acceptRequest(user._id)
                                        }
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() =>
                                            declineRequest(user._id)
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
