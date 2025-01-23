"use client";

import {
    type ElementType,
    type ReactNode,
    createElement,
    forwardRef,
    useEffect,
    useRef,
} from "react";

type InteractiveElementProps<T extends ElementType> = {
    element?: T;
    onClick?: (e: MouseEvent | KeyboardEvent) => void;
    children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export const InteractiveElement = forwardRef<HTMLElement, InteractiveElementProps<ElementType>>(
    // @ts-ignore - TS doesn't like the ref type here, but it's correct
    function InteractiveElement<T extends ElementType = "div">(
        { element = "div" as T, onClick, children, ...props }: InteractiveElementProps<T>,
        _: React.Ref<HTMLElement>
    ) {
        const internalRef = useRef<HTMLElement | null>(null);

        useEffect(() => {
            const el = internalRef.current;

            if (el && onClick) {
                const handleKeyDown = (e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick?.(e);
                    }
                };

                el.addEventListener("keydown", handleKeyDown);

                return () => {
                    el.removeEventListener("keydown", handleKeyDown);
                };
            }
        }, [onClick]);

        return createElement(
            element,
            {
                ref: internalRef,
                role: "button",
                tabIndex: 0,
                onClick,
                ...props,
            },
            children
        );
    }
);
