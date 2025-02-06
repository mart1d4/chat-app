"use client";

import { LoadingDots } from "@components";
import styles from "./Dialog.module.css";
import {
    FloatingFocusManager,
    useTransitionStyles,
    useInteractions,
    FloatingOverlay,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    useDismiss,
    useClick,
    useRole,
    useId,
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
} from "react";

const headingIcons = {
    stamp: {
        icon: "stamp.svg",
        width: 180,
        top: -68,
        left: 140,
    },
    userStatus: {
        icon: "user-status.svg",
        width: 200,
        top: -68,
        left: 120,
    },
};

interface DialogContentProps {
    hideFooter?: boolean;
    showClose?: boolean;
    noHeadingGap?: boolean;
    width?: number;
    heading?: string;
    headingIcon?: keyof typeof headingIcons;
    boldHeading?: boolean;
    description?: string;
    centered?: boolean;
    contentCentered?: boolean;
    hideClose?: boolean;
    hideCancel?: boolean;
    buttonFull?: boolean;
    confirmLabel?: string;
    confirmColor?: string;
    confirmLoading?: boolean;
    confirmDisabled?: boolean;
    closeOnConfirm?: boolean;
    art?: string;
    artFullUrl?: boolean;
    blank?: boolean;
    noContentOverflow?: boolean;
    leftLabel?: string;
    leftConfirm?: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
}

interface DialogOptions {
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function useDialog({
    initialOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: DialogOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context, { outsidePressEvent: "click" });
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId]
    );
}

type ContextType =
    | (ReturnType<typeof useDialog> & {
          setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
          setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
      })
    | null;

const DialogContext = createContext<ContextType>(null);

export const useDialogContext = () => {
    const context = useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
};

