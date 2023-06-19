'use client';

import useContextHook from '@/hooks/useContextHook';
import styles from './Avatar.module.css';
import Image from 'next/image';

type Props = {
    src: string;
    alt: string;
    size: number;
    status?: 'Online' | 'Idle' | 'Do Not Disturb' | 'Invisible' | 'Offline' | undefined;
    statusSize?: number;
    tooltip?: boolean;
};

const colors = {
    Online: '#22A559',
    Idle: '#F0B232',
    'Do Not Disturb': '#F23F43',
    Invisible: '#80848E',
    Offline: '#80848E',
};

const Avatar = (props: Props) => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    if (props.status) {
        return (
            <svg
                width={props.size + 8}
                height={props.size + 8}
                viewBox={`0 0 ${props.size + 8} ${props.size + 8}`}
                aria-hidden='true'
                className={styles.svg}
            >
                <svg className={styles.mask}>
                    <mask
                        id='svg-mask-status-online'
                        maskContentUnits='objectBoundingBox'
                        viewBox='0 0 1 1'
                    >
                        <circle
                            fill='white'
                            cx='0.5'
                            cy='0.5'
                            r='0.5'
                        />

                        <circle
                            fill='black'
                            cx='0.85'
                            cy='0.85'
                            r='0.25'
                        />
                    </mask>
                </svg>

                <foreignObject
                    x={0}
                    y={0}
                    width={props.size}
                    height={props.size}
                    style={{
                        mask: `url(#svg-mask-status-online)`,
                        // WebkitMask: `url(#svg-mask-status-online)`,
                    }}
                >
                    <div className={styles.container}>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/preview/${props.size}x${props.size}/`}
                            alt={props.alt}
                            width={props.size}
                            height={props.size}
                            draggable={false}
                        />
                    </div>
                </foreignObject>

                <rect
                    onMouseEnter={(e) => {
                        if (!props.tooltip) return;
                        setTooltip({
                            text: props.status,
                            element: e.target,
                            position: 'top',
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    x={
                        !props.statusSize
                            ? props.size / 1.4545
                            : props.size / 1.4545 + props.statusSize / 18
                    }
                    y={
                        !props.statusSize
                            ? props.size / 1.4545
                            : props.size / 1.4545 + props.statusSize / 18
                    }
                    width={props.statusSize ? props.statusSize / 3.2 : props.size / 3.2}
                    height={props.statusSize ? props.statusSize / 3.2 : props.size / 3.2}
                    rx={props.size / 6.4}
                    ry={props.size / 6.4}
                    fill={colors[props.status]}
                />
            </svg>
        );
    }

    return (
        <div className={styles.container}>
            <Image
                src={`${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/preview/${props.size}x${props.size}/`}
                alt={props.alt}
                width={props.size}
                height={props.size}
                draggable={false}
            />
        </div>
    );
};

export default Avatar;
