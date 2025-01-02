"use client";

import { Checkbox } from "../Checkbox/Checkbox";
import styles from "./Input.module.css";
import { useEffect, useMemo, useState } from "react";

export function Input({
    label = "",
    name = "",
    error = "",
    description = "",
    leftItem = null,
    rightItem = null,
    onChange = () => {},
    ...props
}: {
    label: string;
    name?: string;
    error?: string;
    description?: string;
    leftItem?: React.ReactNode;
    rightItem?: React.ReactNode;
    onChange?: (value: string) => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const [id, setId] = useState<string>("");

    useEffect(() => {
        const randomId = Math.random().toString(36).substring(7);
        setId(randomId);
    }, []);

    const classnames = [leftItem && styles.leftItem, rightItem && styles.rightItem]
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
                className={`${styles.checkbox} ${error && styles.error}`}
            >
                <Checkbox
                    box
                    inputFor={id}
                    checked={props.checked}
                    onChange={() => onChange(!props.checked ? "true" : "false")}
                />
                {label} {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>
        );
    }

    return (
        <div className={styles.container}>
            <label
                htmlFor={id}
                className={`${styles.label} ${error && styles.error}`}
            >
                {label} {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>

            <div className={styles.inputWrapper}>
                {leftItem && <div>{leftItem}</div>}

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
                    {...props}
                />

                {rightItem && <div>{rightItem}</div>}
            </div>

            {!!description && <p className={styles.description}>{description}</p>}
        </div>
    );
}
