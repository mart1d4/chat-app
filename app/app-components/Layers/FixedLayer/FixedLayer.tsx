// @ts-nocheck

'use client';

import { useEffect, useState, useCallback, ReactElement } from 'react';
import { Menu, Popout, UserCard } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';

const FixedLayer = (): ReactElement => {
    const [positions, setPositions] = useState({});
    const [container, setContainer] = useState({});
    const [resetPosition, setResetPosition] = useState(false);
    const [node, setNode] = useState(null);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const type = fixedLayer?.type;
    const event = fixedLayer?.event;
    const element = fixedLayer?.element;
    const firstSide = fixedLayer?.firstSide;
    const secondSide = fixedLayer?.secondSide;
    const gap = fixedLayer?.gap || 10;

    const layerRef = useCallback(
        (node: any) => {
            if (!fixedLayer) return;

            if (node !== null) {
                setNode(node);
                setTimeout(() => {
                    setContainer({
                        width: node.children[0]?.offsetWidth,
                        height: node.children[0]?.offsetHeight,
                    });
                }, 10);
            }
        },
        [fixedLayer, resetPosition]
    );

    useEffect(() => {
        if (!container || !fixedLayer) return;

        let pos = {};

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
            if (window.innerHeight - 10 - pos.top < container.height) {
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
            if (window.innerWidth - 10 - pos.left < container.width) {
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
    }, [container, fixedLayer]);

    useEffect(() => {
        if (!fixedLayer) return;

        const handleClick = (e) => {
            if (!node?.contains(e.target)) {
                setPositions({});
                setContainer(null);
                setFixedLayer(null);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setFixedLayer(null);
            }
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [fixedLayer, node]);

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                position: 'fixed',
                height: container?.height || 'auto',
                width: container?.width || 'auto',
                zIndex: 10000,
                opacity: container && positions.top ? 1 : 0,
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            {type === 'menu' && <Menu content={fixedLayer} />}

            {type === 'popout' && <Popout content={fixedLayer} />}

            {type === 'usercard' && (
                <UserCard
                    content={fixedLayer}
                    side={firstSide}
                    resetPosition={setResetPosition}
                />
            )}
        </div>
    );
};

export default FixedLayer;
