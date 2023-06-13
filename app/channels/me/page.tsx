import { AppHeader } from '@/app/app-components';
import styles from './FriendsPage.module.css';
import { ReactElement } from 'react';
import { Metadata } from 'next';
import Content from './Content';
import Aside from './Aside';

export const metadata: Metadata = {
    title: 'Chat App | Friends',
};

const FriendsPage = (): ReactElement => {
    return (
        <div className={styles.main}>
            <AppHeader />

            <div className={styles.content}>
                <Content />
                <Aside />
            </div>
        </div>
    );
};

export default FriendsPage;
