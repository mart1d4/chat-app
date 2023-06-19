// @ts-nocheck

'use client';

import { useEffect, useCallback, useState, useMemo, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Tooltip.module.css';

type Props = {
    children: ReactElement | string;
    show: boolean;
    pos?: 'top' | 'bottom' | 'left' | 'right';
    dist?: number;
    delay?: number;
    arrow?: boolean;
    big?: boolean;
    sizeBig?: boolean;
    background?: string;
};

type RectType = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number;
    height?: number;
};

const Tooltip = ({
    children,
    show,
    pos,
    dist,
    delay,
    arrow,
    big,
    sizeBig,
    background,
}: Props): ReactElement => {
    const [parentRect, setParentRect] = useState<RectType>({});
    const [containerRect, setContainerRect] = useState<RectType>({});
    const [tooltipPos, setTooltipPos] = useState({});

    const distance = dist ? dist + 5 : 5;
    const position = pos ?? 'top';
    const showArrow = arrow ?? true;

    const containerRef = useCallback(
        (node: any) => {
            if (node !== null) {
                setParentRect(node.parentElement.getBoundingClientRect());
                setContainerRect(node.getBoundingClientRect());
            }
        },
        [children, show, pos, dist, delay, arrow, big, sizeBig, background]
    );

    useEffect(() => {
        if (!parent) return;

        switch (position) {
            case 'top':
                setTooltipPos({
                    top: parentRect?.top - containerRect?.height - distance,
                    left: parentRect?.left - containerRect?.width / 2 + parentRect?.width / 2,
                });
                break;
            case 'bottom':
                setTooltipPos({
                    top: parentRect.bottom + distance,
                    left: parentRect.left - containerRect.width / 2 + parentRect.width / 2,
                });
                break;
            case 'left':
                setTooltipPos({
                    top: parentRect.top - containerRect.height + parentRect.height / 2,
                    left: parentRect.left - containerRect.width - distance,
                });
                break;
            case 'right':
                setTooltipPos({
                    top: parentRect.top + containerRect.height - parentRect.height / 2,
                    left: parentRect.left + parentRect.width + distance,
                });
                break;
        }

        // If there's not enough space to the right, move it 20px from the right edge
        if (window.innerWidth - 10 - tooltipPos.left < containerRect.width) {
            setTooltipPos({
                ...tooltipPos,
                right: 20,
            });
        }
    }, [containerRect, children]);

    const arrowPosition = {
        top: {
            top: '100%',
            left: '50%',
            borderTopColor: background ?? 'var(--background-dark)',
            marginLeft: '-5px',
        },
        bottom: {
            bottom: '100%',
            left: '50%',
            borderBottomColor: background ?? 'var(--background-dark)',
            marginLeft: '-5px',
        },
        left: {
            left: '100%',
            top: '50%',
            borderLeftColor: background ?? 'var(--background-dark)',
            marginTop: '-5px',
        },
        right: {
            right: '100%',
            top: '50%',
            borderRightColor: background ?? 'var(--background-dark)',
            marginTop: '-5px',
        },
    };

    return useMemo(
        () => (
            <AnimatePresence>
                {show && (
                    <motion.div
                        ref={containerRef}
                        className={styles.container}
                        style={tooltipPos.top ? tooltipPos : {}}
                        onClick={(e) => e.preventDefault()}
                    >
                        <motion.span
                            className={sizeBig ? styles.tooltipBig : styles.tooltip}
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
                                    ease: 'easeInOut',
                                    delay: 0,
                                },
                            }}
                            transition={{
                                duration: 0.1,
                                ease: 'easeInOut',
                                delay: delay ?? 0,
                            }}
                            style={{
                                maxWidth: big ? '190px' : '',
                                backgroundColor: background ?? 'var(--background-dark)',
                            }}
                        >
                            {children}

                            {showArrow && (
                                <span
                                    className={styles.arrow}
                                    style={arrowPosition[position]}
                                />
                            )}
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        ),
        [show, children, position, tooltipPos, showArrow, big, sizeBig, background]
    );
};

export default Tooltip;
