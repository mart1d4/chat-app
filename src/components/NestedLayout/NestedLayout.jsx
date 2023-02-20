import { ChannelList } from "../";
import styles from "./NestedLayout.module.css";

const NestedLayout = ({ children }) => {
    return (
        <div className={styles.container}>
            <ChannelList />
            {children}
        </div>
    );
};

export default NestedLayout;
