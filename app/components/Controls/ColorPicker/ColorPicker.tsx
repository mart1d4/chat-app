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
    onColorChange?: (color: string) => void;
    initColor?: string;
}) {
    const [selectedColor, setSelectedColor] = useState(initColor ?? suggestedColors[0]);
    const [hue, setHue] = useState(convert.hex.hsl(initColor ?? selectedColor)[0]);
    const [inputValue, setInputValue] = useState(initColor ?? suggestedColors[0]);
    const [isPickingPixel, setIsPickingPixel] = useState(false);

    const handlePixelPick = (color: string) => {
        setSelectedColor(color);
        setIsPickingPixel(false);
    };

    useEffect(() => {
        setInputValue(selectedColor);

        if (!onColorChange) return;
        onColorChange(selectedColor);
    }, [selectedColor]);

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <GradientBox
                    color={convert.hex.rgb(selectedColor)}
                    onColorSelect={([r, g, b]) => {
                        setSelectedColor(`#${convert.rgb.hex([r, g, b])}`);
                    }}
                />

                <div className={styles.slider}>
                    <Range
                        min={0}
                        max={360}
                        size="sm"
                        val={hue}
                        initValue={hue}
                        homogeneousBg="hsl"
                        onChange={(hue) => {
                            const [, s, l] = convert.hex.hsl(selectedColor);
                            setSelectedColor(`#${convert.hsl.hex([hue, s, l])}`);
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
                        setInputValue(hex);
                    }}
                    onChange={(v) => {
                        setInputValue(v);
                        if (v.length === 7) {
                            setSelectedColor(v);
                            setHue(convert.hex.hsl(v)[0]);
                        }
                    }}
                />
            </div>

            <div>
                {suggestedColors.map((color) => (
                    <InteractiveElement
                        key={color}
                        element="div"
                        className={styles.swatch}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                            setSelectedColor(color);
                            setHue(convert.hex.hsl(color)[0]);
                        }}
                    />
                ))}
            </div>

            {isPickingPixel && (
                <PixelPicker
                    onColorPick={handlePixelPick}
                    onCancel={() => setIsPickingPixel(false)}
                />
            )}
        </div>
    );
}
