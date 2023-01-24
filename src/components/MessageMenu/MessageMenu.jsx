import styles from './MessageMenu.module.css';
import { Tooltip, Icon, Menu } from '../';
import { useEffect, useState } from 'react';
import useUserData from '../../hooks/useUserData';
import React from 'react';

const MessageMenu = ({ message, start, functions }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [menuType, setMenuType] = useState(null);

    const senderItems = [
        { name: 'Edit Message', icon: "edit", func: functions.editMessage },
        { name: 'Pin Message', icon: "pin", func: functions.pinMessage },
        { name: 'Reply', icon: "reply", func: functions.replyToMessage },
        { name: 'Mark Unread', icon: "mark", func: functions.markUnread },
        { name: 'Copy Message Link', icon: "link", func: functions.copyMessageLink },
        { name: 'Delete Message', icon: "delete", func: functions.deleteMessage, danger: true },
        { name: 'Divider' },
        { name: 'Copy Message ID', icon: "id", func: functions.copyMessageID },
    ];

    const receiverItems = [
        { name: 'Pin Message', icon: "pin", func: functions.pinMessage, },
        { name: 'Reply', icon: "reply", func: functions.replyToMessage, },
        { name: 'Mark Unread', icon: "mark", func: functions.markUnread, },
        { name: 'Copy Message Link', icon: "link", func: functions.copyMessageLink, },
        { name: 'Divider', },
        { name: 'Copy Message ID', icon: "id", func: functions.copyMessageID, },
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
                <Menu
                    items={menuType === 'sender' ? senderItems : receiverItems}
                    position={{
                        top: start ? '-16px' : '-25px',
                        right: '60px',
                    }}
                />
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
