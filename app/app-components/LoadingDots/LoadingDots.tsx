import styles from './LoadingDots.module.css';

type Props = {};

const LoadingDots = (props: Props) => {
    return (
        <svg
            width='24.5'
            height='7'
            className={styles.svg}
        >
            <g>
                <circle
                    cx='3.5'
                    cy='3.5'
                    r='3.5'
                    fill='currentColor'
                />

                <circle
                    cx='12.25'
                    cy='3.5'
                    r='3.5'
                    fill='currentColor'
                />

                <circle
                    cx='21'
                    cy='3.5'
                    r='3.5'
                    fill='currentColor'
                />
            </g>
        </svg>
    );
};

export default LoadingDots;
