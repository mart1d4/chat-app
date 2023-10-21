"use client";

import { useEffect, useState, ReactElement, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Tooltip.module.css";
import { useTooltip } from "@/lib/store";

export const Tooltip = (): ReactElement => {
    const [positions, setPositions] = useState<any>({});
    const [currentNode, setCurrentNode] = useState<HTMLElement | null>(null);
    const [arrowPositions, setArrowPositions] = useState<any>({});

    const tooltip = useTooltip((state) => state.tooltip);
    const text = tooltip?.text || null;
    const element = tooltip?.element || null;
    const position = tooltip?.position || "TOP";
    const gap = tooltip?.gap || 0;
    const big = tooltip?.big || false;
    const color = tooltip?.color || "var(--background-dark-1)";
    const delay = (tooltip?.delay || 0) / 1000;
    const arrow = tooltip?.arrow || true;
    const wide = tooltip?.wide || false;

    const tooltipRef = useCallback((node: HTMLElement | null) => {
        if (node) {
            setCurrentNode(node);
        }
    }, []);

    useEffect(() => {
        if (!tooltip || !currentNode) return;

        let pos: any = {};
        let arrowPos: any = {};

        const container = element?.getBoundingClientRect();
        const screenX = window.innerWidth;
        const screenY = window.innerHeight;

        if (!container) return;

        if (position === "TOP") {
            pos = {
                bottom: screenY - container.top + gap + 6,
                left: container.left + container.width / 2,
                transform: "translateX(-50%)",
            };

            arrowPos = {
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderTopColor: color,
            };
        } else if (position === "BOTTOM") {
            pos = {
                top: container.bottom + gap + 5,
                left: container.left + container.width / 2,
                transform: "translateX(-50%)",
            };

            arrowPos = {
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderBottomColor: color,
            };
        } else if (position === "LEFT") {
            pos = {
                top: container.top + container.height / 2,
                right: screenX - container.left + gap + 6,
                transform: "translateY(-50%)",
            };

            arrowPos = {
                top: "50%",
                left: "100%",
                transform: "translateY(-50%)",
                borderLeftColor: color,
            };
        } else if (position === "RIGHT") {
            pos = {
                top: container.top + container.height / 2,
                left: container.right + gap + 5,
                transform: "translateY(-50%)",
            };

            arrowPos = {
                right: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                borderRightColor: color,
            };
        }

        const tooltipWidth = currentNode.offsetWidth;
        const tooltipHeight = currentNode.offsetHeight;
        // Not enough space to the right, set right to 14
        if (screenX - 10 - pos.left < tooltipWidth) {
            pos.left = screenX - tooltipWidth - 14;
            arrowPos.left = tooltipWidth - 14;
        }

        setPositions(pos);
        setArrowPositions(arrowPos);
    }, [currentNode, tooltip, position, gap, color, text, wide]);

    return useMemo(
        () => (
            <AnimatePresence>
                {tooltip && (
                    <div ref={tooltipRef} style={{ ...positions }} className={styles.container}>
                        <motion.div
                            className={big ? styles.tooltip + " " + styles.big : styles.tooltip}
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                transition: {
                                    duration: 0.1,
                                    ease: "backOut",
                                    delay: 0,
                                },
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "backOut",
                                delay: delay,
                            }}
                            style={{
                                maxWidth: wide ? "300px" : "196px",
                                backgroundColor: color,
                            }}
                        >
                            {text}
                            {arrow && <span style={{ ...arrowPositions }} />}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        ),
        [positions, arrowPositions, text]
    );
};
