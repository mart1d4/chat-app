'use client';

import { useState, useEffect } from 'react';
import styles from './Aside.module.css';

const Aside = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1200) {
                setIsOpen(false);
                return;
            }
            setIsOpen(true);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen) return null;

    return (
        <aside className={styles.aside + ' scrollbar'}>
            <h2>Active Now</h2>

            <div>
                <h3>It's quiet for now...</h3>
                <div>
                    When a friend starts an activity—like playing a game or hanging out on
                    voice—we’ll show it here!
                </div>
            </div>
        </aside>
    );
};

export default Aside;
