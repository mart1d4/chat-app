import { motion } from 'framer-motion';
import styles from './Alert.module.css';

const Alert = ({ message, type }) => {
    return (
        <motion.div
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
                duration: 0.25,
                ease: 'easeInOut',
            }}
            style={{
                color: type === 'error'
                    ? 'var(--error-primary)'
                    : type === 'success'
                        ? 'var(--valid-primary)'
                        : type === 'warning'
                            ? 'var(--warning-primary)'
                            : 'var(--accent-primary)',
            }}
            className={styles.alert}
        >
            <p>{message}</p>
        </motion.div>
    );
}

export default Alert;
