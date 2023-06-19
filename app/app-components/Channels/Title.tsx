'use client';

import { ReactElement, useState, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Icon } from '@/app/app-components';
import styles from './Channels.module.css';

const Title = (): ReactElement => {
    const showButton = useRef<HTMLDivElement>(null);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                ref={showButton}
                onMouseEnter={(e) =>
                    setTooltip({
                        text: 'Create DM',
                        element: e.currentTarget,
                    })
                }
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) => {
                    if (fixedLayer?.type === 'popout' && !fixedLayer?.channel) {
                        setFixedLayer(null);
                    } else {
                        setFixedLayer({
                            type: 'popout',
                            event: e,
                            gap: 5,
                            element: showButton?.current,
                            firstSide: 'bottom',
                            secondSide: 'right',
                        });
                    }
                }}
            >
                <Icon
                    name='add'
                    size={16}
                    viewbox='0 0 18 18'
                />
            </div>
        </h2>
    );
};

export default Title;
