import { Tooltip } from '../';
import { useState } from 'react';
import styles from './AvatarStatus.module.css';

const AvatarStatus = ({ status, background, tooltip, tooltipPos, friend, onlyStatus }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const isFriend = friend ?? true;
    const tooltipPosition = tooltipPos ?? 'top';

    return (
        <div className={!onlyStatus ? styles.container : ""}>
            <Tooltip
                show={tooltip && showTooltip}
                pos={tooltipPosition}
            >
                {status}
            </Tooltip>

            <div
                className={styles.firstLayer}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ backgroundColor: background }}
            >
                <div
                    style={{
                        backgroundColor: isFriend ?
                            (
                                status === 'Online' ? "var(--valid-1)"
                                    : status === 'Away' ? "var(--warning-1)"
                                        : status === 'Busy' ? "var(--error-1)"
                                            : "var(--offline)"
                            ) : "var(--offline)",
                    }}
                >
                    {status !== 'Online' && (
                        <div
                            className={
                                isFriend ? (
                                    status === 'Away' ? styles.away
                                        : status === 'Busy' ? styles.busy
                                            : styles.offline
                                ) : styles.offline
                            }
                            style={{ backgroundColor: background }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AvatarStatus;
