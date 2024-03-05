"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Footer.module.css";
import { Icon } from "@components";

const languages = [
    { name: "български", flag: "blg" },
    { name: "Čeština", flag: "cze" },
    { name: "Dansk", flag: "den" },
    { name: "Deutsch", flag: "ger" },
    { name: "Ελληνικά", flag: "gre" },
    { name: "English, USA", flag: "usa" },
    { name: "Español", flag: "esp" },
    { name: "Suomi", flag: "fin" },
    { name: "Français", flag: "fra" },
    { name: "हिंदी", flag: "ind" },
    { name: "Hrvatski", flag: "cro" },
    { name: "Magyar", flag: "hun" },
    { name: "Italiano", flag: "ita" },
    { name: "日本語", flag: "jpn" },
    { name: "한국어", flag: "kor" },
    { name: "Lietuviškai", flag: "lit" },
    { name: "Nederlands", flag: "ned" },
    { name: "Norwegian", flag: "nor" },
    { name: "Polski", flag: "pol" },
    { name: "Português do Brasil", flag: "bra" },
    { name: "Română", flag: "rom" },
    { name: "Pyccĸий", flag: "rus" },
    { name: "Svenska", flag: "swe" },
    { name: "ไทย", flag: "tha" },
    { name: "Türkçe", flag: "tur" },
    { name: "Українська", flag: "ukr" },
    { name: "Tiếng Việt", flag: "vie" },
    { name: "中文", flag: "chn" },
    { name: "繁體中文", flag: "twn" },
];

export default function LanguagePicker() {
    const [showPopover, setShowPopover] = useState(false);
    const [lang, setLang] = useState(languages[5]);

    const langButton = useRef<HTMLDivElement>(null);
    const langMenu = useRef<HTMLDivElement>(null);
    const firstLang = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                !(
                    langMenu.current?.contains(e.target as Node) ||
                    langButton.current?.contains(e.target as Node)
                )
            ) {
                setShowPopover(false);
            }
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowPopover(false);
                langButton.current?.focus();
            }
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleKeydown);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handleKeydown);
        };
    }, []);

    useEffect(() => {
        if (showPopover) firstLang.current?.focus();
    }, [showPopover]);

    return (
        <div className={styles.language}>
            <div>
                <div
                    ref={langMenu}
                    role="listbox"
                    aria-hidden={`${!showPopover}`}
                    aria-expanded={`${showPopover}`}
                    aria-label="Language picker"
                    className={styles.langChooser + " " + (showPopover ? styles.show : "")}
                >
                    <div>
                        {languages.map((language, i) => (
                            <div
                                ref={i === 0 ? firstLang : undefined}
                                tabIndex={0}
                                key={language.flag}
                                className={styles.langItem}
                                aria-label={language.name}
                                aria-current={`${language.name === lang?.name}`}
                                aria-selected={`${language.name === lang?.name}`}
                                onClick={() => {
                                    setLang(language);
                                    setShowPopover(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setLang(language);
                                        setShowPopover(false);
                                        langButton.current?.focus();
                                    }
                                }}
                            >
                                <div>
                                    <img
                                        src={`/assets/flags/${language.flag}.png`}
                                        alt={`${language.name} flag`}
                                    />
                                    <div>{language.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    tabIndex={0}
                    ref={langButton}
                    aria-label="Language"
                    aria-haspopup="listbox"
                    aria-expanded={`${showPopover}`}
                    className={styles.langButton}
                    onClick={() => setShowPopover((prev) => !prev)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") setShowPopover((prev) => !prev);
                    }}
                >
                    <div>
                        <img
                            src={`/assets/flags/${lang?.flag}.png`}
                            alt={`${lang?.name} flag`}
                        />
                        <div>{lang?.name}</div>
                    </div>

                    <Icon name="caret" />
                </div>
            </div>
        </div>
    );
}
