import styles from "./AppHeader.module.css";
import { Tooltip, Icon } from "../";
import { useState } from "react";

const ToolbarIcon = ({ item }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className={styles.toolbarIcon}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => item.func()}
        >
            <Icon name={item.icon} />

            <Tooltip
                show={showTooltip}
                pos="bottom"
                dist={5}
            >
                {item.name}
            </Tooltip>
        </div>
    );
}

export default ToolbarIcon;
