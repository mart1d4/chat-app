"use client";

import { Icon, Popover, PopoverContent, PopoverTrigger } from "@components";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useEmojiPicker, useMostUsedEmojis } from "@/store";
import styles from "./EmojiPicker.module.css";
import { emojiList } from "@/lib/emoji-list";
import Image from "next/image";

const categories: {
    name: keyof typeof emojiList;
    icon: string;
}[] = [
    {
        name: "People",
        icon: "emoji-people",
    },
    {
        name: "Nature",
        icon: "emoji-nature",
    },
    {
        name: "Food",
        icon: "emoji-food",
    },
    {
        name: "Activities",
        icon: "emoji-activities",
    },
    {
        name: "Travel",
        icon: "emoji-travel",
    },
    {
        name: "Objects",
        icon: "emoji-objects",
    },
    {
        name: "Symbols",
        icon: "emoji-symbols",
    },
    {
        name: "Flags",
        icon: "emoji-flags",
    },
];

const emojiStyles = ["-1f3fb", "-1f3fc", "-1f3fd", "-1f3fe", "-1f3ff"];

type Emoji = {
    hex: string;
    names: string[];
    hasStyles: boolean;
};

export function EmojiPicker({}) {
    const {
        data,
        data: { open, container, placement },
        setData,
    } = useEmojiPicker();

    const content = useMemo(() => <EmojiPickerContent />, []);

    if (!container) {
        return <div style={{ opacity: 0 }}></div>;
    }

    return (
        <Popover
            open={open}
            placement={placement}
            onOpenChange={(open) => setData({ ...data, open })}
        >
            {container && (
                <PopoverTrigger externalReference={container}>
                    <span style={{ opacity: 0 }}></span>
                </PopoverTrigger>
            )}

            <PopoverContent>{content}</PopoverContent>
        </Popover>
    );
}