export function Dialog({
    children,
    ...options
}: {
    children: React.ReactNode;
} & DialogOptions) {
    const dialog = useDialog(options);
    return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export const DialogTrigger = forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & DialogTriggerProps
>(function DialogTrigger({ children, asChild = true, ...props }, propRef) {
    const { getReferenceProps, refs, open } = useDialogContext();
    const childrenRef = (children as any).ref;

    const ref = useMergeRefs([refs.setReference, propRef, childrenRef]);

    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            getReferenceProps({
                ref,
                ...props,
                ...(children.props as any),
                "data-state": open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            ref={ref}
            {...getReferenceProps(props)}
            data-state={open ? "open" : "closed"}
        >
            {children}
        </button>
    );
});

export const DialogContent = forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement> & DialogContentProps
>(function DialogContent(props: React.HTMLProps<HTMLDivElement> & DialogContentProps, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    const { isMounted } = useTransitionStyles(floatingContext, {
        duration: 300,
    });

    if (!isMounted) return null;

    if (props.blank) {
        return (
            <FloatingPortal>
                <FloatingOverlay
                    lockScroll
                    className={styles.overlay}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    style={{ animationName: !floatingContext.open ? styles.fadeOut : "" }}
                >
                    <FloatingFocusManager context={floatingContext}>
                        <div
                            ref={ref}
                            aria-labelledby={context.labelId}
                            aria-describedby={context.descriptionId}
                            {...context.getFloatingProps(
                                // @ts-ignore - props but need to remove all the props that are not valid on a div
                                ({
                                    noContentOverflow,
                                    hideFooter,
                                    showClose,
                                    noHeadingGap,
                                    width,
                                    blank,
                                    onConfirm,
                                    art,
                                    artFullUrl,
                                    boldHeading,
                                    heading,
                                    headingIcon,
                                    description,
                                    centered,
                                    contentCentered,
                                    hideClose,
                                    hideCancel,
                                    buttonFull,
                                    confirmLabel,
                                    confirmColor,
                                    confirmLoading,
                                    confirmDisabled,
                                    closeOnConfirm,
                                    onCancel,
                                    ...props
                                }: any) => props
                            )}
                        >
                            {props.children}
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            </FloatingPortal>
        );
    }

    return (
        <FloatingPortal>
            <FloatingOverlay
                lockScroll
                className={styles.overlay}
                onClick={(e) => e.stopPropagation()}
                style={{ animationName: !floatingContext.open ? styles.fadeOut : "" }}
            >
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        {...context.getFloatingProps(
                            // @ts-ignore - props but need to remove all the props that are not valid on a div
                            ({
                                noContentOverflow,
                                hideFooter,
                                showClose,
                                noHeadingGap,
                                width,
                                blank,
                                onConfirm,
                                art,
                                artFullUrl,
                                boldHeading,
                                heading,
                                headingIcon,
                                description,
                                centered,
                                contentCentered,
                                hideClose,
                                hideCancel,
                                buttonFull,
                                confirmLabel,
                                confirmColor,
                                confirmLoading,
                                confirmDisabled,
                                closeOnConfirm,
                                onCancel,
                                ...props
                            }: any) => props
                        )}
                    >
                        <div
                            style={{
                                width: props.width || "",
                                minHeight: props.hideFooter ? "unset" : "",
                                animationName: !floatingContext.open ? styles.popOut : "",
                            }}
                            className={styles.dialog}
                        >
                            {props.headingIcon && (
                                <div
                                    className={styles.icon}
                                    style={{
                                        top: `${headingIcons[props.headingIcon].top}px`,
                                        left: `${headingIcons[props.headingIcon].left}px`,
                                    }}
                                >
                                    <img
                                        draggable
                                        alt={props.headingIcon}
                                        src={`/assets/system/${
                                            headingIcons[props.headingIcon].icon
                                        }`}
                                        style={{
                                            width: `${headingIcons[props.headingIcon].width}px`,
                                        }}
                                    />
                                </div>
                            )}

                            <header
                                className={`${styles.header} ${
                                    props.centered ? styles.centered : ""
                                } ${props.headingIcon ? styles.withIcon : ""} ${
                                    props.boldHeading ? styles.boldHeading : ""
                                } ${props.noHeadingGap ? styles.noGap : ""}`}
                            >
                                {props.art && (
                                    <img
                                        alt={props.art}
                                        draggable={false}
                                        className={styles.art}
                                        src={
                                            props.artFullUrl
                                                ? props.art
                                                : `/assets/system/${props.art}`
                                        }
                                    />
                                )}

                                <DialogHeading>{props.heading}</DialogHeading>

                                {props.description && (
                                    <DialogDescription>{props.description}</DialogDescription>
                                )}

                                {((props.centered && !props.hideClose) || props.showClose) && (
                                    <button
                                        className={styles.close}
                                        onClick={() => {
                                            context.setOpen(false);
                                            if (props.onCancel) {
                                                props.onCancel();
                                            }
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            height="22"
                                            width="22"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </header>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (props.onConfirm) {
                                        props.onConfirm();
                                    }

                                    if (props.closeOnConfirm) {
                                        context.setOpen(false);
                                    }
                                }}
                            >
                                <main
                                    className={`${styles.content} ${
                                        props.contentCentered ? styles.centered : ""
                                    }`}
                                    style={{
                                        overflow: props.noContentOverflow ? "visible" : "",
                                    }}
                                >
                                    {props.children}
                                </main>

                                {!props.hideFooter && (
                                    <footer className={styles.footer}>
                                        {props.leftLabel ? (
                                            <button
                                                type="button"
                                                className="button underline"
                                                onClick={() => {
                                                    if (props.leftConfirm) {
                                                        props.leftConfirm();
                                                    }
                                                }}
                                            >
                                                {props.leftLabel}
                                            </button>
                                        ) : (
                                            <div />
                                        )}

                                        <div>
                                            <button
                                                type="submit"
                                                className={`button submit ${
                                                    props.confirmColor || "blue"
                                                } ${props.confirmDisabled ? "disabled" : ""}`}
                                            >
                                                {props.confirmLoading ? (
                                                    <LoadingDots />
                                                ) : (
                                                    props.confirmLabel || "Confirm"
                                                )}
                                            </button>

                                            {!props.buttonFull && !props.hideCancel && (
                                                <button
                                                    type="button"
                                                    className="button underline submit"
                                                    onClick={() => {
                                                        context.setOpen(false);
                                                        if (props.onCancel) {
                                                            props.onCancel();
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </footer>
                                )}
                            </form>
                        </div>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

export const DialogHeading = forwardRef<HTMLHeadingElement, React.HTMLProps<HTMLHeadingElement>>(
    function DialogHeading({ children, ...props }, ref) {
        const { setLabelId } = useDialogContext();
        const id = useId();

        // Only sets `aria-labelledby` on the Dialog root element
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
                {children}
            </h2>
        );
    }
);

export const DialogDescription = forwardRef<
    HTMLParagraphElement,
    React.HTMLProps<HTMLParagraphElement>
>(function DialogDescription({ children, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = useId();

    // Only sets `aria-describedby` on the Dialog root element
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
        >
            {children}
        </p>
    );
});

export const DialogProtip = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.protip}>
            <p>Protip:</p>
            <p>{children}</p>
        </div>
    );
};

export const DialogClose = forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const context = useDialogContext();
    const setOpen = context.setOpen;

    if (isValidElement(props.children)) {
        return cloneElement(
            props.children,
            context.getReferenceProps({
                ref,
                ...props,
                ...(props.children.props as any),
                "data-state": context.open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            type="button"
            {...props}
            ref={ref}
            onClick={() => setOpen(false)}
        />
    );
});
