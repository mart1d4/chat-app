import useAuth from "../../hooks/useAuth";
import styles from "./Style.module.css";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AddFriend = () => {
    const [input, setInput] = useState("");

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        console.log(input);
    }, [input]);

    const requestFriend = async () => {
        try {
            await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/${input}/request`,
            );
            setInput("");
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
