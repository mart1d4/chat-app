import { Icon } from "../";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from './Menu.module.css';

const Menu = ({ items, position, event, setMenu }) => {
    const [positions, setPositions] = useState({});
    const [parent, setParent] = useState(null);
    const [container, setContainer] = useState(null);
    const [active, setActive] = useState(null);

    const menuItems = items.filter((item) => item.name !== "Divider");

    const fixed = position ? false : true;

    const containerRef = useCallback(node => {
        if (node !== null) {
            setParent(node.parentElement);
            setContainer({
                width: node.offsetWidth,
                height: node.offsetHeight,
                rect: node.getBoundingClientRect(),
            });
        }
    }, []);

    useEffect(() => {
        if (!parent || !container) return;

        if (fixed) {
            let pos = {}

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

            // If there's not enough space to the bottom, open to the top
            if (window.innerHeight - 10 - event.clientY < container.height) {
                pos = {
                    ...pos,
                    bottom: 10,
                    top: "unset",
                };
            }

            setPositions(pos);
        } else {
            // If there's not enough space to the bottom, open to the top
            if (window.innerHeight - 10 - position.y < container.height) {
                setPositions({
                    ...position,
                    top: position.top - container.height - 10,
                });
            } else {
                setPositions(position);
            }
        }
    }, [parent, event]);

    useEffect(() => {
        if (!parent) return;

        const handleClickOutside = (e) => {
            if (parent.contains(e.target)) return;
            setMenu.func();
        };

        const handlekeyDown = (e) => {
            if (e.key === "Escape") {
                setMenu.func();
            } else if (e.key === "ArrowDown") {
                if (active === null) {
                    console.log('eee');
                    setActive(menuItems[0]);
                } else {
                    const index = menuItems.indexOf(active);
                    if (index < menuItems.length - 1) {
                        setActive(menuItems[index + 1]);
                    } else {
                        setActive(menuItems[0]);
                    }
                }
            } else if (e.key === "ArrowUp") {
                if (active === null) {
                    setActive(menuItems[menuItems.length - 1]);
                } else {
                    const index = menuItems.indexOf(active);
                    if (index > 0) {
                        setActive(menuItems[index - 1]);
                    } else {
                        setActive(menuItems[menuItems.length - 1]);
                    }
                }
            } else if (e.key === "Enter") {
                if (active) {
                    setMenu.func();
                    active.func();
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handlekeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handlekeyDown);
        };
    }, [parent]);

    return (
        positions !== {} && (
            <div
                ref={containerRef}
                className={styles.menuContainer}
                style={{
                    ...positions,
                    position: fixed ? "fixed" : "absolute",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onMouseLeave={() => setActive(null)}
            >
                <div>
                    {items?.map((item) => (
                        item.name === "Divider" ? (
                            <div key={uuidv4()} className={styles.divider}></div>
                        ) : (
                            <div
                                key={uuidv4()}
                                className={item.danger ? (
                                    active === item ? styles.menuItemDangerActive : styles.menuItemDanger
                                ) : (
                                    active === item ? styles.menuItemActive : styles.menuItem
                                )}
                                onClick={() => {
                                    setMenu.func();
                                    item.func();
                                }}
                                onMouseEnter={() => setActive(item)}
                            >
                                <div className={styles.label}>
                                    {item.name}
                                </div>

                                {item.icon && (
                                    <div className={styles.icon}>
                                        <Icon
                                            name={item.icon}
                                            size={item.iconSize ?? 16}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    ))}
                </div>
            </div>
        )
    );
}

export default Menu;
