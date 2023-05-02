'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Footer.module.css';
import { v4 as uuidv4 } from 'uuid';

type Language = {
    name: string;
    flag: string;
};

const languages: Language[] = [
    { name: 'български', flag: 'blg' },
    { name: 'Čeština', flag: 'cze' },
    { name: 'Dansk', flag: 'den' },
    { name: 'Deutsch', flag: 'ger' },
    { name: 'Ελληνικά', flag: 'gre' },
    { name: 'English, USA', flag: 'usa' },
    { name: 'Español', flag: 'esp' },
    { name: 'Suomi', flag: 'fin' },
    { name: 'Français', flag: 'fra' },
    { name: 'हिंदी', flag: 'ind' },
    { name: 'Hrvatski', flag: 'cro' },
    { name: 'Magyar', flag: 'hun' },
    { name: 'Italiano', flag: 'ita' },
    { name: '日本語', flag: 'jpn' },
    { name: '한국어', flag: 'kor' },
    { name: 'Lietuviškai', flag: 'lit' },
    { name: 'Nederlands', flag: 'ned' },
    { name: 'Norwegian', flag: 'nor' },
    { name: 'Polski', flag: 'pol' },
    { name: 'Português do Brasil', flag: 'bra' },
    { name: 'Română', flag: 'rom' },
    { name: 'Pyccĸий', flag: 'rus' },
    { name: 'Svenska', flag: 'swe' },
    { name: 'ไทย', flag: 'tha' },
    { name: 'Türkçe', flag: 'tur' },
    { name: 'Українська', flag: 'ukr' },
    { name: 'Tiếng Việt', flag: 'vie' },
    { name: '中文', flag: 'chn' },
    { name: '繁體中文', flag: 'twn' },
];

const Language = () => {
    const [showPopover, setShowPopover] = useState<boolean>(false);
    const [lang, setLang] = useState<Language>(languages[5]);

    const langButton = useRef<HTMLDivElement>(null);
    const langMenu = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                langMenu.current?.contains(e.target as Node) ||
                langButton.current?.contains(e.target as Node)
            ) {
                return;
            }

            setShowPopover(false);
        };

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className={styles.language}>
            <div>
                {showPopover && (
                    <div
                        className={styles.langChooser}
                        ref={langMenu}
                    >
                        <div>
                            {languages.map((language) => (
                                <div
                                    key={uuidv4()}
                                    className={styles.langItem}
                                    onClick={() => {
                                        setLang(language);
                                        setShowPopover(false);
                                    }}
                                >
                                    <div>
                                        <img
                                            src={`/assets/flags/${language.flag}.png`}
                                        />
                                        <div>{language.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    onClick={() => setShowPopover((prev) => !prev)}
                    ref={langButton}
                >
                    <div>
                        <img src={`/assets/flags/${lang?.flag}.png`} />
                        <div>{lang?.name}</div>
                    </div>

                    <img
                        src='/assets/homepages/arrow.svg'
                        alt='Open Locale Picker'
                    />
                </div>
            </div>
        </div>
    );
};

export default Language;