"use client";

import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from "../Layers/Menu/Menu";
import { Checkbox } from "./Checkbox/Checkbox";
import styles from "./Input.module.css";
import { useSettings } from "@/store";
import { useId } from "react";
import { Radio } from "./Radio/Radio";
import { Icon } from "../Icon/Icon";
import { Select } from "./Select/Select";

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
    choices,
    radioSide = "left",
    checkboxType = "switch",
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
    choices?: { label: string; value: string; description?: string; icon?: string }[];
    radioSide?: "left" | "right";
    checkboxType?: "checkbox" | "switch";
    onChange?: (value: string | boolean) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const { settings, setSettings } = useSettings();
    const id = useId();

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

    if (props.type === "select") {
        if (!choices) {
            console.error("Choices are required for select input");
            return null;
        }

        return (
            <Select
                label={label}
                error={error}
                options={choices}
                value={props.value}
                onChange={onChange}
                hideLabel={hideLabel}
                {...props}
            />
        );
    }

    if (props.type === "radio") {
        if (!choices) {
            console.error("Choices are required for radio input");
            return null;
        }

        return (
            <fieldset className={styles.fieldset}>
                <legend
                    className={`${styles.label} ${error && styles.error} ${
                        hideLabel && styles.hide
                    }`}
                >
                    {label} {props.required && !error && <span>*</span>}
                    {error && <span className={styles.error}>- {error}</span>}
                </legend>

                {choices.map((choice) => {
                    const classes = [
                        styles.radio,
                        radioSide === "right" && styles.right,
                        choice.value === props.value && styles.checked,
                    ]
                        .filter(Boolean)
                        .join(" ");

                    return (
                        <label
                            key={choice.value}
                            className={classes}
                            htmlFor={`${id}-${choice.value}`}
                            id={`${id}-${choice.value}-label`}
                        >
                            <Radio
                                inputFor={`${id}-${choice.value}`}
                                checked={choice.value === props.value}
                                onChange={() => onChange(choice.value)}
                            />

                            <div className={styles.content}>
                                {choice.icon && <Icon name={choice.icon} />}

                                <div>
                                    <p>{choice.label}</p>
                                    {choice.description && <p>{choice.description}</p>}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </fieldset>
        );
    }

    if (props.type === "checkbox") {
        const isSwitch = checkboxType === "switch";

        const classes = [
            styles.checkbox,
            error && styles.error,
            hideLabel && styles.hide,
            isSwitch && styles.switch,
            props.disabled && styles.disabled,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <label
                htmlFor={id}
                focus-gap={4}
                id={`${id}-label`}
                className={classes}
            >
                <Checkbox
                    inputFor={id}
                    isSwitch={isSwitch}
                    value={!!props.value}
                    disabled={props.disabled}
                    onChange={() => {
                        if (props.disabled) return;
                        onChange(!props.value);
                    }}
                />

                <span>{label}</span>
            </label>
        );
    }

    return (
        <div className={styles.container}>
            <label
                htmlFor={id}
                className={`${styles.label} ${error && styles.error} ${hideLabel && styles.hide}`}
            >
                {label} {props.required && !error && <span>*</span>}
                {error && <span className={styles.error}>- {error}</span>}
            </label>

            <div className={styles.inputWrapper}>
                {leftItem && <div className={leftItemSmall ? styles.small : ""}>{leftItem}</div>}

                <Menu
                    positionOnClick
                    openOnRightClick
                    placement="right-start"
                >
                    <MenuTrigger>
                        <input
                            id={id}
                            name={name}
                            aria-label={label}
                            className={classnames}
                            aria-invalid={!!error}
                            aria-labelledby={name}
                            aria-required={props.required}
                            aria-disabled={props.disabled}
                            spellCheck={settings.spellcheck}
                            aria-placeholder={props.placeholder}
                            onChange={(e) => onChange(e.target.value)}
                            style={{ height: size === "small" ? 32 : 40 }}
                            autoCorrect={settings.spellcheck ? "true" : "false"}
                            aria-describedby={error ? `${name}-error` : undefined}
                            aria-errormessage={error ? `${name}-error` : undefined}
                            {...props}
                        />
                    </MenuTrigger>

                    <MenuContent>
                        <MenuItem
                            checked={settings.spellcheck}
                            onClick={() => {
                                setSettings("spellcheck", !settings.spellcheck);
                            }}
                        >
                            Spellcheck
                        </MenuItem>

                        <MenuDivider />

                        <MenuItem
                            onClick={() => {
                                // Write to input at cursor position
                                const input = document.getElementById(id) as HTMLInputElement;
                                const start = input.selectionStart || 0;
                                const end = input.selectionEnd || 0;
                                const value = input.value;
                                const selection = value.substring(start, end);
                                const newValue =
                                    value.substring(0, start) + selection + value.substring(end);
                                input.value = newValue;
                                input.setSelectionRange(
                                    start + selection.length,
                                    start + selection.length
                                );
                                input.focus();
                                onChange(newValue);
                            }}
                        >
                            <div>Paste</div>
                            <div>Ctrl+V</div>
                        </MenuItem>
                    </MenuContent>
                </Menu>

                {rightItem && <div className={styles.rightItem}>{rightItem}</div>}
            </div>

            {!!description && <p className={styles.description}>{description}</p>}
        </div>
    );
}
