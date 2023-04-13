import { Menu, Popout, UserCard } from "../";
import { useEffect, useState, useCallback } from "react";
import useComponents from "../../hooks/useComponents";
import { AnimatePresence } from "framer-motion";

const FixedLayer = () => {
    const [positions, setPositions] = useState({});
    const [container, setContainer] = useState(null);

    const { fixedLayer, setFixedLayer } = useComponents();
    const type = fixedLayer?.type;
    const event = fixedLayer?.event;
    const firstSide = fixedLayer?.firstSide;
    const secondSide = fixedLayer?.secondSide;
    const element = fixedLayer?.element;
    const gap = fixedLayer?.gap || 10;

    const layerRef = useCallback(node => {
        if (!fixedLayer) return;

        if (node !== null) {
            setTimeout(() => {
                setContainer({
                    width: node.children[0]?.offsetWidth,
                    height: node.children[0]?.offsetHeight,
                });
            }, 10);
        }
    }, [fixedLayer]);

    useEffect(() => {
        if (!container || !fixedLayer) return;

        let pos = {}

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
                    top: "unset",
                };
            }
        } else {
            // If a firstSide is specified, open the menu to that firstSide of the element
            const elementRect = element.getBoundingClientRect();

            if (firstSide === "left") {
                pos = {
                    top: elementRect.top,
                    left: elementRect.left - container.width - gap,
                };

                if (secondSide === "top") {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (firstSide === "right") {
                pos = {
                    top: elementRect.top,
                    left: elementRect.right + gap,
                };

                if (secondSide === "top") {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (firstSide === "top") {
                pos = {
                    top: elementRect.top - container.height - gap,
                    left: elementRect.left,
                };

                if (secondSide === "left") {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                }
            } else if (firstSide === "bottom") {
                pos = {
                    top: elementRect.bottom + gap,
                    left: elementRect.left,
                };

                if (secondSide === "left") {
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
                    top: "unset",
                };
            } else {
                pos = {
                    ...pos,
                    bottom: "unset",
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
                    right: "unset",
                };
            }
        }

        setPositions(pos);
    }, [container, fixedLayer]);

    useEffect(() => {
        if (!container || !fixedLayer) {
            setPositions({});
            setContainer(null);
            return;
        };

        const handleClickOutside = () => {
            setFixedLayer(null);
            setContainer(null);
            setPositions({});
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setFixedLayer(null);
                setContainer(null);
                setPositions({});
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [container, fixedLayer]);

    return (
        <div
            ref={layerRef}
            style={{
                ...positions,
                position: "fixed",
                height: container?.height || "auto",
                width: container?.width || "auto",
                zIndex: 10000,
                opacity: (container && positions.top) ? 1 : 0,
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
            <AnimatePresence>
                {type === "menu" && <Menu content={fixedLayer} />}
                {type === "popout" && <Popout content={fixedLayer} />}
                {type === "usercard" && <UserCard content={fixedLayer} />}
            </AnimatePresence>
        </div>
    );
}

export default FixedLayer;
