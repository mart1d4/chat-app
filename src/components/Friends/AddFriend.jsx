import useUserData from "../../hooks/useUserData";
import styles from "./Style.module.css";
import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Alert } from "../";
import { AnimatePresence } from "framer-motion";

const AddFriend = () => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    const { auth, friendRequests, setFriendRequests, friends, setFriends } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const requestFriend = async () => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/request`,
                {
                    userID: input,
                },
            );
            setInput("");
            if (data.data.error) {
                setError(data.data.error);
            } else if (data.data.success === "Friend request accepted") {
                setFriendRequests(friendRequests.filter((request) => request.user._id.toString() !== input));
                setFriends([...friends, data.data.user]);
            } else {
                setFriendRequests([...friendRequests, data.data.request]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.content}>
            <h2>Add Friends</h2>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") requestFriend();
                    }}
                />
                <button onClick={requestFriend}>Add</button>
            </div>
        </div>
    );
};

export default AddFriend;
