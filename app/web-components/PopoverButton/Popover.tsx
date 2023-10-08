"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Popover.module.css";
import Link from "next/link";

type TLinks = string[][];

export default function PopoverButton({ links }: { links: TLinks }) {
    const [showPopover, setShowPopover] = useState<boolean>(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current?.contains(e.target as Node) &&
                !buttonRef.current?.contains(e.target as Node)
            ) {
                setShowPopover(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showPopover) return;

            if (e.key === "Enter" && document.activeElement !== buttonRef.current) {
                setShowPopover(false);
            } else if (e.key === "Escape") {
                setShowPopover(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showPopover]);

    return (
        <div>
            <button
                ref={buttonRef}
                onClick={() => setShowPopover((prev) => !prev)}
            >
                Download {links.length > 2 && " Public Test Build"}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                >
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M22.2398 17.0778L11.8576 27.5689C11.2532 28.1437 10.3287 28.1437 9.75984 27.5689C9.19095 26.994 9.19095 26.0599 9.75984 25.4491L19.1109 16L9.75984 6.5509C9.19095 5.97605 9.19095 5.00599 9.75984 4.43114C10.3287 3.85629 11.2532 3.85629 11.8576 4.43114L22.2398 14.9581C22.8087 15.5329 22.8087 16.4671 22.2398 17.0778Z"
                    />
                </svg>
            </button>

            <div
                ref={popoverRef}
                className={styles.popup + " " + (showPopover ? styles.show : "")}
                aria-label="Download links"
                aria-expanded={showPopover}
                aria-haspopup="true"
                role="menu"
                aria-orientation="vertical"
                aria-hidden={!showPopover}
                tabIndex={-1}
            >
                {links.map((item, index) => (
                    <div key={item[0]}>
                        <Link
                            href={item[1]}
                            aria-label={item[0]}
                            autoFocus={index === 0 ? true : undefined}
                        >
                            <div>{item[0]}</div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
