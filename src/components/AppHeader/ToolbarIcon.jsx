import styles from "./AppHeader.module.css";
import { Tooltip, Icon } from "../";
import { useRef, useState } from "react";
import useComponents from "../../hooks/useComponents";

const ToolbarIcon = ({ item }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const { menu } = useComponents();
    const element = useRef(null);

    return (
        <div
            ref={element}
            className={styles.toolbarIcon}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                item.func(e, element.current, menu);
            }}
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
