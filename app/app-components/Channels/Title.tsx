'use client';

import { ReactElement, useState, useRef } from 'react';
import { Icon, Tooltip } from '@/app/app-components';
import styles from './Channels.module.css';

const Title = (): ReactElement => {
    const [hover, setHover] = useState<boolean>(false);
    const showButton = useRef<HTMLDivElement>(null);

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                ref={showButton}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                // onClick={(e) => {
                //     if (fixedLayer?.type === 'popout' && !fixedLayer?.channel) {
                //         setFixedLayer(null);
                //     } else {
                //         setFixedLayer({
                //             type: 'popout',
                //             event: e,
                //             gap: 5,
                //             element: showButton.current,
                //             firstSide: 'bottom',
                //             secondSide: 'right',
                //         });
                //     }
                // }}
            >
                <Icon
                    name='add'
                    size={16}
                    viewbox='0 0 18 18'
                />

                <Tooltip
                    // show={hover && fixedLayer?.element !== showButton?.current}
                    show={hover}
                >
                    Create DM
                </Tooltip>
            </div>
        </h2>
    );
};

export default Title;
