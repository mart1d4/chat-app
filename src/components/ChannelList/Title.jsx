import { Icon, Tooltip } from "../";
import { useState } from "react";
import styles from "./Title.module.css";

const Title = () => {
    const [hover, setHover] = useState(false);

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <Icon
                    name="add"
                    size={16}
                    viewbox="0 0 18 18"
                />
                <Tooltip show={hover}>
                    Create DM
                </Tooltip>
            </div>
        </h2>
    )
}

export default Title;
