import styles from './Checkbox.module.css';

type Props = {
    checked: boolean;
    onChange?: () => void;
};

const Checkbox = ({ checked, onChange }: Props) => {
    return (
        <div
            className={styles.container}
            style={{ backgroundColor: checked ? 'var(--success-light)' : 'var(--default-2)' }}
        >
            <svg
                viewBox='0 0 28 20'
                preserveAspectRatio='xMinYMid meet'
                aria-hidden='true'
                style={{ left: checked ? '12px' : '-3px' }}
            >
                <rect
                    fill='white'
                    x='4'
                    y='0'
                    height='20'
                    width='20'
                    rx='10'
                />
                {checked ? (
                    <svg
                        viewBox='0 0 20 20'
                        fill='none'
                    >
                        <path
                            fill='rgba(35, 165, 90, 1)'
                            d='M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z'
                        />
                        <path
                            fill='rgba(35, 165, 90, 1)'
                            d='M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z'
                        />
                    </svg>
                ) : (
                    <svg
                        viewBox='0 0 20 20'
                        fill='none'
                    >
                        <path
                            fill='rgba(128, 132, 142, 1)'
                            d='M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z'
                        />
                        <path
                            fill='rgba(128, 132, 142, 1)'
                            d='M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z'
                        />
                    </svg>
                )}
            </svg>

            <input
                type='checkbox'
                onChange={onChange ? onChange : () => {}}
            />
        </div>
    );
};

export default Checkbox;
