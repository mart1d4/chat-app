"use client";

import { useRightClick } from "./useRightClick";
import styles from "./Menu.module.css";
import { useClick } from "./useClick";
import { Icon } from "@components";
import {
    FloatingFocusManager,
    useInteractions,
    FloatingPortal,
    type Placement,
    useMergeRefs,
    useFloating,
    safePolygon,
    autoUpdate,
    useDismiss,
    useHover,
    useFocus,
    useRole,
    offset,
    shift,
    flip,
} from "@floating-ui/react";
import {
    type ButtonHTMLAttributes,
    type SetStateAction,
    isValidElement,
    type HTMLProps,
    type ReactNode,
    type Dispatch,
    createContext,
    cloneElement,
    forwardRef,
    useContext,
    useState,
    useMemo,
} from "react";

interface MenuOptions {
    initialOpen?: boolean;
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    openOnClick?: boolean;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openOnRightClick?: boolean;
    positionOnClick?: boolean;
    flipMainAxis?: boolean;
    gap?: number;
}

export function useMenu({
    initialOpen = false,
    placement = "top",
    modal,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    openOnClick = false,
    openOnHover = false,
    openOnFocus = false,
    openOnRightClick = false,
    positionOnClick,
    flipMainAxis = false,
    gap,
}: MenuOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();

    if (!openOnClick && !openOnHover && !openOnFocus && !openOnRightClick) {
        openOnClick = true;
    }

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    if (openOnRightClick || positionOnClick) {
        gap = 0;
    }

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(gap ?? 5),
            flip({
                fallbackAxisSideDirection: "end",
                crossAxis: false,
                mainAxis: flipMainAxis || placement === "right-start",
                padding: 12,
            }),
            shift({ padding: 12, crossAxis: true, mainAxis: true }),
        ],
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null && openOnClick,
        setPositionToCursor: positionOnClick,
        toggle: !positionOnClick,
    });

    const hover = useHover(context, {
        enabled: controlledOpen == null && openOnHover,
        handleClose: safePolygon(),
    });

    const focus = useFocus(context, {
        enabled: controlledOpen == null && openOnFocus,
    });

    const rightClick = useRightClick(context, {
        enabled: controlledOpen == null && openOnRightClick,
    });

    const dismiss = useDismiss(context);
    const role = useRole(context);

    const interactions = useInteractions([click, hover, focus, rightClick, dismiss, role]);

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
    | (ReturnType<typeof useMenu> & {
          setLabelId: Dispatch<SetStateAction<string | undefined>>;
          setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
      })
    | null;

const MenuContext = createContext<ContextType>(null);

export const useMenuContext = () => {
    const context = useContext(MenuContext);

    if (context == null) {
        throw new Error("Menu components must be wrapped in <Menu />");
    }

    return context;
};

export function Menu({
    children,
    modal = false,
    ...restOptions
}: {
    children: ReactNode;
} & MenuOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const menu = useMenu({ modal, ...restOptions });
    return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>;
}

interface MenuTriggerProps {
    children: ReactNode;
    asChild?: boolean;
    externalReference?: HTMLElement | null;
}

export const MenuTrigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & MenuTriggerProps>(
    function MenuTrigger({ children, asChild = true, externalReference, ...props }, propRef) {
        const context = useMenuContext();
        const childrenRef = (children as any).ref;

        const ref = useMergeRefs([
            context.refs.setReference,
            propRef,
            childrenRef,
            ...(externalReference ? [() => context.refs.setReference(externalReference)] : []),
        ]);

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

export const MenuContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    function MenuContent({ style, ...props }, propRef) {
        const { context: floatingContext, ...context } = useMenuContext();
        const ref = useMergeRefs([context.refs.setFloating, propRef]);

        if (!floatingContext.open) return null;

        return (
            <FloatingPortal>
                {/* <FloatingOverlay lockScroll> */}
                <FloatingFocusManager
                    context={floatingContext}
                    modal={context.modal}
                >
                    <div
                        ref={ref}
                        className={styles.menu}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        style={{ ...context.floatingStyles, ...style }}
                        onClick={(e) => e.stopPropagation()}
                        {...context.getFloatingProps(props)}
                    >
                        {props.children}
                    </div>
                </FloatingFocusManager>
                {/* </FloatingOverlay> */}
            </FloatingPortal>
        );
    }
);

export function MenuItem({
    children,
    disabled,
    submenu,
    danger,
    icon,
    leftIcon,
    skipHide,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    submenu?: boolean;
    danger?: boolean;
    icon?: string;
    leftIcon?: string;
    skipHide?: boolean;
}) {
    const { setOpen } = useMenuContext();

    const classnames = [styles.item, danger && styles.danger, disabled && styles.disabled]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            {...props}
            type="button"
            className={classnames}
            tabIndex={disabled ? -1 : 0}
            onClick={(e) => {
                if (!disabled && props.onClick) {
                    props.onClick(e);
                }

                if (!skipHide) {
                    setOpen(false);
                }
            }}
        >
            {leftIcon && (
                <Icon
                    size={24}
                    name={leftIcon}
                />
            )}

            <div>{children}</div>

            {submenu && (
                <Icon
                    size={18}
                    name="caret"
                />
            )}

            {icon && (
                <Icon
                    size={18}
                    name={icon}
                />
            )}
        </button>
    );
}

export function MenuDivider({}) {
    return <div className={styles.divider} />;
}
