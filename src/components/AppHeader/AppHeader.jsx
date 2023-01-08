import styles from "./AppHeader.module.css";

const AppHeader = ({ content, setContent, active }) => {
    const tabs = [
        {
            name: "Online",
            func: "online",
        },
        {
            name: "All",
            func: "all",
        },
        {
            name: "Pending",
            func: "pending",
        },

        {
            name: "Blocked",
            func: "blocked",
        },
        {
            name: "Add Friend",
            func: "add",
        },
    ];

    if (content === "friends") {
        return (
            <div className={styles.header}>
                <h1>Friends</h1>
                <div className={styles.split}></div>
                <ul className={styles.list}>
                    {tabs.map((tab, index) => (
                        <li
                            key={index}
                            onClick={() => setContent(tab.func)}
                            style={{
                                backgroundColor: active === tab.func && "#96989d3f",
                                cursor: active === tab.func && "default",
                            }}
                            className={styles.item}
                        >
                            {tab.name}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
};

export default AppHeader;
