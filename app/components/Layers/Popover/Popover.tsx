"use client";

import styles from "./Popover.module.css";
import {
    FloatingFocusManager,
    useInteractions,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    autoUpdate,
    useDismiss,
    useClick,
    offset,
    useRole,
    shift,
    useId,
    flip,
    type Placement,
    FloatingOverlay,
} from "@floating-ui/react";
import {
    useLayoutEffect,
    isValidElement,
    createContext,
    cloneElement,
    forwardRef,
    useContext,
    useState,
    useMemo,
    type ButtonHTMLAttributes,
    type SetStateAction,
    type HTMLProps,
    type ReactNode,
    type Dispatch,
    useEffect,
} from "react";

interface PopoverOptions {
    initialOpen?: boolean;
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mainOffset?: number;
    crossOffset?: number;
}

export function usePopover({
    initialOpen = false,
    placement = "bottom",
    modal,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    mainOffset = 8,
    crossOffset,
}: PopoverOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset({
                mainAxis: mainOffset,
                crossAxis: crossOffset,
            }),
            flip({
                crossAxis: false,
                fallbackAxisSideDirection: "end",
                padding: 12,
            }),
            shift({ padding: 12 }),
        ],
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            modal,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, modal, labelId, descriptionId]
    );
}

type ContextType =
    | (ReturnType<typeof usePopover> & {
          setLabelId: Dispatch<SetStateAction<string | undefined>>;
          setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
      })
    | null;

const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
    const context = useContext(PopoverContext);

    if (context == null) {
        throw new Error("Popover components must be wrapped in <Popover />");
    }

    return context;
};

export function Popover({
    children,
    modal = false,
    ...restOptions
}: {
    children: ReactNode;
} & PopoverOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const popover = usePopover({ modal, ...restOptions });
    return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
}

interface PopoverTriggerProps {
    children: ReactNode;
    asChild?: boolean;
    externalReference?: HTMLElement | null;
}

export const PopoverTrigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & PopoverTriggerProps>(
    function PopoverTrigger({ children, asChild = true, externalReference, ...props }, propRef) {
        const context = usePopoverContext();
        const childrenRef = (children as any).ref;

        const ref = useMergeRefs([
            context.refs.setReference,
            propRef,
            childrenRef,
            ...(externalReference ? [() => context.refs.setReference(externalReference)] : []),
        ]);

        useEffect(() => {
            if (!externalReference) return;
            externalReference.dataset.expanded = context.open ? "true" : "false";
        }, [context.open]);

        // `asChild` allows the user to pass any element as the anchor
        if (asChild && isValidElement(children)) {
            return cloneElement(
                children,
                context.getReferenceProps({
                    ref,
                    ...props,
                    // @ts-ignore - `data-state` is a custom prop
                    ...children.props,
                    "data-state": context.open ? "open" : "closed",
                })
            );
        }

        return (
            <button
                ref={ref}
                type="button"
                // The user can style the trigger based on the state
                data-state={context.open ? "open" : "closed"}
                {...context.getReferenceProps(props)}
            >
                {children}
            </button>
        );
    }
);

export const PopoverContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    function PopoverContent({ style, ...props }, propRef) {
        const { context: floatingContext, ...context } = usePopoverContext();
        const ref = useMergeRefs([context.refs.setFloating, propRef]);

        if (!floatingContext.open) return null;

        return (
            <FloatingPortal>
                <FloatingOverlay
                    lockScroll
                    style={{ zIndex: 1000 }}
                >
                    <FloatingFocusManager context={floatingContext}>
                        <div
                            ref={ref}
                            className={styles.popover}
                            style={{ ...context.floatingStyles, ...style }}
                            aria-labelledby={context.labelId}
                            aria-describedby={context.descriptionId}
                            {...context.getFloatingProps(props)}
                        >
                            {props.children}
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            </FloatingPortal>
        );
    }
);

export const PopoverHeading = forwardRef<HTMLHeadingElement, HTMLProps<HTMLHeadingElement>>(
    function PopoverHeading(props, ref) {
        const { setLabelId } = usePopoverContext();
        const id = useId();

        // Only sets `aria-labelledby` on the Popover root element
        // if this component is mounted inside it.
        useLayoutEffect(() => {
            setLabelId(id);
            return () => setLabelId(undefined);
        }, [id, setLabelId]);

        return (
            <h2
                {...props}
                ref={ref}
                id={id}
            >
                {props.children}
            </h2>
        );
    }
);

export const PopoverDescription = forwardRef<HTMLParagraphElement, HTMLProps<HTMLParagraphElement>>(
    function PopoverDescription(props, ref) {
        const { setDescriptionId } = usePopoverContext();
        const id = useId();

        // Only sets `aria-describedby` on the Popover root element
        // if this component is mounted inside it.
        useLayoutEffect(() => {
            setDescriptionId(id);
            return () => setDescriptionId(undefined);
        }, [id, setDescriptionId]);

        return (
            <p
                {...props}
                ref={ref}
                id={id}
            />
        );
    }
);

export const PopoverClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    function PopoverClose(props, ref) {
        const { setOpen } = usePopoverContext();
        return (
            <button
                type="button"
                ref={ref}
                {...props}
                onClick={(event) => {
                    props.onClick?.(event);
                    setOpen(false);
                }}
            />
        );
    }
);
