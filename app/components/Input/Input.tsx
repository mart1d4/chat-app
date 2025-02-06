"use client";

import { Checkbox } from "./Checkbox/Checkbox";
import { useEffect, useState } from "react";
import styles from "./Input.module.css";

export function Input({
    label,
    name,
    error,
    size,
    description,
    leftItem,
    leftItemSmall,
    rightItem,
    hideLabel,
    noBox,
    onChange = () => {},
    ...props
}: {
    label: string;
    name?: string;
    error?: string;
    size?: "small" | "large";
    description?: string;
    leftItem?: React.ReactNode;
    leftItemSmall?: boolean;
    rightItem?: React.ReactNode;
    hideLabel?: boolean;
    noBox?: boolean;
    onChange?: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const [id, setId] = useState<string>("");

    useEffect(() => {
        const randomId = Math.random().toString(36).substring(7);
        setId(randomId);
    }, []);

    const classnames = [
        leftItem && styles.leftItem,
        rightItem && styles.rightItem,
        leftItemSmall && styles.leftItemSmall,
    ]
        .filter(Boolean)
        .join(" ");

    if (!id) {
        return (
            <div className={styles.container}>
                <span className={`${styles.label} ${styles.load}`} />

                <div className={styles.inputWrapper}>
                    <input className={classnames} />
                </div>
            </div>
        );
    }

    if (props.checked !== undefined) {
        return (
            <label
                htmlFor={id}
                id={`${id}-label`}
                className={`${styles.checkbox} ${error && styles.error} ${noBox && styles.noBox}`}
                style={{
                    opacity: hideLabel ? 0 : 1,
                    width: hideLabel ? 0 : "auto",
                    height: hideLabel ? 0 : "auto",
                }}
            >
                <Checkbox
                    box={!noBox}
                    inputFor={id}
                    checked={props.checked}
                    onChange={() => onChange(!props.checked ? "true" : "false")}
                />
                <span>{label}</span> {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>
        );
    }

    return (
        <div className={styles.container}>
            <label
                htmlFor={id}
                className={`${styles.label} ${error && styles.error}`}
                style={{
                    opacity: hideLabel ? 0 : 1,
                    width: hideLabel ? 0 : "auto",
                    height: hideLabel ? 0 : "auto",
                    marginBottom: hideLabel ? 0 : undefined,
                }}
            >
                {label} {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>

            <div className={styles.inputWrapper}>
                {leftItem && <div className={leftItemSmall ? styles.small : ""}>{leftItem}</div>}

                <input
                    id={id}
                    name={name}
                    aria-label={label}
                    className={classnames}
                    aria-invalid={!!error}
                    aria-labelledby={name}
                    aria-required={props.required}
                    aria-disabled={props.disabled}
                    aria-placeholder={props.placeholder}
                    aria-describedby={error ? `${name}-error` : undefined}
                    aria-errormessage={error ? `${name}-error` : undefined}
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
                    style={{
                        height: size === "small" ? 32 : 40,
                    }}
                    {...props}
                />

                {rightItem && <div>{rightItem}</div>}
            </div>

            {!!description && <p className={styles.description}>{description}</p>}
        </div>
    );
}
