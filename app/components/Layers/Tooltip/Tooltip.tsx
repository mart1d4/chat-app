"use client";

import {
    useTransitionStyles,
    useInteractions,
    FloatingPortal,
    FloatingArrow,
    useMergeRefs,
    useFloating,
    autoUpdate,
    useDismiss,
    useHover,
    useFocus,
    useRole,
    offset,
    shift,
    arrow,
    flip,
    type Placement,
} from "@floating-ui/react";
import {
    type HTMLProps,
    isValidElement,
    createContext,
    cloneElement,
    useContext,
    forwardRef,
    useState,
    useMemo,
    useRef,
} from "react";

import styles from "./Tooltip.module.css";

interface TooltipOptions {
    initialOpen?: boolean;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delay?: number;
    gap?: number;
    avatar?: boolean;
    big?: boolean;
    wide?: boolean;
    showOn?: boolean;
    background?: string;
    color?: string;
}

export function useTooltip({
    initialOpen = false,
    placement = "top",
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    delay = 0,
    gap = 0,
    avatar = false,
    big = false,
    wide = false,
    showOn,
    background,
    color,
}: TooltipOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

    const open = (controlledOpen ?? uncontrolledOpen) && (showOn ?? true);
    // const open = true;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;
    const arrowRef = useRef<HTMLDivElement | null>(null);

    const ARROW_HEIGHT = 5;
    const GAP = 4;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(ARROW_HEIGHT + (gap || GAP)),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "start",
                padding: 10,
            }),
            shift({ padding: 10 }),
            arrow({ element: arrowRef }),
        ],
    });

    const context = data.context;

    const hover = useHover(context, {
        move: false,
        enabled: controlledOpen == null,
        delay: {
            open: delay,
        },
    });

    const focus = useFocus(context, {
        enabled: controlledOpen == null,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "tooltip" });

    const interactions = useInteractions([hover, focus, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            arrowRef,
            avatar,
            big,
            wide,
            background,
            color,
        }),
        [open, setOpen, interactions, data, arrowRef, avatar, big, wide, background, color]
    );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = createContext<ContextType>(null);

export const useTooltipContext = () => {
    const context = useContext(TooltipContext);

    if (context == null) {
        throw new Error("Tooltip components must be wrapped in <Tooltip />");
    }

    return context;
};

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const tooltip = useTooltip(options);
    return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = forwardRef<
    HTMLElement,
    HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = true, ...props }, propRef) {
    const context = useTooltipContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...children.props,
                "data-state": context.open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            ref={ref}
            data-state={context.open ? "open" : "closed"}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const TooltipContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    function TooltipContent({ style, ...props }, propRef) {
        const context = useTooltipContext();
        const ref = useMergeRefs([context.refs.setFloating, propRef]);

        const { isMounted, styles: tStyles } = useTransitionStyles(context, {
            duration: 50,
            initial: {
                transform: "scale(0.95)",
                opacity: 0,
            },
            close: {
                transform: "scale(0.98)",
                opacity: 0,
            },
        });

        if (!isMounted) return null;

        return (
            <FloatingPortal>
                <div
                    ref={ref}
                    style={{
                        ...context.floatingStyles,
                        ...style,
                        zIndex: 1000,
                        pointerEvents: "none",
                    }}
                    {...context.getFloatingProps(props)}
                >
                    <div style={{ ...tStyles }}>
                        <FloatingArrow
                            ref={context.arrowRef}
                            context={context}
                            width={10}
                            height={5}
                            fill={context.background || "var(--background-dark-1)"}
                        />

                        <div
                            className={`${styles.tooltip} ${context.avatar ? styles.avatar : ""} ${
                                context.big ? styles.big : ""
                            }`}
                            style={{ backgroundColor: context.background || "" }}
                        >
                            {props.children}
                        </div>
                    </div>
                </div>
            </FloatingPortal>
        );
    }
);
