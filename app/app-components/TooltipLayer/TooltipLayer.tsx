'use client';

import { useEffect, useState, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import styles from './TooltipLayer.module.css';

const TooltipLayer = (): ReactElement => {
    const [positions, setPositions] = useState<any>({});
    const [arrowPositions, setArrowPositions] = useState<any>({});

    const { tooltip }: any = useContextHook({ context: 'tooltip' });
    const text = tooltip?.text || null;
    const element = tooltip?.element || null;
    const position = tooltip?.position || 'top';
    const gap = tooltip?.gap || 0;
    const big = tooltip?.big || false;
    const color = tooltip?.color || 'var(--background-dark)';
    const delay = tooltip?.delay / 1000 || 0;
    const arrow = tooltip?.arrow || true;

    useEffect(() => {
        if (!tooltip) {
            setPositions({});
            setArrowPositions({});
            return;
        }

        let pos: any = {};
        let arrowPos: any = {};

        const container = element?.getBoundingClientRect();
        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        if (!container) return;

        if (position === 'top') {
            pos = {
                bottom: screenY - container.top + gap + 6,
                left: container.left + container.width / 2,
                transform: 'translateX(-50%)',
            };

            arrowPos = {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderTopColor: color,
            };
        } else if (position === 'bottom') {
            pos = {
                top: container.bottom + gap + 5,
                left: container.left + container.width / 2,
                transform: 'translateX(-50%)',
            };

            arrowPos = {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderBottomColor: color,
            };
        } else if (position === 'left') {
            pos = {
                top: container.top + container.height / 2,
                right: screenX - container.left + gap + 6,
                transform: 'translateY(-50%)',
            };

            arrowPos = {
                top: '50%',
                left: '100%',
                transform: 'translateY(-50%)',
                borderLeftColor: color,
            };
        } else if (position === 'right') {
            pos = {
                top: container.top + container.height / 2,
                left: container.right + gap + 5,
                transform: 'translateY(-50%)',
            };

            arrowPos = {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderRightColor: color,
            };
        }

        // if (position === 'top' || position === 'bottom') {
        //     if (pos.left < 0) {
        //         pos.left = 20;
        //     } else if (pos.left > window.innerWidth) {
        //         pos.left = window.innerWidth - 20;
        //     }
        // } else if (position === 'left' || position === 'right') {
        //     if (pos.top < 0) {
        //         pos.top = 20;
        //     } else if (pos.top > window.innerHeight) {
        //         pos.top = window.innerHeight - 20;
        //     }
        // }

        setPositions(pos);
        setArrowPositions(arrowPos);
    }, [tooltip]);

    return (
        <AnimatePresence>
            {tooltip && positions?.transform && (
                <div
                    style={{ ...positions }}
                    className={styles.container}
                >
                    <motion.div
                        className={big ? styles.tooltip + ' ' + styles.big : styles.tooltip}
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                            transition: {
                                duration: 0.1,
                                ease: 'backOut',
                                delay: 0,
                            },
                        }}
                        transition={{
                            duration: 0.2,
                            ease: 'backOut',
                            delay: delay,
                        }}
                        style={{
                            maxWidth: big ? '190px' : '',
                            backgroundColor: color,
                        }}
                    >
                        {text}

                        {arrow && <span style={{ ...arrowPositions }} />}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TooltipLayer;
