import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, show, pos, dist, delay, arrow }) => {
    const [parentRect, setParentRect] = useState({});
    const [containerRect, setContainerRect] = useState({});
    const [tooltipPos, setTooltipPos] = useState({});

    const distance = dist ?? 6;
    const position = pos ?? 'top';
    const showArrow = arrow ?? true;

    const containerRef = useCallback(node => {
        if (node !== null) {
            setParentRect(node.parentElement.getBoundingClientRect());
            setContainerRect(node.getBoundingClientRect());
        }
    }, []);

    useEffect(() => {
        if (!parent) return;

        switch (position) {
            case 'top':
                setTooltipPos({
                    top: parentRect.top - containerRect.height * 2 - distance,
                    left: parentRect.left - containerRect.width + parentRect.width / 2,
                });
                break;
            case 'bottom':
                setTooltipPos({
                    bottom: parentRect.bottom - containerRect.height * 2 - distance,
                    left: parentRect.left - containerRect.width + parentRect.width / 2,
                });
                break;
            case 'left':
                setTooltipPos({
                    top: parentRect.top - containerRect.height + parentRect.height / 2,
                    left: parentRect.left - containerRect.width * 2 - distance,
                });
                break;
            case 'right':
                setTooltipPos({
                    top: parentRect.top - containerRect.height + parentRect.height / 2,
                    right: parentRect.right - containerRect.width * 2 - distance,
                });
                break;
            default:
                setTooltipPos({
                    top: parentRect.top - containerRect.height * 2 - distance,
                    left: parentRect.left - containerRect.width + parentRect.width / 2,
                });
                break;
        }

    }, [containerRect]);

    const arrowPosition = {
        top: {
            borderTop: '4px solid var(--background-dark)',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
        },
        bottom: {
            borderBottom: '4px solid var(--background-dark)',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
        },
        left: {
            borderLeft: '4px solid var(--background-dark)',
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
        },
        right: {
            borderRight: '4px solid var(--background-dark)',
            left: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
        },
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    ref={containerRef}
                    className={styles.container}
                    style={{
                        top: position !== "bottom" && `${tooltipPos.top}px`,
                        left: position !== "right" && `${tooltipPos.left}px`,
                        bottom: position === "bottom" && `${tooltipPos.bottom}px`,
                        right: position === "right" && `${tooltipPos.right}px`,
                    }}
                    initial={{
                        opacity: 0,
                        transform: `scale(0.5)`
                    }}
                    animate={{
                        opacity: 1,
                        transform: `scale(1)`
                    }}
                    exit={{
                        opacity: 0,
                        transform: `scale(0.5)`,
                        transition: {
                            duration: 0.05,
                            ease: 'easeInOut',
                            delay: 0,
                        },
                    }}
                    transition={{
                        duration: 0.05,
                        ease: 'easeInOut',
                        delay: delay ?? 0
                    }}
                    onClick={(e) => e.preventDefault()}
                >
                    <span className={styles.tooltip}>
                        {children}

                        {showArrow && (
                            <span
                                className={styles.arrow}
                                style={arrowPosition[position]}
                            />
                        )}
                    </span>
                </motion.div>)
            }
        </AnimatePresence >
    );

}

export default Tooltip;
