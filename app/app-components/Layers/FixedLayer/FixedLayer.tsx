'use client';

import { useEffect, useState, useCallback, ReactElement } from 'react';
import { Menu, Popout, UserCard } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';

type PosType = {
    top: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
};

type ConType = {
    width: number;
    height: number;
};

const FixedLayer = (): ReactElement => {
    const [resetPosition, setResetPosition] = useState<boolean>(false);
    const [positions, setPositions] = useState<null | PosType>(null);
    const [container, setContainer] = useState<null | ConType>(null);
    const [node, setNode] = useState<null | Node>(null);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });

    const type = fixedLayer?.type;
    const event = fixedLayer?.event;
    const element = fixedLayer?.element;

    const firstSide = fixedLayer?.firstSide;
    const secondSide = fixedLayer?.secondSide;
    const gap = fixedLayer?.gap || 10;

    const layerRef = useCallback(
        (node: any) => {
            if (!fixedLayer || !(node !== null)) {
                setPositions(null);
                setContainer(null);
                setNode(null);
                return;
            }

            setNode(node);
            setContainer({
                width: node.children[0]?.offsetWidth,
                height: node.children[0]?.offsetHeight,
            });
        },
        [fixedLayer, resetPosition]
    );

    useEffect(() => {
        if (!container) return;

        let pos: PosType = {} as PosType;

        if (!firstSide && !element) {
            // If there's not enough space to the right, open to the left
            if (window.innerWidth - 10 - event.clientX < container.width) {
                pos = {
                    top: event.clientY,
                    left: event.clientX - container.width,
                };
            } else {
                pos = {
                    top: event.clientY,
                    left: event.clientX,
                };
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - event.clientY < container.height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: 'unset',
                };
            }
        } else {
            // If a firstSide is specified, open the menu to that firstSide of the element
            const elementRect = element?.getBoundingClientRect();

            if (firstSide === 'left') {
                pos = {
                    top: elementRect.top,
                    left: elementRect.left - container.width - gap,
                };

                if (secondSide === 'top') {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (firstSide === 'right') {
                pos = {
                    top: elementRect.top,
                    left: elementRect.right + gap,
                };

                if (secondSide === 'top') {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (firstSide === 'top') {
                pos = {
                    top: elementRect.top - container.height - gap,
                    left: elementRect.left,
                };

                if (secondSide === 'left') {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                }
            } else if (firstSide === 'bottom') {
                pos = {
                    top: elementRect.bottom + gap,
                    left: elementRect.left,
                };

                if (secondSide === 'left') {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                }
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - (pos.top as number) < container.height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: 'unset',
                };
            } else {
                pos = {
                    ...pos,
                    bottom: 'unset',
                };
            }

            // If there's not enough space to the right, move the menu to the left
            if (window.innerWidth - 10 - (pos.left as number) < container.width) {
                pos = {
                    ...pos,
                    left: elementRect.right - container.width,
                };
            } else {
                pos = {
                    ...pos,
                    right: 'unset',
                };
            }
        }

        setPositions(pos);
    }, [container]);

    useEffect(() => {
        if (!fixedLayer || !node) return;

        const handleClick = (e: MouseEvent) => {
            if (!node?.contains(e.target as Node)) setFixedLayer(null);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setFixedLayer(null);
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [node]);

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                zIndex: 1000,
                position: 'fixed',
                width: container?.width || 'auto',
                height: container?.height || 'auto',
                visibility: positions ? 'visible' : 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            {type === 'menu' && <Menu content={fixedLayer} />}

            {type === 'popout' && <Popout content={fixedLayer} />}

            {type === 'usercard' && (
                <UserCard
                    side={firstSide}
                    content={fixedLayer}
                    resetPosition={setResetPosition}
                />
            )}
        </div>
    );
};

export default FixedLayer;
