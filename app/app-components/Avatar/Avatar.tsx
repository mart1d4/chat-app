'use client';

import useContextHook from '@/hooks/useContextHook';
import styles from './Avatar.module.css';
import { useEffect } from 'react';
import Image from 'next/image';

type Props = {
    src: string;
    alt: string;
    size: 24 | 32 | 40 | 80 | 120;
    status?: 'Online' | 'Idle' | 'Do Not Disturb' | 'Invisible' | 'Offline' | undefined;
    tooltip?: boolean;
    tooltipGap?: number;
    relativeSrc?: boolean;
};

const colors = {
    Online: '#22A559',
    Idle: '#F0B232',
    'Do Not Disturb': '#F23F43',
    Invisible: '#80848E',
    Offline: '#80848E',
};

const rectSizes = {
    24: 8,
    32: 10,
    40: 12,
    80: 16,
    120: 24,
};

const rectPlacements = {
    24: 16.5,
    32: 22,
    40: 28,
    80: 60,
    120: 90,
};

const maskSizes = {
    24: 0.275,
    32: 0.25,
    40: 0.5,
    80: 0.175,
    120: 0.16,
};

const Avatar = (props: Props) => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    const rectSize = rectSizes[props.size];
    const rectPlacement = rectPlacements[props.size];
    const maskSize = maskSizes[props.size];

    useEffect(() => {
        return () => setTooltip(null);
    }, []);

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
                            r={maskSize}
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
                            src={
                                props.relativeSrc
                                    ? props.src
                                    : `${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/preview/${props.size}x${props.size}/-/format/webp/`
                            }
                            alt={props.alt}
                            width={props.size}
                            height={props.size}
                            draggable={false}
                            placeholder={props.size > 40 ? 'blur' : undefined}
                            blurDataURL={'/assets/blurs/avatar.png'}
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
                            gap: props.tooltipGap || 0,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    x={rectPlacement}
                    y={rectPlacement}
                    width={rectSize}
                    height={rectSize}
                    rx={rectSize / 2}
                    ry={rectSize / 2}
                    fill={colors[props.status]}
                />
            </svg>
        );
    }

    return (
        <div className={styles.container}>
            <Image
                src={
                    props.relativeSrc
                        ? props.src
                        : `${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/preview/${props.size}x${props.size}/-/format/webp/`
                }
                alt={props.alt}
                width={props.size}
                height={props.size}
                draggable={false}
                placeholder={props.size > 40 ? 'blur' : undefined}
                blurDataURL={'/assets/blurs/avatar.png'}
            />
        </div>
    );
};

export default Avatar;
