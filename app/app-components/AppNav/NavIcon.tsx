'use client';

import { useState, useEffect, ReactElement, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import styles from './AppNav.module.css';
import { motion } from 'framer-motion';

type Props = {
    name: string;
    link: string;
    src?: string;
    svg?: ReactNode;
    count?: number;
};

const NavIcon = ({ name, link, src, svg, count }: Props): ReactElement => {
    const [active, setActive] = useState<boolean>(false);
    const [markHeight, setMarkHeight] = useState<number>(0);

    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const pathname = usePathname();
    const router = useRouter();
    const badgeCount = count ?? auth.user.requestReceivedIds.length;

    useEffect(() => {
        if (link.includes(pathname)) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(count ? 7 : 0);
        }
    }, [pathname, count]);

    return (
        <div className={styles.navIcon}>
            <div className={styles.marker}>
                {(active || count) && (
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
                className={active ? styles.navIconWrapperActive : styles.navIconWrapper}
                onMouseEnter={(e) => {
                    setTooltip({
                        text: name,
                        element: e.target,
                        position: 'right',
                        gap: 15,
                        big: true,
                    });
                    if (!active) setMarkHeight(20);
                }}
                onMouseLeave={() => {
                    setTooltip(null);
                    if (!active) setMarkHeight(count ? 7 : 0);
                }}
                onClick={() => {
                    setTooltip(null);
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
                style={{
                    backgroundColor: src ? 'transparent' : '',
                }}
            >
                {badgeCount > 0 && (
                    <div className={styles.badgeContainer}>
                        <div>{badgeCount}</div>
                    </div>
                )}

                {src ? (
                    <img
                        style={{ borderRadius: active ? '33%' : '50%' }}
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
