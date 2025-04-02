import { useEffect, useState } from "react";

export function useKeyPressed(key: string): boolean {
    const [pressed, setPressed] = useState(false);

    const downHandler = ({ key: pressedKey }: KeyboardEvent) => {
        if (pressedKey === key) {
            setPressed(true);
        }
    };

    const upHandler = ({ key: pressedKey }: KeyboardEvent) => {
        if (pressedKey === key) {
            setPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    return pressed;
}
