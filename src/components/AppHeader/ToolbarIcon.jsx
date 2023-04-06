import styles from "./AppHeader.module.css";
import { Tooltip, Icon } from "../";
import { useEffect, useRef, useState } from "react";
import useComponents from "../../hooks/useComponents";

const ToolbarIcon = ({ item }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const { menu, setMenu } = useComponents();
    const element = useRef(null);

    useEffect(() => {
        if (item?.name !== "Pinned Messages") return;

        const handleClick = (e) => {
            if (element.current.contains(e.target)) return;
            // setMenu(null);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <div
            ref={element}
            className={styles.toolbarIcon}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => item.func(e, element.current, menu)}
        >
            <Icon name={item.icon} />

            <Tooltip
                show={showTooltip && (
                    item.name === "Pinned Messages" ? (
                        menu?.name !== "pin"
                    ) : true
                )}
                pos="bottom"
                dist={5}
            >
                {item.name}
            </Tooltip>
        </div>
    );
}

export default ToolbarIcon;
