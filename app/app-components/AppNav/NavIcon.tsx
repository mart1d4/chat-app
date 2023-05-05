'use client';

import { Tooltip } from '@/app/app-components';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, ReactElement, ReactNode } from 'react';
import styles from './AppNav.module.css';
import { motion } from 'framer-motion';

type Props = {
    name: string;
    link: string;
    src?: string;
    svg?: ReactNode;
};

const NavIcon = ({ name, link, src, svg }: Props): ReactElement => {
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [active, setActive] = useState<boolean>(false);
    const [markHeight, setMarkHeight] = useState<number>(0);

    const pathname = usePathname();
    const router = useRouter();
    const requests = [1];

    useEffect(() => {
        if (pathname.includes(link)) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(0);
        }
    }, [pathname]);

    return (
        <div className={styles.navIcon}>
            <Tooltip
                show={showTooltip}
                pos='right'
                dist={5}
                sizeBig
            >
                {name}
            </Tooltip>

            <div className={styles.marker}>
                {(showTooltip || active) && (
                    <motion.span
                        initial={{
                            opacity: 0,
                            scale: 0,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            height: markHeight,
                        }}
                        transition={{
                            duration: 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                )}
            </div>

            <motion.div
                className={
                    active ? styles.navIconWrapperActive : styles.navIconWrapper
                }
                onMouseEnter={() => {
                    setShowTooltip(true);
                    if (!active) {
                        setMarkHeight(20);
                    }
                }}
                onMouseLeave={() => {
                    setShowTooltip(false);
                    if (!active) {
                        setMarkHeight(0);
                    }
                }}
                onClick={() => {
                    setShowTooltip(false);
                    router.push(link);
                }}
                transition={{
                    duration: 0,
                    delay: 0,
                    ease: 'linear',
                }}
                whileTap={{
                    transform: 'translateY(1px)',
                }}
            >
                {requests.length > 0 && (
                    <div className={styles.badgeContainer}>
                        <div>{requests.length}</div>
                    </div>
                )}

                {src ? (
                    <img
                        src={src}
                        alt={name}
                    />
                ) : (
                    svg
                )}
            </motion.div>
        </div>
    );
};

export default NavIcon;
