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

    return <div className={styles.aside}></div>;
};

export default Aside;
