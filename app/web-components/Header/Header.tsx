import AuthButton from '../AuthButton/AuthButton';
import styles from './Header.module.css';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

type Link = {
    name: string;
    href: string;
};

const links: Link[] = [
    { name: 'Download', href: '/download' },
    { name: 'Nitro', href: '' },
    { name: 'Discover', href: '' },
    { name: 'Safety', href: '' },
    { name: 'Support', href: '' },
    { name: 'Blog', href: '' },
    { name: 'Careers', href: '' },
];

const Header = () => {
    return (
        <header className={styles.header}>
            <nav>
                <a
                    href='/'
                    className={styles.brand}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='58'
                        height='58'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='#FFFFFF'
                        fill='none'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    >
                        <path d='M5 11h14v-3h-14z' />
                        <path d='M17.5 11l-1.5 10h-8l-1.5 -10' />
                        <path d='M6 8v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1' />
                        <path d='M15 5v-2' />
                    </svg>
                </a>

                <div className={styles.navLinks}>
                    {links.map((link) => (
                        <Link
                            href={link.href}
                            className={styles.navLink}
                            key={uuidv4()}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className={styles.appButton}>
                    <AuthButton link='login' />
                </div>
            </nav>
        </header>
    );
};

export default Header;
