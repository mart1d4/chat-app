import useUserData from "../../hooks/useUserData";
import styles from "./AddFriend.module.css";
import { useEffect, useState, useRef } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AddFriend = () => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [valid, setValid] = useState("");

    const {
        auth,
        friendRequests,
        setFriendRequests,
        friends,
        setFriends
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const requestFriend = async () => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/request`,
                { userID: input },
            );
            if (data.data.error) {
                setError(data.data.error);
            } else if (data.data.success === "Friend request accepted") {
                setFriendRequests(friendRequests.filter(
                    (request) => request._id.toString() !== input
                ));
                setFriends([...friends, data.data.user]);
                setValid(`You are now friends with ${data.data.user.username}`);
                setInput("");
            } else {
                setFriendRequests([...friendRequests, data.data.request]);
                setValid(`Success! Your friend request to ${data.data.request.username} was sent.`);
                setInput("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.content}>
            <header className={styles.header}>
                <h2>Add Friend</h2>

                <form autoComplete="off">
                    <div className={styles.description}>
                        You can add a friend by entering their username or user ID. They are case sensitive.
                    </div>

                    <div
                        className={styles.inputWrapper}
                        style={{
                            outline: error.length > 0 ? "1px solid var(--error-1)"
                                : valid.length > 0 && "1px solid var(--valid-1)",
                        }}
                    >
                        <div>
                            <input
                                ref={inputRef}
                                type="text"
                                autoComplete="off"
                                placeholder="Enter username or user ID"
                                aria-label="Enter username or user ID"
                                maxLength={32}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError("");
                                    setValid("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        requestFriend();
                                    }
                                }}
                            />
                        </div>

                        <button
                            style={{
                                opacity: input.length > 0 ? 1 : 0.5,
                                cursor: input.length > 0 ? "pointer" : "not-allowed",
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                requestFriend();
                            }}
                        >
                            Send Friend Request
                        </button>
                    </div>

                    {error.length > 0 && (
                        <div className={styles.error}>{error}</div>
                    )}

                    {valid.length > 0 && (
                        <div className={styles.valid}>{valid}</div>
                    )}
                </form>
            </header>
        </div>
    );
};

export default AddFriend;
