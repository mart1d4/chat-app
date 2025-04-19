"use client";

import styles from "./ColorPicker.module.css";
import { GradientBox } from "./GradientBox";
import { PixelPicker } from "./PixelPicker";
import { useEffect, useState } from "react";
import convert from "color-convert";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    Tooltip,
    Input,
    Range,
    Icon,
} from "@components";

const suggestedColors = ["#BF616A", "#D08770", "#EBCB8B", "#A3BE8C", "#B48EAD"];

export function ColorPicker({
    onColorChange,
    initColor,
}: {
    onColorChange?: (color: string | null) => void;
    initColor?: string | null;
}) {
    // Color is the color that's sent to the onColorChange function
    const [oldColor, setOldColor] = useState<string | null>(initColor ?? null);
    const [color, setColor] = useState<string | null>(initColor ?? null);
    const [isPickingPixel, setIsPickingPixel] = useState(false);

    const [inputValue, setInputValue] = useState(initColor ?? "#000000");

    // From that color value we can then get the hue, saturation and lightness values
    const [hue, setHue] = useState<number>(0);
    const [saturation, setSaturation] = useState<number>(0);
    const [lightness, setLightness] = useState<number>(0);

    if (color !== oldColor) {
        setOldColor(color);

        if (onColorChange) {
            onColorChange(color);
        }

        if (typeof color !== "string") {
            setHue(0);
            setSaturation(0);
            setLightness(0);
            setInputValue("#000000");
        } else {
            const [h, s, l] = convert.hex.hsl(color);
            setHue(h);
            setSaturation(s);
            setLightness(l);
            setInputValue(color);
        }
    }

    const handlePixelPick = (color: string) => {
        setColor(color);
        setIsPickingPixel(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <GradientBox
                    color={color ? convert.hex.rgb(color) : null}
                    onColorSelect={([r, g, b]) => {
                        setColor(`#${convert.rgb.hex([r, g, b])}`);
                    }}
                />

                <div className={styles.slider}>
                    <Range
                        min={0}
                        max={360}
                        size="sm"
                        val={hue}
                        homogeneousBg="hsl"
                        onChange={(hue) => {
                            const newColor = `#${convert.hsl.hex([hue, saturation, lightness])}`;

                            if (color !== newColor) {
                                setColor(newColor);
                            }
                        }}
                    />
                </div>
            </div>

            <div>
                {false && (
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.picker}
                                onClick={() => setIsPickingPixel(true)}
                            >
                                <Icon
                                    size={16}
                                    name="color-picker"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Pick a color from the page</TooltipContent>
                    </Tooltip>
                )}

                <Input
                    hideLabel
                    label="Color"
                    maxLength={7}
                    minLength={1}
                    value={inputValue}
                    onKeyDown={(e) => {
                        // if backspace or delete and the char to be deleted is a hash, prevent default
                        if (
                            (e.key === "Backspace" || e.key === "Delete") &&
                            inputValue.length === 1
                        ) {
                            e.preventDefault();
                        }

                        // if ctrl/cmd + v, allow paste
                        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                            return;
                        }

                        // if tab or shift tab, allow
                        if (e.key === "Tab" || e.key === "Shift") {
                            return;
                        }

                        // Only allow hex characters and backspace
                        if (
                            !/^[0-9A-Fa-f]$/.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete" &&
                            e.key !== "ArrowLeft" &&
                            e.key !== "ArrowRight"
                        ) {
                            e.preventDefault();
                        }
                    }}
                    onPaste={(e) => {
                        // Remove all characters that are not hex
                        const clipboardData = e.clipboardData.getData("text/plain");

                        const hex =
                            clipboardData
                                .match(/[0-9A-Fa-f]/g)
                                ?.join("")
                                ?.slice(0, 6) ?? "";

                        if (hex.length === 6) {
                            setColor(`#${hex}`);
                        }
                    }}
                    onChange={(v) => {
                        setInputValue(v as string);

                        if (typeof v === "string") {
                            if (v.length > 0 && v[0] !== "#") {
                                setInputValue(`#${v.length > 6 ? v.slice(1, 7) : v}`);
                            }

                            if (v.length === 7 && /^[0-9A-Fa-f]{6}$/.test(v.slice(1))) {
                                setColor(v);
                            }
                        }
                    }}
                />
            </div>

            <ul>
                {suggestedColors.map((c) => (
                    <InteractiveElement
                        key={c}
                        element="li"
                        className={styles.swatch}
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </ul>

            {isPickingPixel && (
                <PixelPicker
                    onColorPick={handlePixelPick}
                    onCancel={() => setIsPickingPixel(false)}
                />
            )}
        </div>
    );
}
