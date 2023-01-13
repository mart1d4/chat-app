import { ChannelList } from "../";
import styles from "./NestedLayout.module.css";
import useUserData from "../../hooks/useUserData";


const NestedLayout = ({ children }) => {
    const { channels } = useUserData();

    return (
        <div className={styles.container}>
            <ChannelList channels={channels} />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default NestedLayout;
