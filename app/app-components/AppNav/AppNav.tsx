import styles from './AppNav.module.css';
import { ReactElement } from 'react';
import NavIcon from './NavIcon';

const AppNav = (): ReactElement => {
    const chatappIcon = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            fill='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M5 11h14v-3h-14z' />
            <path d='M17.5 11l-1.5 10h-8l-1.5 -10' />
            <path d='M6 8v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1' />
            <path d='M15 5v-2' />
        </svg>
    );

    return (
        <nav className={styles.nav}>
            <ul className={styles.list}>
                <NavIcon
                    name='Friends'
                    link='/channels/me'
                    svg={chatappIcon}
                />

                <NavIcon
                    name='Discover'
                    link='/channels/discover'
                    svg={chatappIcon}
                />

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>
            </ul>
        </nav>
    );
};

export default AppNav;
