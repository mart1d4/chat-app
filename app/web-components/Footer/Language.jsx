'use client';

import styles from './Footer.module.css';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const languages = [
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
    // Use typescript to define the state
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [lang, setLang] = useState({
        name: 'English, USA',
        flag: 'usa',
    });

    const langButton = useRef(null);
    const langMenu = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (
                langMenu?.current?.contains(e.target) ||
                langButton?.current?.contains(e.target)
            ) {
                return;
            }

            setShowLangMenu(false);
        };

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className={styles.language}>
            <div>
                {showLangMenu && (
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
                                        setShowLangMenu(false);
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
                    onClick={() => setShowLangMenu((prev) => !prev)}
                    ref={langButton}
                >
                    <div>
                        <img src={`/assets/flags/${lang?.flag}.png`} />
                        <div>{lang?.name}</div>
                    </div>

                    <img
                        src='/assets/home-arrow.svg'
                        alt='Open Locale Picker'
                    />
                </div>
            </div>
        </div>
    );
};

export default Language;
