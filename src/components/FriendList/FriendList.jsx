import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import styles from "./FriendList.module.css";
import { useRouter } from "next/router";
import { Avatar } from "..";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Link from "next/link";

const FriendList = ({ friends, refresh }) => {
    const [search, setSearch] = useState("");

    const { auth } = useAuth();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();
    const currentPath = router.asPath;

    useEffect(() => {
        if (!auth?.accessToken) router.push("/login");
    }, []);

    const requestFriend = async (friendID) => {
        try {
            const response = await axiosPrivate.post(
                `/users/${friendID}/addfriend`,
                {
                    userID: auth?.user._id,
                }
            );
            console.log(response.data);
        } catch (err) {
            console.error(err);
        }

        setSearch("");
        refresh();
    };

    const handleUrl = (url) => {
        localStorage.setItem("url", url);
    };

    return (
        <div className={styles.friends}>
            <div className={styles.searchContainer}>
                <div>
                    <input
                        type="text"
                        placeholder="Search friends"
                        className={styles.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className={styles.searchButton}
                        onClick={() => requestFriend(search)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>
            </div>

            <ul className={styles.friendsList}>
                <Link
                    href="/friends"
                    className={styles.friendsLink}
                    style={{
                        color: currentPath === "/friends" ? "#fff" : "#96989D",
                        backgroundColor:
                            currentPath === "/friends" && "#96989d3f",
                    }}
                    onClick={() => handleUrl("/friends")}
                >
                    Friends
                </Link>

                <h3 className={styles.title}>Direct Messages</h3>
                {friends?.map((friend, index) => (
                    <li key={friend._id}>
                        <Link
                            href={`/channels/${friend._id}`}
                            className={styles.link}
                            style={{
                                backgroundColor:
                                    currentPath === `/channels/${friend._id}` &&
                                    "#96989d3f",
                            }}
                            onClick={() => handleUrl(`/channels/${friend._id}`)}
                        >
                            <div className={styles.avatarContainer}>
                                <Avatar
                                    avatar={friend.avatar}
                                    username={friend.username}
                                    status={friend.status}
                                    size="32px"
                                    show
                                />
                            </div>
                            <p className={styles.friendUsername}>
                                {friend.username}
                                <br /> <span>{friend.customStatus}</span>
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;
