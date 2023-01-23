import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import styles from "./Style.module.css";
import { useRef, useState } from "react";
import { Tooltip, Icon } from "../"
import Image from "next/image";

const Blocked = () => {
    const [search, setSearch] = useState("");
    const [showTooltip, setShowTooltip] = useState(null);
    const [liHover, setLiHover] = useState(null);
    const [error, setError] = useState(null);

    const searchBar = useRef(null);

    const { auth, blockedUsers, setBlockedUsers } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const unblockUser = async (userID) => {
        try {
            const data = await axiosPrivate.post(
                `/users/${auth?.user._id}/friends/unblock`,
                { userID: userID }
            );
            if (data.data.error) {
                setError(data.data.error);
            } else {
                setBlockedUsers(blockedUsers.filter((user) => user._id.toString() !== userID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.searchBarContainer}>
                <div className={styles.searchBarInner}>
                    <input
                        ref={searchBar}
                        placeholder="Search"
                        aria-label="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div
                        className={styles.inputButton}
                        role="button"
                        style={{
                            cursor: search.length ? "pointer" : "text",
                        }}
                        onClick={() => {
                            if (search.length) setSearch("");
                            searchBar.current.focus();
                        }}
                    >
                        <Icon name={search.length ? "cross" : "search"} size={20} />
                    </div>
                </div>
            </div>
            <h2 className={styles.title}>Blocked — {blockedUsers.length}</h2>
            <ul className={styles.listContainer}>
                {blockedUsers.map((user, index) => (
                    <li
                        key={user._id}
                        className={
                            liHover === index
                                ? styles.liContainerHover
                                : styles.liContainer
                        }
                        onMouseEnter={() => setLiHover(index)}
                        onMouseLeave={() => setLiHover(null)}
                        style={{
                            borderColor: liHover === index - 1 && "transparent",
                        }}
                    >
                        <div className={styles.li}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatarWrapper}>
                                    <Image
                                        src={user.avatar}
                                        width={32}
                                        height={32}
                                        alt="Avatar"
                                    />
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{user.username}</p>
                                    <p
                                        className={styles.textStatus}
                                        style={{
                                            fontSize: "12px",
                                        }}
                                    >
                                        Blocked
                                    </p>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={() => unblockUser(user._id)}
                                    onMouseEnter={() => setShowTooltip(index)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <Icon
                                        name="userDelete"
                                        size={20}
                                        fill={
                                            showTooltip === index
                                            && "var(--error-1)"
                                        }
                                    />
                                    <Tooltip
                                        show={showTooltip === index}
                                    >
                                        Unblock
                                    </Tooltip>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    );
};

export default Blocked;
