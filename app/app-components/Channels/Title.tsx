'use client';

import useContextHook from '@/hooks/useContextHook';
import { Icon } from '@/app/app-components';
import styles from './Channels.module.css';
import { ReactElement } from 'react';

const Title = (): ReactElement => {
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    return (
        <h2 className={styles.title}>
            <span>Direct Messages</span>
            <div
                onMouseEnter={(e) => {
                    if (fixedLayer?.type === 'popout' && !fixedLayer?.channel) {
                        return;
                    }
                    setTooltip({
                        text: 'Create DM',
                        element: e.currentTarget,
                    });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) => {
                    if (fixedLayer?.type === 'popout' && !fixedLayer?.channel) {
                        setFixedLayer(null);
                        setTooltip({
                            text: 'Create DM',
                            element: e.currentTarget,
                        });
                    } else {
                        setTooltip(null);
                        setFixedLayer({
                            type: 'popout',
                            element: e.currentTarget,
                            gap: 5,
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
