import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";
import styles from "./Style.module.css";
import { useRouter } from "next/router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Online = () => {
    const { auth } = useAuth();
    const { friends, setFriends, channels, getChannels } = useUserData();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();

    const onlineFriends = friends.filter((friend) => friend.status === "online");

    const removeFriend = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${friendID}/remove`,
            );
            setFriends(friends.filter((friend) => friend._id !== friendID));
            getChannels();
        } catch (err) {
            console.error(err);
        }
    };

    const startConversation = async (friendID) => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/channels/${getFriendConversation(friendID)}/add`,
            );
            router.push(`/channels/${getFriendConversation(friendID)}`);
        } catch (err) {
            console.error(err);
        }
    };

    if (!onlineFriends.length) {
        return (
            <div className={styles.content}>
                <h2>No friends online</h2>
            </div>
        );
    }

    const getFriendConversation = (friendID) => {
        const channel = channels.find(
            (channel) =>
                channel.members.length === 2 &&
                channel.members.includes(friendID)
        );
        return channel._id;
    };

    return (
        <div className={styles.content}>
            <h2>Online Friends - {onlineFriends.length}</h2>
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
                            <button onClick={() => startConversation(friend._id)}>
                                Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Online;
