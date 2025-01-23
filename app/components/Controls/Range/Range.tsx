"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Range.module.css";

export function Range({
    onChange,
    min,
    max,
    size,
    initValue,
    ...props
}: {
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    size?: number;
    initValue?: number;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [value, setValue] = useState(initValue ?? 0);

    const slider = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onChange(value);
    }, [value, onChange]);

    const handleDrag = (e: MouseEvent) => {
        if (!slider.current) return;

        const rect = slider.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newValue = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
        setValue(newValue);
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            handleDrag(e);
        };

        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isDragging]);

    return (
        <div
            className={styles.slider}
            style={{ width: `${size}px` }}
        >
            <input
                step={1}
                type="range"
                value={value}
                min={min ?? 0}
                max={max ?? 100}
                className={styles.input}
                onChange={(e) => setValue(Number(e.target.value))}
            />

            <div
                ref={slider}
                className={styles.track}
                onMouseDown={(e) => {
                    setIsDragging(true);
                    handleDrag(e.nativeEvent);
                }}
            >
                <div
                    className={styles.progress}
                    style={{ width: `${value}%` }}
                >
                    <div className={styles.thumb} />
                </div>
            </div>
        </div>
    );
}
