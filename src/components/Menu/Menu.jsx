import { Icon } from "../";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from './Menu.module.css';

const Menu = ({ items, position, event, setMenu }) => {
    const [positions, setPositions] = useState({});

    const menuRef = useRef(null);
    const fixed = position ? false : true;

    useEffect(() => {
        if (fixed) {
            // If there's not enough space to the right, open to the left
            if (window.innerWidth - event.clientX < menuRef.current.offsetWidth) {
                setPositions({
                    top: event.clientY,
                    left: event.clientX - menuRef.current.offsetWidth,
                });
            } else {
                setPositions({
                    top: event.clientY,
                    left: event.clientX,
                });
            }

            // If there's not enough space to the bottom, open to the top
            if (window.innerHeight - event.clientY < menuRef.current.offsetHeight) {
                setPositions({
                    ...positions,
                    top: event.clientY - menuRef.current.offsetHeight,
                });
            }
        } else {
            // If there's not enough space to the bottom, open to the top
            if (window.innerHeight - position.y < menuRef.current.offsetHeight) {
                setPositions({
                    ...position,
                    top: position.top - menuRef.current.offsetHeight,
                });
            } else {
                setPositions(position);
            }
        }
    }, [position]);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (menuRef.current && !menuRef.current.contains(event.target)) {
    //             setMenu.func(false);
    //         }
    //     };

    //     document.addEventListener("click", handleClickOutside);

    //     return () => {
    //         document.removeEventListener("click", handleClickOutside);
    //     };
    // }, [position]);

    return (
        <div
            ref={menuRef}
            className={styles.menuContainer}
            style={{
                ...positions,
                position: fixed ? "fixed" : "absolute",
                opacity: positions === {} ? 0 : 1,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div>
                {items?.map((item) => (
                    item.name === "Divider" ? (
                        <div key={uuidv4()} className={styles.divider}></div>
                    ) : (
                        <div
                            key={uuidv4()}
                            className={item.danger ? styles.menuItemDanger : styles.menuItem}
                            onClick={() => {
                                setMenu.func();
                                item.func();
                            }}
                        >
                            <div className={styles.label}>
                                {item.name}
                            </div>

                            {item.icon && (
                                <div className={styles.icon}>
                                    <Icon name={item.icon} size={18} />
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>
        </div >
    );
}

export default Menu;
