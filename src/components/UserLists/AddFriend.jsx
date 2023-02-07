import useUserData from "../../hooks/useUserData";
import styles from "./AddFriend.module.css";
import { useEffect, useState, useRef } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AddFriend = () => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [valid, setValid] = useState("");

    const {
        requests,
        setRequests,
        friends,
        setFriends,
        setChannels,
    } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    useEffect(() => {
        if (error.length > 0) {
            setValid("");
        } else if (valid.length > 0) {
            setError("");
        }
    }, [error, valid]);

    const requestFriend = async () => {
        const response = await axiosPrivate.post(
            `/users/@me/friends/${input}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setInput("");
            setValid(response.data.message);
            if (response.data.message === "Friend request sent") {
                setRequests([
                    ...requests,
                    response.data.request,
                ]);
            } else if (response.data.message === "Friend request accepted") {
                setFriends([
                    ...friends,
                    response.data.friend,
                ]);

                setRequests(requests.filter(
                    (request) => request.user._id !== response.data.friend._id
                ));

                if (response.data.channel) {
                    setChannels((prev) => [
                        ...prev,
                        response.data.channel,
                    ]);
                }
            }
        } else {
            setError("An error occurred.");
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
                                : valid.length > 0 && "1px solid var(--success-1)",
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
                                if (!input.length) {
                                    inputRef.current.focus();
                                    return;
                                }
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
