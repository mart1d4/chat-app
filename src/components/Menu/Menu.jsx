import { Icon } from "../";
import { useState, useRef, useEffect } from "react";
import styles from './Menu.module.css';

const Menu = ({ items, position }) => {
    const [showMenu, setShowMenu] = useState(true);

    const menuRef = useRef(null);

    useEffect(() => {
        window.addEventListener("click", (e) => {
            if (e.target === menuRef.current) return;
            setShowMenu(false);
        });

        return () => {
            window.removeEventListener("click", (e) => {
                if (e.target === menuRef.current) return;
                setShowMenu(false);
            });
        };
    }, []);

    return (
        showMenu &&
        <div
            ref={menuRef}
            className={styles.menuContainer}
            style={position ?? {}}
        >
            <div>
                {items?.map((item) => (
                    item.name === "Divider" ? (
                        <div key={item.name} className={styles.divider}></div>
                    ) : (
                        <div
                            key={item.name}
                            className={item.danger ? styles.menuItemDanger : styles.menuItem}
                            onClick={() => {
                                setShowMenu(false);
                                item.func();
                            }}
                        >
                            <div className={styles.label}>
                                {item.name}
                            </div>
                            {item.icon && (
                                <div className={styles.icon}>
                                    <Icon
                                        name={item.icon}
                                        size={18}
                                    />
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
