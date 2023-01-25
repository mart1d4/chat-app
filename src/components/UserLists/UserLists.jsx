import { Tooltip, Icon, AvatarStatus, Menu, Alerts } from "..";
import { useEffect, useRef, useState } from "react";
import useUserData from "../../hooks/useUserData";
import userActions from "../../utils/functions/usersActions";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import styles from "./Style.module.css";

const UserLists = ({ list, content }) => {
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState(list);
    const [liHover, setLiHover] = useState(null);
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (search) {
            setFilteredList(list.filter((user) =>
                user.username.toLowerCase().includes(search.toLowerCase()))
            );
        } else setFilteredList(list);
    }, [list, content, search]);

    useEffect(() => {
        if (!error || error === "") return;

        const timout = setTimeout(() => {
            setError(null);
        }, 10000);

        return () => clearTimeout(timout);
    }, [error]);

    const searchBar = useRef(null);
    const { auth } = useUserData();

    const moreMenuItems = [
        {
            name: "Remove Friend", func: () => {
                userActions("remove", list[showMenu]._id, setError);
            }, danger: true
        },
        {
            name: "Block", func: () => {
                userActions("block", list[showMenu]._id, setError);
            }, danger: true
        },
        {
            name: "Message", func: () => {
                userActions("start", list[showMenu]._id, setError);
            }
        },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: () => {
                navigator.clipboard.writeText(list[showMenu]._id)
            }
        },
    ];

    if (!list.length) {
        return (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <img
                        src={content === "all"
                            ? "/images/no-friends.svg"
                            : content === "online"
                                ? "/images/no-online.svg"
                                : content === "pending"
                                    ? "/images/no-pending.svg"
                                    : "/images/no-blocked.svg"}
                        alt="no-data"
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

            <AnimatePresence>
                {error && <Alerts type="error" message={error} />}
            </AnimatePresence>

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
                    <li
                        key={user._id}
                        className={
                            liHover === index
                                ? styles.liContainerHover
                                : styles.liContainer
                        }
                        onClick={() => {
                            if (!(content === "online" || content === "all")) return;
                            userActions("start", user._id, setError);
                        }}
                        onMouseEnter={() => {
                            setLiHover(index);
                            if (showMenu !== null && showMenu !== index) {
                                setShowMenu(null);
                            }
                        }}
                        onMouseLeave={() => {
                            if (showMenu === index) return;
                            setLiHover(null);
                        }}
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
                                    {(content === "online" || content === "all" || (
                                        content === "pending" && user.sender !== auth?.user?._id
                                    )) && (
                                            <AvatarStatus
                                                status={user.status}
                                                background={liHover === index ? "var(--background-hover-1)" : "var(--background-4)"}
                                            />
                                        )}
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.textUsername}>{user.username}</p>
                                    {content === "pending" && (
                                        <p className={styles.textStatus}>
                                            <span title="Custom Status">
                                                {user.type === "sent"
                                                    ? "Outgoing request"
                                                    : "Incoming request"}
                                            </span>
                                        </p>
                                    )}

                                    {content === "blocked" && (
                                        <p className={styles.textStatus}>
                                            <span title="Custom Status">Blocked</span>
                                        </p>
                                    )}

                                    {(content === "all" || content === "online") && (
                                        <p className={styles.textStatus}>
                                            {user.customStatus === ""
                                                ? user.status
                                                : <span title="Custom Status">{user.customStatus}</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                {(content === "all" || content === "online") && (
                                    <>
                                        <button
                                            onMouseEnter={() => setShowTooltip(user._id)}
                                            onMouseLeave={() => setShowTooltip(null)}
                                        >
                                            <Icon name="message" size={20} />
                                            <Tooltip
                                                show={showTooltip === user._id}
                                            >
                                                Message
                                            </Tooltip>
                                        </button>
                                        <button
                                            onMouseEnter={() => setShowTooltip(user._id + 1)}
                                            onMouseLeave={() => setShowTooltip(null)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(showMenu === index ? null : index);
                                                setShowTooltip(null);
                                            }}
                                        >
                                            <Icon name="more" size={20} />
                                            <Tooltip
                                                show={showTooltip === user._id + 1 && showMenu !== index}
                                            >
                                                More
                                            </Tooltip>

                                            {showMenu === index && (
                                                <Menu
                                                    items={moreMenuItems}
                                                    position={{
                                                        top: "calc(100% + 5px)",
                                                        right: "0",
                                                    }}
                                                    setMenu={{
                                                        func: () => {
                                                            setShowMenu(null);
                                                            setShowTooltip(null);
                                                            setLiHover(null);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </button>
                                    </>
                                )}

                                {content === "blocked" && (
                                    <button
                                        onClick={() => userActions("unblock", user._id, setError)}
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
                                        <Tooltip show={showTooltip === index}>
                                            Unblock
                                        </Tooltip>
                                    </button>
                                )}

                                {content === "pending" && (
                                    <>
                                        {user.type === "received" && (
                                            <button
                                                onClick={() => userActions("accept", user._id, setError)}
                                                onMouseEnter={() => setShowTooltip(index)}
                                                onMouseLeave={() => setShowTooltip(null)}
                                            >
                                                <Icon
                                                    name="accept"
                                                    size={20}
                                                    fill={
                                                        showTooltip === index
                                                        && "var(--valid-1)"
                                                    }
                                                />
                                                <Tooltip show={showTooltip === index}>
                                                    Accept
                                                </Tooltip>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (user.type === "sent") userActions("cancel", user._id, setError);
                                                else userActions("ignore", user._id, setError);;
                                            }}
                                            onMouseEnter={() => setShowTooltip(index + 1)}
                                            onMouseLeave={() => setShowTooltip(null)}
                                        >
                                            <Icon
                                                name="cancel"
                                                size={20}
                                                fill={
                                                    showTooltip === index + 1
                                                    && "var(--error-1)"
                                                }
                                            />
                                            <Tooltip show={showTooltip === index + 1}>
                                                {user.type === "sent" ? "Cancel" : "Ignore"}
                                            </Tooltip>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    );
};

export default UserLists;
