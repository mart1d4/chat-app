import { Layout, NestedLayout, AppHeader } from '../components/';
import styles from '../styles/Servers.module.css';

const Servers = () => {
    return (
        <div className={styles.container}>
            <AppHeader
                content="friends"
                active={"online"}
            />

            <div className={styles.content}>
                Servers coming soon!
            </div>
        </div>
    );
}

Servers.getLayout = (page) => {
    return (
        <Layout>
            <NestedLayout>
                {page}
            </NestedLayout>
        </Layout>
    );
};

export default Servers;
