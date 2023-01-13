import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";

const Blocked = () => {
    const { auth } = useAuth();
    const { blockedUsers, setBlockedUsers } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const unblock = async (blockedID) => {
        try {
            await axiosPrivate.post(
                `/${auth?.user._id}/friends/${blockedID}/unblock`,
            );
            setBlockedUsers(blockedUsers.filter((user) => user._id !== blockedID));
        } catch (err) {
            console.error(err);
        }
    }

    if (!blockedUsers.length) {
        return (
            <div className={styles.content}>
                <h2>You haven't blocked anyone</h2>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <h2>Blocked Users - {blockedUsers.length}</h2>
            <div className={styles.list}>
                {blockedUsers.map((user) => (
                    <div key={user._id} className={styles.userCard}>
                        <Avatar
                            username={user.username}
                            avatar={user.avatar}
                            size="48px"
                        />
                        <p>{user.username}</p>
                        <div className={styles.buttons}>
                            <button onClick={() => unblock(user._id)}>
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
