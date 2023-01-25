import { Icon } from "../";
import { useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from './Menu.module.css';

const Menu = ({ items, position, setMenu }) => {
    const menuLoaded = useRef(false);
    const menuRef = useRef(null);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (menuRef.current && !menuRef.current.contains(event.target)) {
    //             setMenu.func(false);
    //         }
    //     };

    //     if (menuLoaded) {
    //         document.addEventListener("click", handleClickOutside);
    //     }

    //     return () => {
    //         menuLoaded && document.removeEventListener("click", handleClickOutside);
    //         menuLoaded.current = true;
    //     };
    // }, []);

    return (
        <div
            ref={menuRef}
            className={styles.menuContainer}
            style={position ?? {}}
            onClick={(e) => e.stopPropagation()}
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
