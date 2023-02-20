import useUserData from "../../hooks/useUserData";
import styles from "./AddFriend.module.css";
import { useEffect, useState, useRef } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Image from "next/image";

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
            inputRef.current.focus();
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
            inputRef.current.focus();
        }
    };

    return (
        <div className={styles.content}>
            <header className={styles.header}>
                <h2>Add Friend</h2>

                <form autoComplete="off">
                    <div className={styles.description}>
                        You can add a friend with their user ID. It's case sensitive.
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
                            className={input.length > 0 ? "blue" : "blue disabled"}
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

            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src="/assets/add-friend.svg"
                        alt="Add Friend"
                        width={376}
                        height={162}
                        priority
                    />

                    <div>
                        Wumpus is waiting on friends. You don't have to though!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFriend;
