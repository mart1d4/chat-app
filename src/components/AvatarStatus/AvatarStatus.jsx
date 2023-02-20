import { Tooltip } from '../';
import { useState } from 'react';
import styles from './AvatarStatus.module.css';

const AvatarStatus = ({
    status,
    background,
    tooltip,
    tooltipPos,
    tooltipDist,
    friend,
    onlyStatus,
    size,
    mid,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const isFriend = friend ?? true;
    const tooltipPosition = tooltipPos ?? 'top';

    return (
        <div
            className={!onlyStatus
                ? size ? styles.containerBig : mid ? styles.containerMid : styles.container : ""}
        >
            <Tooltip
                show={tooltip && showTooltip}
                pos={tooltipPosition}
                dist={tooltipDist ?? 0}
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
                                status === 'Online' ? "var(--success-light)"
                                    : status === 'Idle' ? "var(--warning-1)"
                                        : status === 'Do Not Disturb' ? "var(--error-1)"
                                            : "var(--default-light)"
                            ) : "var(--default-light)",
                    }}
                >
                    {status !== 'Online' && (
                        <div
                            className={
                                isFriend ? (
                                    status === 'Idle' ? styles.away
                                        : status === 'Do Not Disturb' ? styles.busy
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
