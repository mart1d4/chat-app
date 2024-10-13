"use client";

import { useMemo } from "react";
import styles from "./Input.module.css";
import { useLayers } from "@/store";

export function Input({
    type = "text",
    label = "",
    placeholder = "",
    value = "",
    required = false,
    minLength = 0,
    maxLength = 100,
    disabled = false,
    error = "",
    name = "",
    leftItem = null,
    rightItem = null,
    onChange = () => {},
}: {
    type?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    disabled?: boolean;
    error?: string;
    name?: string;
    leftItem?: React.ReactNode;
    rightItem?: React.ReactNode;
    onChange?: (value: string) => void;
}) {
    const id = useMemo(() => Math.random().toString(36).substring(2), []);

    const classnames = [leftItem && styles.leftItem, rightItem && styles.rightItem]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.container}>
            {label && (
                <label
                    htmlFor={id}
                    className={`${styles.label} ${error && styles.error}`}
                >
                    {label} {required && !error && <span>*</span>}
                    {error && <span className={styles.error}>- {error}</span>}
                </label>
            )}

            <div className={styles.inputWrapper}>
                {leftItem && <div>{leftItem}</div>}

                <input
                    id={id}
                    type={type}
                    name={name}
                    value={value}
                    aria-label={label}
                    required={required}
                    disabled={disabled}
                    minLength={minLength}
                    maxLength={maxLength}
                    className={classnames}
                    aria-invalid={!!error}
                    aria-labelledby={name}
                    aria-required={required}
                    aria-disabled={disabled}
                    aria-placeholder={placeholder}
                    aria-describedby={error ? `${name}-error` : undefined}
                    aria-errormessage={error ? `${name}-error` : undefined}
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck="false"
                    autoCapitalize="off"
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // setLayers({
                        //     settings: {
                        //         type: "MENU",
                        //         event: e,
                        //     },
                        //     content: {
                        //         type: "INPUT",
                        //         input: true,
                        //         pasteText: (text: string) => onChange(text),
                        //     },
                        // });
                    }}
                />

                {rightItem && <div>{rightItem}</div>}
            </div>
        </div>
    );
}
