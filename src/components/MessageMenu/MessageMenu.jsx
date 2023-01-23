import styles from './MessageMenu.module.css';
import { Tooltip, Icon } from '../';
import { useEffect, useState } from 'react';
import useUserData from '../../hooks/useUserData';
import React from 'react';

const MessageMenu = ({ message, start, functions }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [menuType, setMenuType] = useState(null);

    const senderItems = [
        {
            name: 'Edit Message',
            icon: <Icon name="edit" size={18} />,
            function: functions.editMessage,
        },
        {
            name: 'Pin Message',
            icon: <Icon name="pin" size={18} />,
            function: functions.pinMessage,
        },
        {
            name: 'Reply',
            icon: <Icon name="reply" size={18} />,
            function: functions.replyToMessage,
        },
        {
            name: 'Mark Unread',
            icon: <Icon name="mark" size={18} />,
            function: functions.markUnread,
        },
        {
            name: 'Copy Message Link',
            icon: <Icon name="link" size={18} />,
            function: functions.copyMessageLink,
        },
        {
            name: 'Delete Message',
            icon: <Icon name="delete" size={18} />,
            function: functions.deleteMessage,
            type: 'danger',
        },
        {
            name: 'Copy Message ID',
            icon: <Icon name="id" size={18} />,
            function: functions.copyMessageID,
        },
    ];

    const receiverItems = [
        {
            name: 'Pin Message',
            icon: <Icon name="pin" size={18} />,
            function: functions.pinMessage,
        },
        {
            name: 'Reply',
            icon: <Icon name="reply" size={18} />,
            function: functions.replyToMessage,
        },
        {
            name: 'Mark Unread',
            icon: <Icon name="mark" size={18} />,
            function: functions.markUnread,
        },
        {
            name: 'Copy Message Link',
            icon: <Icon name="link" size={18} />,
            function: functions.copyMessageLink,
        },
        {
            name: 'Copy Message ID',
            icon: <Icon name="id" size={18} />,
            function: functions.copyMessageID,
        },
    ];

    const { auth } = useUserData();

    useEffect(() => {
        if (
            message?.sender?._id.toString()
            === auth?.user?._id.toString()
        ) {
            setMenuType('sender');
        } else {
            setMenuType('receiver');
        }
    }, [message, auth]);

    return (
        <div
            className={styles.buttonContainer}
        >

            {showMenu && (
                <div
                    className={styles.menu}
                    style={{
                        top: start ? '-16px' : '-25px',
                    }}
                >
                    <div className={styles.menuWrapper}>
                        {menuType === 'sender' ? senderItems.map((item) => (
                            <React.Fragment key={item.name}>
                                {
                                    item.name === 'Copy Message ID' && (
                                        <div className={styles.divider}></div>
                                    )
                                }
                                <div
                                    className={
                                        item.type === 'danger'
                                            ? styles.menuItemDanger
                                            : styles.menuItem
                                    }
                                    onClick={() => {
                                        setShowMenu(false);
                                        item.function(message._id);
                                    }}
                                >
                                    <div className={styles.label}>
                                        {item.name}
                                    </div>
                                    <div className={styles.icon}>
                                        {item.icon}
                                    </div>
                                </div>
                            </React.Fragment>
                        )) : receiverItems.map((item) => (
                            <React.Fragment key={item.name}>
                                {
                                    item.name === 'Copy Message ID' && (
                                        <div className={styles.divider}></div>
                                    )
                                }
                                <div
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setShowMenu(false);
                                        item.function(message._id);
                                    }}
                                >
                                    <div className={styles.label}>
                                        {item.name}
                                    </div>
                                    <div className={styles.icon}>
                                        {item.icon}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <div
                className={styles.buttonWrapper}
                style={{
                    top: start ? '-16px' : '-25px',
                }}
            >
                <div className={styles.buttons}>
                    <div
                        role="button"
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <Tooltip
                            show={showTooltip === 1}
                        >
                            Add Reaction
                        </Tooltip>
                        <Icon name="addReaction" />
                    </div>

                    {menuType === 'sender' ? (
                        <div
                            role="button"
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                            >
                                Edit
                            </Tooltip>
                            <Icon name="edit" />
                        </div>
                    ) : (
                        <div
                            role="button"
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                            >
                                Reply
                            </Tooltip>
                            <Icon name="reply" />
                        </div>
                    )}

                    <div
                        role="button"
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <Tooltip
                            show={showTooltip === 3}
                        >
                            More
                        </Tooltip>
                        <Icon name="dots" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageMenu;
