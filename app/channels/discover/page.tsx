import styles from './Discover.module.css';
import { ReactElement } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chat App | Discover',
};

const DiscoverPage = (): ReactElement => {
    return (
        <div className={styles.container}>
            <h1>Discover</h1>
        </div>
    );
};

export default DiscoverPage;
