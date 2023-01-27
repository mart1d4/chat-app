import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, show, pos, dist, delay, arrow }) => {
    const [parentRect, setParentRect] = useState({});
    const [containerRect, setContainerRect] = useState({});
    const [tooltipPos, setTooltipPos] = useState({});

    const distance = dist ? dist + 5 : 5;
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
                    top: parentRect.bottom + distance,
                    left: parentRect.left - containerRect.width + parentRect.width / 2,
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
                    top: parentRect.top - containerRect.height + parentRect.height / 2,
                    left: parentRect.left + parentRect.width + distance,
                });
                break;
        }
    }, [containerRect]);

    const arrowPosition = {
        "top": {
            top: '100%',
            left: '50%',
            borderTopColor: 'var(--background-dark)',
            marginLeft: '-5px',
        },
        "bottom": {
            bottom: '100%',
            left: '50%',
            borderBottomColor: 'var(--background-dark)',
            marginLeft: '-5px',
        },
        "left": {
            left: '100%',
            top: '50%',
            borderLeftColor: 'var(--background-dark)',
            marginTop: '-5px',
        },
        "right": {
            right: '100%',
            top: '50%',
            borderRightColor: 'var(--background-dark)',
            marginTop: '-5px',
        },
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    ref={containerRef}
                    className={styles.container}
                    style={tooltipPos}
                    initial={{
                        opacity: 0,
                        scale: 0.5,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.5,
                        transition: {
                            duration: 0.1,
                            ease: 'easeInOut',
                            delay: 0,
                        },
                    }}
                    transition={{
                        duration: 0.1,
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
