import { motion } from 'framer-motion';
import styles from './Alerts.module.css';

const Alerts = ({ message, type }) => {
    return (
        <motion.div
            className={styles.alert}
            initial={{
                opacity: 0,
                transform: 'translateX(-50%) scale(0.5)',
            }}
            animate={{
                opacity: 1,
                transform: 'translateX(-50%) scale(1)',
            }}
            exit={{
                opacity: 0,
                transform: 'translateX(-50%) scale(0.5)',
            }}
            transition={{
                duration: 0.2,
                ease: 'easeInOut',
            }}
            style={{
                backgroundColor: type === 'error' ? 'var(--error-1)'
                    : type === 'success' ? 'var(--valid-1)'
                        : type === 'warning' ? 'var(--warning-1)'
                            : 'var(--accent-1)',
            }}
        >
            {message}
        </motion.div>
    );
}

export default Alerts;
