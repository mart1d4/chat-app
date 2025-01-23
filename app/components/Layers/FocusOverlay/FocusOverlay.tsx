"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

type FocusOverlayProps = {
    active: boolean;
    bounds: DOMRect | null;
    borderRadius: string;
};

const FocusOverlay: React.FC<FocusOverlayProps> = ({ active, bounds, borderRadius }) => {
    if (!active || !bounds) return null;

    // Ensure the overlay stays within the viewport
    const style: React.CSSProperties = {
        position: "fixed", // Use `fixed` to position relative to the viewport
        top: Math.max(bounds.top - 4, 0), // Prevent overflow above the viewport
        left: Math.max(bounds.left - 4, 0), // Prevent overflow on the left
        width: Math.min(bounds.width + 8, window.innerWidth - bounds.left + 4), // Adjust width to fit viewport
        height: Math.min(bounds.height + 8, window.innerHeight - bounds.top + 4), // Adjust height to fit viewport
        border: "4px solid var(--accent-light)",
        borderRadius: borderRadius,
        boxSizing: "border-box",
        zIndex: 9999,
        pointerEvents: "none",
    };

    return createPortal(<div style={style}></div>, document.body);
};

const TabFocusHighlighter: React.FC = () => {
    const [bounds, setBounds] = useState<DOMRect | null>(null);
    const [borderRadius, setBorderRadius] = useState<string>("0px");
    const [active, setActive] = useState(false);
    const lastInputMode = useRef<"keyboard" | "mouse" | null>(null);
    const focusedElementRef = useRef<HTMLElement | null>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                lastInputMode.current = "keyboard";
            }
        };

        const handlePointerDown = () => {
            lastInputMode.current = "mouse";
        };

        const updateOverlay = () => {
            const targetElement = focusedElementRef.current;
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(targetElement);
                const borderRadius = computedStyle.borderRadius;

                if (borderRadius.includes("px")) {
                    const updatedRadius = borderRadius
                        .split(" ")
                        .map((value) => {
                            const numericValue = parseFloat(value);
                            return isNaN(numericValue) ? value : `${numericValue + 4}px`;
                        })
                        .join(" ");
                    setBorderRadius(updatedRadius);
                } else {
                    setBorderRadius(borderRadius);
                }

                setBounds(rect);
            }
        };

        const startMonitoringTransform = () => {
            const monitor = () => {
                updateOverlay();
                animationFrameId.current = requestAnimationFrame(monitor);
            };
            monitor();
        };

        const stopMonitoringTransform = () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };

        const handleFocus = (e: FocusEvent) => {
            if (lastInputMode.current === "keyboard") {
                let targetElement = e.target as HTMLElement | null;

                if (targetElement?.hasAttribute("focus-id")) {
                    const focusId = targetElement.getAttribute("focus-id");
                    if (focusId) {
                        targetElement = document.querySelector(
                            `[id='${focusId}']`
                        ) as HTMLElement | null;
                    }
                }

                if (targetElement) {
                    focusedElementRef.current = targetElement;
                    updateOverlay();
                    startMonitoringTransform();
                    setActive(true);
                }
            }
        };

        const handleBlur = () => {
            setActive(false);
            setBounds(null);
            setBorderRadius("0px");
            focusedElementRef.current = null;
            stopMonitoringTransform();
        };

        const observer = new MutationObserver(() => {
            if (focusedElementRef.current && !document.body.contains(focusedElementRef.current)) {
                handleBlur();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("focusin", handleFocus);
        window.addEventListener("focusout", handleBlur);

        return () => {
            observer.disconnect();
            stopMonitoringTransform();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("focusin", handleFocus);
            window.removeEventListener("focusout", handleBlur);
        };
    }, []);

    return (
        <FocusOverlay
            active={active}
            bounds={bounds}
            borderRadius={borderRadius}
        />
    );
};

export { TabFocusHighlighter };
