import { Icon, UserListItem } from "..";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./UserList.module.css";
import { v4 as uuidv4 } from "uuid";
import useComponents from "../../hooks/useComponents";

const contentData = {
    all: {
        src: "/assets/add-friend.svg",
        width: 376,
        height: 162,
        description: "Wumpus is waiting on friends. You don't have to though!",
        match: "friends",
        title: "All Friends",
    },
    online: {
        src: "/assets/no-online.svg",
        width: 421,
        height: 218,
        description: "No one's around to play with Wumpus.",
        match: "online friends",
        title: "Online",
    },
    pending: {
        src: "/assets/no-pending.svg",
        width: 415,
        height: 200,
        description: "There are no pending requests. Here's Wumpus for now.",
        match: "pending requests",
        title: "Pending",
    },
    blocked: {
        src: "/assets/no-blocked.svg",
        width: 433,
        height: 232,
        description: "You can't unblock the Wumpus.",
        match: "blocked users",
        title: "Blocked",
    },
};

const UserLists = ({ list, content }) => {
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState([]);

    const { setMenu } = useComponents();

    const searchbarMenuItems = [
        {
            name: "Spellcheck",
            icon: "box",
            iconSize: 18,
        },
        { name: "Divider" },
        {
            name: "Paste",
            text: "Ctrl+V",
            func: async () => {
                const text = await navigator.clipboard.readText();
                setSearch(search + text);
            },
        },
    ];

    useEffect(() => {
        if (search) {
            setFilteredList(list?.filter((user) => {
                if (content === "pending") {
                    user = user?.user;
                }
                return user?.username?.toLowerCase().includes(search.toLowerCase());
            }));
        } else {
            setFilteredList(list);
        }
    }, [search]);

    useEffect(() => {
        setFilteredList(list?.sort(
            (a, b) => a?.username?.localeCompare(b.username)
        ));
    }, [list]);

    const searchBar = useRef();

    const contentComponent = useMemo(() => (
        <div className={styles.content}>
            <div className={styles.searchBarContainer}>
                <div className={styles.searchBarInner}>
                    <input
                        ref={searchBar}
                        placeholder="Search"
                        aria-label="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setMenu({
                                event: e,
                                items: searchbarMenuItems,
                            });
                        }}
                    />

                    <div
                        className={styles.inputButton}
                        role="button"
                        style={{ cursor: search.length ? "pointer" : "text" }}
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
                {contentData[content].title} — {filteredList.length}
            </h2>

            <ul className={styles.listContainer}>
                {filteredList?.map((user, index) => (
                    <UserListItem
                        key={uuidv4()}
                        index={index}
                        user={user}
                        content={content}
                    />
                ))}
            </ul>
        </div>
    ), [filteredList, search])

    return (
        !list?.length ? (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src={contentData[content].src}
                        alt="No Data"
                        width={contentData[content].width}
                        height={contentData[content].height}
                        priority
                    />

                    <div>
                        {contentData[content].description}
                    </div>
                </div>
            </div>
        ) : !filteredList?.length && search?.length ? (
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
                            style={{ cursor: search.length ? "pointer" : "text" }}
                            onClick={() => {
                                if (search.length) setSearch("");
                                searchBar.current.focus();
                            }}
                            tabIndex={0}
                        >
                            <Icon name={search.length ? "cross" : "search"} size={20} />
                        </div>
                    </div>
                </div>

                <h2 className={styles.title}>
                    Your search for "{search}" did not match any {contentData[content].match}.
                </h2>
            </div>
        ) : contentComponent
    );
};

export default UserLists;
