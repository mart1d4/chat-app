import {
    FloatingFocusManager,
    useInteractions,
    FloatingOverlay,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    useDismiss,
    useClick,
    useRole,
    useId,
    useTransitionStyles,
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

import styles from "./Dialog.module.css";
import { LoadingDots } from "../../LoadingDots/LoadingDots";

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
    const context = useDialogContext();
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

export const DialogContent = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
    function DialogContent(props, propRef) {
        const { context: floatingContext, ...context } = useDialogContext();
        const ref = useMergeRefs([context.refs.setFloating, propRef]);

        const { isMounted } = useTransitionStyles(floatingContext, {
            duration: 300,
        });

        if (!isMounted) return null;

        return (
            <FloatingPortal>
                <FloatingOverlay
                    className={styles.overlay}
                    style={{ animationName: !floatingContext.open ? styles.fadeOut : "" }}
                    lockScroll
                >
                    <FloatingFocusManager context={floatingContext}>
                        <div
                            ref={ref}
                            aria-labelledby={context.labelId}
                            aria-describedby={context.descriptionId}
                            {...context.getFloatingProps(props)}
                        >
                            <div
                                style={{
                                    animationName: !floatingContext.open ? styles.popOut : "",
                                }}
                                className={styles.dialog}
                            >
                                <header className={styles.header}>
                                    <DialogHeading>{props.heading}</DialogHeading>

                                    {props.center && (
                                        <DialogClose>
                                            <button className={styles.close}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="24"
                                                    height="24"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                                                    />
                                                </svg>
                                            </button>
                                        </DialogClose>
                                    )}
                                </header>

                                <main className={styles.content}>
                                    <DialogDescription>{props.description}</DialogDescription>
                                    {props.children}
                                </main>

                                <footer className={styles.footer}>
                                    <button
                                        className="button blue"
                                        onClick={() => {}}
                                    >
                                        Oh yeah. Pin it.
                                    </button>

                                    {!props.buttonFull && (
                                        <button
                                            className="button underline"
                                            onClick={() => context.setOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </footer>
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            </FloatingPortal>
        );
    }
);

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
                ...props.children.props,
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
