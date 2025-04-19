"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "../Input.module.css";
import { Icon } from "@components";
import {
    FloatingFocusManager,
    useListNavigation,
    useInteractions,
    FloatingPortal,
    useTypeahead,
    useFloating,
    useDismiss,
    autoUpdate,
    useClick,
    useRole,
    flip,
    size,
} from "@floating-ui/react";

export function Select({
    value,
    onChange,
    options,
    label,
    error,
    hideLabel,
    ...props
}: {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string; description?: string; icon?: string }[];
    label: string;
    error?: string;
    hideLabel?: boolean;
    [key: string]: any;
}) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(
        options.findIndex((option) => option.value === value)
    );

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setSelectedIndex(options.findIndex((option) => option.value === value));
    }, [value, options]);

    const { refs, floatingStyles, context } = useFloating<HTMLElement>({
        placement: "bottom-start",
        open: isOpen,
        onOpenChange: props.disabled ? () => {} : setIsOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            flip({ padding: 10 }),
            size({
                apply({ rects, elements, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        maxHeight: `${availableHeight > 310 ? 310 : availableHeight}px`,
                        minWidth: `${rects.reference.width}px`,
                    });
                },
                padding: 10,
            }),
        ],
    });

    const listRef = useRef<Array<HTMLElement | null>>([]);
    const listContentRef = useRef(options.map((o) => o.value));
    const isTypingRef = useRef(false);

    const click = useClick(context, { event: "mousedown" });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "listbox" });

    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
        // This is a large list, allow looping.
        loop: true,
    });

    const typeahead = useTypeahead(context, {
        listRef: listContentRef,
        activeIndex,
        selectedIndex,
        onMatch: isOpen ? setActiveIndex : setSelectedIndex,
        onTypingChange(isTyping) {
            isTypingRef.current = isTyping;
        },
    });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        dismiss,
        role,
        listNav,
        typeahead,
        click,
    ]);

    const handleSelect = (index: number) => {
        if (props.disabled) return;

        setSelectedIndex(index);
        setIsOpen(false);

        const selectedValue = options[index].value;
        onChange(selectedValue);
    };

    const id = useId();

    const selectedItem = typeof selectedIndex === "number" ? options[selectedIndex] : undefined;

    return (
        <div className={styles.container}>
            <label
                id={id}
                onClick={() => refs.domReference.current?.focus()}
                className={`${styles.label} ${error && styles.error} ${hideLabel && styles.hide}`}
            >
                {label} {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>

            <div
                style={{ borderRadius: isOpen ? "3px 3px 0 0" : undefined }}
                className={`${styles.inputWrapper} ${props.disabled ? styles.disabled : ""}`}
            >
                {selectedItem?.icon && (
                    <div
                        className={styles.leftItem}
                        style={{ color: "var(--fg-5)" }}
                    >
                        <Icon
                            size={18}
                            name={selectedItem.icon}
                        />
                    </div>
                )}

                <div
                    aria-labelledby={id}
                    ref={refs.setReference}
                    aria-autocomplete="none"
                    className={styles.input}
                    {...getReferenceProps()}
                    tabIndex={props.disabled ? -1 : 0}
                    style={{ paddingLeft: selectedItem?.icon ? "36px" : undefined }}
                >
                    {selectedItem?.label || props?.placeholder || "Select an option"}
                </div>

                <div
                    className={styles.rightItem}
                    style={{
                        pointerEvents: "none",
                        transform: isOpen ? "rotate(-90deg)" : "rotate(90deg)",
                    }}
                >
                    <Icon
                        size={18}
                        name="caret"
                    />
                </div>
            </div>

            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager
                        modal={false}
                        context={context}
                    >
                        <div
                            ref={refs.setFloating}
                            className={`${styles.selectList} scrollbar`}
                            style={{ ...floatingStyles, zIndex: 100000 }}
                            {...getFloatingProps()}
                        >
                            {options.map((v, i) => (
                                <div
                                    key={v.value}
                                    role="option"
                                    ref={(node) => {
                                        listRef.current[i] = node;
                                    }}
                                    tabIndex={i === activeIndex ? 0 : -1}
                                    className={selectedIndex === i ? styles.selected : ""}
                                    aria-selected={i === selectedIndex && i === activeIndex}
                                    {...getItemProps({
                                        // Handle pointer select.
                                        onClick() {
                                            handleSelect(i);
                                        },
                                        // Handle keyboard select.
                                        onKeyDown(event) {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                handleSelect(i);
                                            }

                                            if (event.key === " " && !isTypingRef.current) {
                                                event.preventDefault();
                                                handleSelect(i);
                                            }
                                        },
                                    })}
                                >
                                    <div>
                                        {v.icon && (
                                            <Icon
                                                size={16}
                                                name={v.icon}
                                            />
                                        )}

                                        <p>{v.label}</p>
                                        {v.description && <p>{v.description}</p>}
                                    </div>

                                    {i === selectedIndex && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            aria-hidden
                                            fill="none"
                                            height="20"
                                            width="20"
                                        >
                                            <circle
                                                fill="white"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                            />

                                            <path
                                                d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z"
                                                fill="currentColor"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    );
}
