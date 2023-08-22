'use client';

import { useState, useEffect, ReactElement, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import { useLayers, useTooltip } from '@/lib/store';
import styles from './AppNav.module.css';
import { motion } from 'framer-motion';

type Props = {
    green?: boolean;
    special?: boolean;
    guild?: TGuild;
    name: string;
    link: string;
    src?: string;
    svg?: ReactNode;
    count?: number;
};

const NavIcon = ({ green, special, guild, name, link, src, svg, count }: Props): ReactElement => {
    const [active, setActive] = useState<boolean>(false);
    const [markHeight, setMarkHeight] = useState<number>(0);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const pathname = usePathname();
    const router = useRouter();
    const badgeCount = 12;

    useEffect(() => {
        if (special ? pathname.startsWith('/channels/me') : guild ? pathname.startsWith(link) : pathname === link) {
            setActive(true);
            setMarkHeight(40);
        } else {
            setActive(false);
            setMarkHeight(count ? 7 : 0);
        }
    }, [pathname, link, count]);

    let firstLetters =
        name
            .toLowerCase()
            .match(/\b(\w)/g)
            ?.join('') ?? '';

    return (
        <div className={green ? styles.navIcon + ' ' + styles.green : styles.navIcon}>
            <div className={styles.marker}>
                {markHeight > 0 && (
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

            <div
                className={active ? styles.wrapperActive : styles.wrapper}
                onMouseEnter={(e) => {
                    setTooltip({
                        text: name,
                        element: e.currentTarget,
                        position: 'RIGHT',
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
                    if (name === 'Add a Server') {
                        return setLayers({
                            settings: {
                                type: 'POPUP',
                            },
                            content: {
                                type: 'CREATE_GUILD',
                            },
                        });
                    }
                    router.push(link);
                }}
                onContextMenu={(e) => {
                    if (guild) {
                        setLayers({
                            settings: {
                                type: 'MENU',
                                event: e,
                            },
                            content: {
                                type: 'GUILD_ICON',
                                guild: guild,
                            },
                        });
                    }
                }}
                style={{
                    backgroundColor:
                        layers.POPUP?.content?.type === 'CREATE_GUILD' && name === 'Add a Server'
                            ? 'var(--success-1)'
                            : '',
                    color:
                        layers.POPUP?.content?.type === 'CREATE_GUILD' && name === 'Add a Server'
                            ? 'var(--foreground-1)'
                            : '',
                    borderRadius:
                        layers.POPUP?.content?.type === 'CREATE_GUILD' && name === 'Add a Server' ? '33%' : '',
                    fontSize:
                        !src && !svg
                            ? firstLetters?.length < 3
                                ? '18px'
                                : firstLetters?.length < 4
                                ? '16px'
                                : firstLetters?.length < 5
                                ? '14px'
                                : firstLetters?.length < 6
                                ? '12px'
                                : '10px'
                            : '',
                }}
            >
                {badgeCount > 0 && special && (
                    <div
                        className={styles.badgeContainer}
                        style={{
                            width: badgeCount > 99 ? '30px' : '',
                        }}
                    >
                        <div
                            style={{
                                width: badgeCount > 99 ? '20px' : '',
                                fontSize: badgeCount > 99 ? '10px' : '',
                            }}
                        >
                            {badgeCount}
                        </div>
                    </div>
                )}

                {src ? (
                    <img
                        style={{ borderRadius: active ? '33%' : '50%' }}
                        src={src}
                        alt={name}
                    />
                ) : svg ? (
                    svg
                ) : (
                    firstLetters
                )}
            </div>
        </div>
    );
};

export default NavIcon;
