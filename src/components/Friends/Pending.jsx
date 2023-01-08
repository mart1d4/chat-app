import { Avatar } from "..";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import styles from "./Style.module.css";

const Pending = ({ sent, received, refresh }) => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    const cancelRequest = async (friendID) => {
        try {
            const response = await axiosPrivate.post(
                `/users/${friendID}/cancelrequest`,
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

    const acceptRequest = async (friendID) => {
        try {
            const response = await axiosPrivate.post(
                `/users/${friendID}/acceptrequest`,
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

    const declineRequest = async (friendID) => {
        try {
            const response = await axiosPrivate.post(
                `/users/${friendID}/declinerequest`,
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

    if (sent.length === 0 && received.length === 0) {
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
