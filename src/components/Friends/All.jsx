import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import styles from "./Style.module.css";

const All = ({ friends, refresh }) => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const removeFriend = async (friendID) => {
        try {
            const response = await axiosPrivate.post(
                `/users/${friendID}/removefriend`,
                {
                    userID: auth?.user._id,
                }
            );
            console.log(response.data);
        } catch (err) {
            console.error(err);
        }
        refresh();
    };

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
