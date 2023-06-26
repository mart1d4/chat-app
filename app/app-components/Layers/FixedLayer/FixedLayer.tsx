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
    const [contentContainer, setContentContainer] = useState<null | ConType>(null);
    const [currentNode, setCurrentNode] = useState<null | Node>(null);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });

    const type = fixedLayer?.type;

    const firstSide = fixedLayer?.firstSide;
    const secondSide = fixedLayer?.secondSide;
    const gap = fixedLayer?.gap || 10;

    const layerRef = useCallback(
        (node: any) => {
            if (!fixedLayer || !(node !== null)) {
                setPositions(null);
                setContentContainer(null);
                setCurrentNode(null);
                return;
            }

            setCurrentNode(node);
        },
        [fixedLayer, resetPosition]
    );

    useEffect(() => {
        if (!contentContainer) return;

        const mouseX = fixedLayer?.event?.mouseX;
        const mouseY = fixedLayer?.event?.mouseY;
        const element = fixedLayer?.element;

        let pos: PosType = {} as PosType;
        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        if (mouseX && mouseY) {
            // If there's not enough space to the right, open to the left
            if (screenX - 12 - mouseX < contentContainer.width) {
                pos = {
                    top: mouseY,
                    left: mouseX - contentContainer.width,
                };
            } else {
                pos = {
                    top: mouseY,
                    left: mouseX,
                };
            }

            // If there's not enough space at the bottom, move the menu up
            if (screenY - 12 - mouseY < contentContainer.height) {
                pos = {
                    ...pos,
                    top: 'unset',
                    bottom: 12,
                };
            }
        } else {
            // If a firstSide is specified, open the menu to that firstSide of the element
            const container = element?.getBoundingClientRect();
            console.log(container);

            if (firstSide === 'left') {
                pos = {
                    top: container.top,
                    left: container.left - contentContainer.width - gap,
                };

                if (secondSide === 'top') {
                    pos = {
                        ...pos,
                        top: container.bottom - contentContainer.height,
                    };
                }
            } else if (firstSide === 'right') {
                pos = {
                    top: container.top,
                    left: container.right + gap,
                };

                if (secondSide === 'top') {
                    pos = {
                        ...pos,
                        top: container.bottom - contentContainer.height,
                    };
                }
            } else if (firstSide === 'top') {
                pos = {
                    top: container.top - contentContainer.height - gap,
                    left: container.left,
                };

                if (secondSide === 'left') {
                    pos = {
                        ...pos,
                        left: container.right - contentContainer.width,
                    };
                }
            } else if (firstSide === 'bottom') {
                pos = {
                    top: container.bottom + gap,
                    left: container.left,
                };

                if (secondSide === 'left') {
                    pos = {
                        ...pos,
                        left: container.right - contentContainer.width,
                    };
                }
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - (pos.top as number) < contentContainer.height) {
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
            if (window.innerWidth - 10 - (pos.left as number) < contentContainer.width) {
                pos = {
                    ...pos,
                    left: container.right - contentContainer.width,
                };
            } else {
                pos = {
                    ...pos,
                    right: 'unset',
                };
            }
        }

        setPositions(pos);
    }, [contentContainer]);

    useEffect(() => {
        if (!fixedLayer || !currentNode) return;

        setContentContainer({
            width: (currentNode.firstChild as HTMLElement)?.offsetWidth,
            height: (currentNode.firstChild as HTMLElement)?.offsetHeight,
        });

        const handleClick = (e: MouseEvent) => {
            if (!currentNode?.contains(e.target as Node)) setFixedLayer(null);
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
    }, [currentNode]);

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                zIndex: 1000,
                position: 'fixed',
                width: contentContainer?.width || 'auto',
                height: contentContainer?.height || 'auto',
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
