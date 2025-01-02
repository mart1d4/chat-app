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

    const style: React.CSSProperties = {
        position: "absolute",
        top: bounds.top - 4,
        left: bounds.left - 4,
        width: bounds.width + 8,
        height: bounds.height + 8,
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
    const tabPressed = useRef(false);
    const focusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                tabPressed.current = true;
            }
        };

        const handleFocus = (e: FocusEvent) => {
            if (tabPressed.current) {
                let targetElement = e.target as HTMLElement | null;

                // Check for `focus-id` attribute
                if (targetElement?.hasAttribute("focus-id")) {
                    const focusId = targetElement.getAttribute("focus-id");
                    if (focusId) {
                        targetElement = document.querySelector(
                            `[id='${focusId}']`
                        ) as HTMLElement | null;
                    }
                }

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
                    setActive(true);
                    focusedElementRef.current = targetElement;
                }

                tabPressed.current = false; // Reset the tab-pressed flag
            }
        };

        const handleBlur = () => {
            setActive(false);
            setBounds(null);
            setBorderRadius("0px");
            focusedElementRef.current = null;
        };

        const observer = new MutationObserver(() => {
            if (focusedElementRef.current && !document.body.contains(focusedElementRef.current)) {
                handleBlur();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("focusin", handleFocus);
        window.addEventListener("focusout", handleBlur);

        return () => {
            observer.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
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