function EmojiPickerContent({}) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string[]>(["Frequently Used"]);
    const [stylePickerVisible, setStylePickerVisible] = useState(false);
    const [current, setCurrent] = useState<Emoji | null>(null);
    const [search, setSearch] = useState("");
    const [style, setStyle] = useState("");

    const { emojis: mostUsedDirty } = useMostUsedEmojis();
    const listRef = useRef<HTMLDivElement>(null);

    const mostUsed = useMemo(() => {
        return mostUsedDirty.map((hex) => {
            const emoji = Object.values(emojiList)
                .flat()
                .find((e) => e.hex === hex);

            return emoji || { hex, names: [hex], hasStyles: false };
        });
    }, [mostUsedDirty]);

    useEffect(() => {
        const container = document.querySelector(`.${styles.list}`);
        if (!container) return;

        const handleScroll = () => {
            const titles = container.querySelectorAll(`.${styles.title}`);
            let visibleCategories: string[] = [];

            titles.forEach((title) => {
                const rect = title.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Check if the title is visible in the container
                if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
                    visibleCategories.push(title.id.split("-")[1]);
                }
            });

            const mostHigh = [{ name: "frequently" }, ...categories].find((c) =>
                visibleCategories.includes(c.name)
            );

            setActiveCategory(mostHigh?.name || null);
        };

        handleScroll();

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const filteredEmojis = useMemo(() => {
        const allEmojis = Object.values(emojiList).flat();

        return search
            ? allEmojis.filter((emoji) =>
                  emoji.names.some((name) => name.includes(search.toLowerCase()))
              )
            : null;
    }, [search]);

    return (
        <div className={styles.container}>
            <header>
                <div className={styles.input}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={current ? current.names.join(" ") : ""}
                    />

                    <div>
                        <Icon
                            size={20}
                            name="search"
                        />
                    </div>
                </div>

                <div
                    className={styles.stylePicker}
                    data-expanded={stylePickerVisible}
                >
                    <button
                        aria-haspopup="true"
                        className={styles.style}
                        aria-label="Change style"
                        aria-expanded={stylePickerVisible}
                        onClick={() => setStylePickerVisible(!stylePickerVisible)}
                    >
                        <img
                            alt="Clap"
                            src={`/assets/emojis/1F44F${style}.svg`}
                        />
                    </button>

                    <div
                        hidden={!stylePickerVisible}
                        aria-label="Emoji style picker"
                        aria-hidden={!stylePickerVisible}
                        className={styles.stylePickerDropdown}
                    >
                        {["", ...emojiStyles]
                            .filter((emojiStyle) => emojiStyle !== style)
                            .map((emojiStyle) => (
                                <button
                                    key={emojiStyle}
                                    className={styles.style}
                                    aria-pressed={style === emojiStyle}
                                    aria-checked={style === emojiStyle}
                                    aria-label={`Change style to ${emojiStyle}`}
                                    onClick={() => {
                                        setStyle(emojiStyle);
                                        setStylePickerVisible(false);
                                    }}
                                >
                                    <Image
                                        alt="Clap"
                                        width={20}
                                        height={20}
                                        draggable={false}
                                        src={`/assets/emojis/1F44F${emojiStyle}.svg`}
                                    />
                                </button>
                            ))}
                    </div>
                </div>
            </header>

            <main>
                <nav className={styles.nav}>
                    <button
                        id={`category-frequently-used-button`}
                        data-active={activeCategory === "frequently"}
                        aria-label="Scroll to Frequently Used category"
                        onClick={() => {
                            const element = document.getElementById(`category-frequently-used`);
                            element?.scrollIntoView();
                        }}
                    >
                        <Icon name="clock" />
                    </button>

                    <hr />

                    {categories.map((category) => (
                        <button
                            key={category.name}
                            id={`category-${category.name}-button`}
                            data-active={activeCategory === category.name}
                            onClick={() => {
                                const element = document.querySelector(
                                    `#category-${category.name}-anchor`
                                );
                                element?.scrollIntoView();
                            }}
                        >
                            <Icon name={category.icon} />
                        </button>
                    ))}
                </nav>

                <section>
                    <div
                        ref={listRef}
                        className={`${styles.list} scrollbar`}
                    >
                        {filteredEmojis !== null ? (
                            <div
                                style={{
                                    padding: "6px 0",
                                }}
                            >
                                <EmojiList
                                    style={style}
                                    emojis={filteredEmojis}
                                    setCurrent={setCurrent}
                                />
                            </div>
                        ) : (
                            <>
                                <div className={styles.category}>
                                    <span id={`category-frequently-used-anchor`} />

                                    <button
                                        aria-haspopup="true"
                                        className={styles.title}
                                        id={`category-frequently-used`}
                                        aria-expanded={expanded.includes("Frequently Used")}
                                        aria-label={`Expand Frequently Used category`}
                                        onClick={() => {
                                            if (expanded.includes("Frequently Used")) {
                                                setExpanded(
                                                    expanded.filter(
                                                        (name) => name !== "Frequently Used"
                                                    )
                                                );
                                            } else {
                                                setExpanded([...expanded, "Frequently Used"]);
                                            }
                                        }}
                                    >
                                        <Icon
                                            size={16}
                                            name="clock"
                                        />
                                        <div>Frequently Used</div>
                                        <Icon
                                            size={16}
                                            name="caret"
                                        />
                                    </button>

                                    {expanded.includes("Frequently Used") && (
                                        <EmojiList
                                            style={style}
                                            emojis={mostUsed}
                                            setCurrent={setCurrent}
                                        />
                                    )}
                                </div>
                                {categories.map((category) => {
                                    const emojis = emojiList[category.name] || [];

                                    if (emojis.length === 0) {
                                        return null;
                                    }

                                    const isExpanded = expanded.includes(category.name);

                                    return (
                                        <div
                                            key={category.name}
                                            className={styles.category}
                                        >
                                            <span id={`category-${category.name}-anchor`} />

                                            <button
                                                aria-haspopup="true"
                                                className={styles.title}
                                                aria-expanded={isExpanded}
                                                id={`category-${category.name}`}
                                                aria-label={`Expand ${category.name} category`}
                                                onClick={() => {
                                                    if (isExpanded) {
                                                        setExpanded(
                                                            expanded.filter(
                                                                (name) => name !== category.name
                                                            )
                                                        );
                                                    } else {
                                                        setExpanded([...expanded, category.name]);
                                                    }
                                                }}
                                            >
                                                <Icon
                                                    size={16}
                                                    name={category.icon}
                                                />
                                                <div>{category.name}</div>
                                                <Icon
                                                    size={16}
                                                    name="caret"
                                                />
                                            </button>

                                            {isExpanded && (
                                                <EmojiList
                                                    style={style}
                                                    emojis={emojis}
                                                    setCurrent={setCurrent}
                                                />
                                            )}
                                        </div>
                                    );
                                })}{" "}
                            </>
                        )}
                    </div>

                    <div className={styles.preview}>
                        {current && (
                            <div>
                                <Image
                                    width={28}
                                    height={28}
                                    draggable={false}
                                    alt={current.names[0]}
                                    src={`/assets/emojis/${current.hex}.svg`}
                                />

                                <div>{current.names.join(" ")}</div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

const EmojiList = memo(function Emojis({
    emojis,
    setCurrent,
    style,
}: {
    emojis: Emoji[];
    setCurrent: (emoji: Emoji) => void;
    style: string;
}) {
    const filteredEmojis = useMemo(
        () =>
            emojis.filter((e) => {
                if (!e.hasStyles) return true;

                if (style === "") {
                    return !emojiStyles.some((modifier) => e.hex.includes(modifier));
                }

                return e.hex.includes(style);
            }),
        [emojis, style]
    );

    const { data, setData } = useEmojiPicker();
    const { addEmoji } = useMostUsedEmojis();

    return (
        <div className={styles.emojis}>
            {filteredEmojis.map((emoji) => (
                <button
                    key={emoji.hex}
                    className={styles.emoji}
                    aria-label={`Insert ${emoji.names[0]} emoji`}
                    onMouseEnter={(e) => {
                        setCurrent(emoji);
                        e.currentTarget.focus();
                    }}
                    onClick={() => {
                        addEmoji(emoji.hex);

                        if (data.onClick) {
                            data.onClick(emoji.hex);
                            setData({ ...data, open: false });
                        }
                    }}
                >
                    <Image
                        width={40}
                        height={40}
                        draggable={false}
                        alt={emoji.names[0]}
                        src={`/assets/emojis/${emoji.hex}.svg`}
                    />
                </button>
            ))}
        </div>
    );
});
