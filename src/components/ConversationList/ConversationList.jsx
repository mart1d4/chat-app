import styles from "./ConversationList.module.css";
import { useRouter } from "next/router";
import { Avatar } from "..";
import Link from "next/link";

const ConversationList = ({ conversations }) => {
    const router = useRouter();
    const currentPath = router.asPath;

    const handleUrl = (url) => {
        localStorage.setItem("url", url);
    };

    return (
        <div className={styles.friends}>
            <div className={styles.searchContainer}>
                <div>
                    <input
                        type="text"
                        placeholder="Search channels"
                        className={styles.search}
                    />
                    <button
                        className={styles.searchButton}
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
                {conversations?.map((conv) => (
                    <li key={conv.members[0]._id}>
                        <Link
                            href={`/channels/${conv._id}`}
                            className={styles.link}
                            style={{
                                backgroundColor:
                                    currentPath === `/channels/${conv._id}` &&
                                    "#96989d3f",
                            }}
                            onClick={() => handleUrl(`/channels/${conv._id}`)}
                        >
                            <div className={styles.avatarContainer}>
                                <Avatar
                                    avatar={conv.members[0].avatar}
                                    username={conv.members[0].username}
                                    status={conv.members[0].status}
                                    size="32px"
                                    show
                                />
                            </div>
                            <p className={styles.friendUsername}>
                                {conv.members[0].username}
                                <br /> <span>{conv.members[0].customStatus}</span>
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConversationList;
