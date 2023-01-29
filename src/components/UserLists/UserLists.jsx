import { Icon, ListItem } from "..";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./UserList.module.css";

const UserLists = ({ list, content }) => {
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState(list);

    useEffect(() => {
        if (search) {
            setFilteredList(list.filter((user) =>
                user.username.toLowerCase().includes(search.toLowerCase()))
            );
        } else setFilteredList(list);
    }, [list, content, search]);

    const searchBar = useRef(null);

    if (!list.length) {
        return (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src={content === "all"
                            ? "/images/no-friends.svg"
                            : content === "online"
                                ? "/images/no-online.svg"
                                : content === "pending"
                                    ? "/images/no-pending.svg"
                                    : "/images/no-blocked.svg"}
                        alt="No Data"
                        width={
                            content === "all"
                                ? 376
                                : content === "online"
                                    ? 421
                                    : content === "pending"
                                        ? 415
                                        : 433
                        }
                        height={
                            content === "all"
                                ? 162
                                : content === "online"
                                    ? 218
                                    : content === "pending"
                                        ? 200
                                        : 232
                        }
                    />

                    <div>
                        {content === "all"
                            ? "Wumpus is waiting on friends. You don't have to though!"
                            : content === "online"
                                ? "No one's around to play with Wumpus."
                                : content === "pending"
                                    ? "There are no pending requests. Here's Wumpus for now."
                                    : "You can't unblock the Wumpus."}

                    </div>
                </div>
            </div>
        )
    } else if (!filteredList.length && search.length) {
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

            <h2 className={styles.title}>
                Your search for "{search}" did not match any {content === "all" ? "Friends" : content === "online" ? "Online" : content === "pending" ? "Pending" : "Blocked"}.
            </h2>
        </div>
    }

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

            <h2 className={styles.title}>
                {content === "all" ? "All Friends " : content === "online"
                    ? "Online " : content === "pending" ? "Pending " : "Blocked "}
                — {filteredList.length}
            </h2>

            <ul className={styles.listContainer}>
                {filteredList?.map((user, index) => (
                    <ListItem
                        key={index}
                        index={index}
                        user={user}
                        content={content}
                    />
                ))}
            </ul>
        </div >
    );
};

export default UserLists;
