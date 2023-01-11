import { AppNav } from "../";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <AppNav />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
