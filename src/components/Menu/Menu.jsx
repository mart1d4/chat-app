import { Icon, Message, UserProfile } from "../";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from './Menu.module.css';
import useComponents from "../../hooks/useComponents";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRouter } from "next/router";

const Menu = () => {
    const [positions, setPositions] = useState({});
    const [container, setContainer] = useState(null);
    const [active, setActive] = useState(null);
    const [shift, setShift] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState(null);

    const { menu, setMenu } = useComponents();
    const event = menu?.event;
    const side = menu?.side;
    const side2 = menu?.side2;
    const element = menu?.element;
    const gap = menu?.gap;
    const items = menu?.items;

    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();

    useEffect(() => {
        if (!menu) {
            setPositions({});
            setContainer(null);
            setActive(null);
        }
    }, [menu]);

    useEffect(() => {
        if (menu?.name !== "pin" || !router.query.channelID) return;

        const handleClick = (e) => {
            if (
                e.target.contains(containerRef.current) ||
                menu?.name !== "pin" || !menu
            ) return;
            setMenu(null);
        };

        const getPinnedMessages = async () => {
            const response = await axiosPrivate.get(
                `/channels/${router.query.channelID}/pins`,
            );

            setPinnedMessages(response.data.pins.reverse());
        };

        getPinnedMessages();

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [menu]);

    useEffect(() => {
        const handleShift = (e) => {
            if (e.key === "Shift") {
                setShift(true);
            }
        };

        const handleShiftUp = (e) => {
            if (e.key === "Shift") {
                setShift(false);
            }
        };

        document.addEventListener("keydown", handleShift);
        document.addEventListener("keyup", handleShiftUp);

        return () => {
            document.removeEventListener("keydown", handleShift);
            document.removeEventListener("keyup", handleShiftUp);
        };
    }, []);

    const containerRef = useCallback(node => {
        if (!event) return;

        if (node !== null) {
            setContainer({
                width: node.offsetWidth,
                height: node.offsetHeight,
                rect: node.getBoundingClientRect(),
            });
        }
    }, [event]);

    const menuItems = items?.filter((item) => item.name !== "Divider");

    useEffect(() => {
        if (!container || !event) return;

        let pos = {}

        if (!side && !element) {
            // If there's not enough space to the right, open to the left
            if (window.innerWidth - 10 - event.clientX < container.width) {
                pos = {
                    top: event.clientY,
                    left: event.clientX - container.width,
                };
            } else {
                pos = {
                    top: event.clientY,
                    left: event.clientX,
                };
            }

            // If there's not enough space to the bottom, move the menu up
            if (window.innerHeight - 10 - event.clientY < container.height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: "unset",
                };
            }
        } else {
            // If a side is specified, open the menu to that side of the element

            const elementRect = element.getBoundingClientRect();

            if (side === "left") {
                pos = {
                    top: elementRect.top,
                    left: elementRect.left - container.width - gap,
                };

                if (side2 === "top") {
                    pos = {
                        ...pos,
                        top: elementRect.top,
                    };
                } else if (side2 === "bottom") {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (side === "right") {
                pos = {
                    top: elementRect.top,
                    left: elementRect.right + gap,
                };

                if (side2 === "top") {
                    pos = {
                        ...pos,
                        top: elementRect.top,
                    };
                } else if (side2 === "bottom") {
                    pos = {
                        ...pos,
                        top: elementRect.bottom - container.height,
                    };
                }
            } else if (side === "top") {
                pos = {
                    top: elementRect.top - container.height - gap,
                    left: elementRect.left,
                };

                if (side2 === "left") {
                    pos = {
                        ...pos,
                        left: elementRect.left,
                    };
                } else if (side2 === "right") {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                }
            } else if (side === "bottom") {
                pos = {
                    top: elementRect.bottom + gap,
                    left: elementRect.left,
                };

                if (side2 === "left") {
                    pos = {
                        ...pos,
                        left: elementRect.left,
                    };
                } else if (side2 === "right") {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                }
            }

            if (menu?.name !== "pin") {
                // If there's not enough space to the bottom, move the menu up
                if (window.innerHeight - 10 - pos.top < container.height) {
                    pos = {
                        ...pos,
                        bottom: 10,
                        top: "unset",
                    };
                } else {
                    pos = {
                        ...pos,
                        bottom: "unset",
                    };
                }

                // If there's not enough space to the right, move the menu to the left
                if (window.innerWidth - 10 - pos.left < container.width) {
                    pos = {
                        ...pos,
                        left: elementRect.right - container.width,
                    };
                } else {
                    pos = {
                        ...pos,
                        right: "unset",
                    };
                }
            }
        }

        setPositions(pos);
    }, [container, container?.width]);

    useEffect(() => {
        if (!container || !event) return;

        const handleClickOutside = (e) => {
            if (
                e.clientX === event.clientX
                || side
            ) return;
            setMenu(null);
        };

        const handlekeyDown = (e) => {
            if (menu?.name === "pin") return;

            if (e.key === "Escape") {
                setMenu(null);
            } else if (e.key === "ArrowDown") {
                if (active === null) {
                    setActive(menuItems[0].name);
                } else {
                    const index = menuItems.findIndex((item) => item.name === active);
                    if (index < menuItems.length - 1) {
                        setActive(menuItems[index + 1].name);
                    } else {
                        setActive(menuItems[0].name);
                    }
                }
            } else if (e.key === "ArrowUp") {
                if (active === null) {
                    setActive(menuItems[menuItems.length - 1].name);
                } else {
                    const index = menuItems.findIndex((item) => item.name === active);
                    if (index > 0) {
                        setActive(menuItems[index - 1].name);
                    } else {
                        setActive(menuItems[menuItems.length - 1].name);
                    }
                }
            } else if (e.key === "Enter") {
                if (active) {
                    setMenu(null);
                    menuItems.find((item) => item.name === active).func();
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handlekeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handlekeyDown);
        };
    }, [active]);

    if (!menu) return null;

    if (menu.name === "userProfile") {
        return (
            <div
                ref={containerRef}
                className={styles.profileContainer}
                style={{
                    ...positions,
                    opacity: (container && positions.top) ? 1 : 0,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <UserProfile littleUser={menu.user} side={side} />
            </div>
        );
    }

    if (menu.name === "pin") {
        return (
            <div
                ref={containerRef}
                className={styles.pinContainer}
                style={{
                    ...positions,
                    opacity: (container && positions.top) ? 1 : 0,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <div>
                    <h1>Pinned Messages</h1>
                </div>

                <div className="scrollbar">
                    {(!pinnedMessages || pinnedMessages.length === 0) ? (
                        <div className={styles.noPinnedContent}>
                            <div />

                            <div>
                                This direct message doesn't have <br />
                                any pinned messages... yet.
                            </div>
                        </div>
                    ) :
                        pinnedMessages.map((message) => (
                            <div
                                key={uuidv4()}
                                className={styles.messageContainer}
                            >
                                <Message message={message} noInt={true} />
                            </div>
                        ))
                    }
                </div>

                {(!pinnedMessages || pinnedMessages.length === 0) && (
                    <div className={styles.noPinnedBottom}>
                        <div>
                            <div>
                                Protip:
                            </div>

                            <div>
                                You and { } can pin a message from its cog menu.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={styles.menuContainer}
            style={{
                ...positions,
                opacity: (container && positions.top) ? 1 : 0,
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseLeave={() => setActive(null)}
        >
            <div>
                {items?.map((item) => (
                    item.name === "None" ? null :
                        item.name === "Divider" ? (
                            <div key={uuidv4()} className={styles.divider}></div>
                        ) : (
                            <div
                                key={uuidv4()}
                                className={item.disabled
                                    ? styles.menuItemDisabled : item.danger
                                        ? active === item.name ? styles.menuItemDangerActive : styles.menuItemDanger
                                        : active === item.name ? styles.menuItemActive : styles.menuItem
                                }
                                onClick={() => {
                                    if (item.disabled) return;
                                    setMenu(null);
                                    if (shift && item.funcShift) {
                                        item.funcShift();
                                        return;
                                    }
                                    item.func();
                                }}
                                onMouseEnter={() => setActive(item.name)}
                            >
                                <div className={styles.label}>
                                    {item.name}
                                </div>

                                {item.icon && (
                                    <div className={styles.icon}>
                                        <Icon
                                            name={item.icon}
                                            size={item.iconSize ?? 16}
                                            fill={active === item.name ? "var(--foreground-1)" : ""}
                                        />
                                    </div>
                                )}

                                {item.text && (
                                    <div className={styles.text}>
                                        {item.text}
                                    </div>
                                )}
                            </div>
                        )
                ))}
            </div>
        </div>
    );
}

export default Menu;
