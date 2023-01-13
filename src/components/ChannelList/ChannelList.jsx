import styles from "./ChannelList.module.css";
import { useRouter } from "next/router";
import { Avatar } from "..";
import Link from "next/link";

const ConversationList = ({ channels }) => {
    const router = useRouter();
    const currentPath = router.asPath;

    const handleUrl = (url) => {
        localStorage.setItem("url", url);
    };

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button
                        className={styles.searchButton}
                    >
                        Find or start a conversation
                    </button>
                </div>

                <div className={styles.scroller}>
                    <ul className={styles.channelList}>
                        <div></div>
                        <Link
                            href="/friends"
                            className={styles.liContainer}
                            style={{
                                color: currentPath === "/friends" ? "#fff" : "#96989D",
                                backgroundColor:
                                    currentPath === "/friends" && "#96989d3f",
                            }}
                            onClick={() => handleUrl("/friends")}
                        >
                            Friends
                        </Link>

                        <h2 className={styles.title}>Direct Messages</h2>
                        {channels?.map((conv) => (
                            <li key={conv.members[0]._id} className={styles.liContainer}>
                                <div className={styles.liInner}>
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
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={styles.userSection}>

            </div>
        </div>
    );
};

export default ConversationList;
