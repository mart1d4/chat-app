import styles from './MessageMenu.module.css';
import { Tooltip } from '../';
import { useEffect, useState } from 'react';
import useUserData from '../../hooks/useUserData';
import React from 'react';

const pinIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            fill="currentColor"
            d="M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096 9.87801V9.88001L5.73596 8.46501L4.32196 9.88001L8.56496 14.122L2.90796 19.778L4.32196 21.192L9.97896 15.536L14.222 19.778L15.636 18.364L14.222 16.95L19.171 12H19.172L20.586 13.414L22 12Z"
        />
    </svg>
);

const replyIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z"
            fill="currentColor"
        />
    </svg>
);

const markUnreadIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            fill="currentColor"
            d="M14 3H20C21 3 22.0001 4 22.0001 5V19.0003C22.0001 20 21 21 20 21H14C13 21 6 13 6 13H2V11H6C6 11 13 3 14 3Z"
        />
    </svg>
);

const copyLinkIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <g
            fill="none"
            fillRule="evenodd"
        >
            <path
                fill="currentColor"
                d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"
            />
            <rect width="24" height="24" />
        </g>
    </svg>
);

const editIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z"
            fill="currentColor"
        />
    </svg>
);

const deleteIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            fill="currentColor"
            d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"
        />
        <path
            fill="currentColor"
            d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"
        />
    </svg>
);

const copyIDIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox="0 0 24 24"
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2H5ZM8.79741 7.72V16H6.74541V7.72H8.79741ZM13.2097 7.72C16.0897 7.72 17.5897 9.388 17.5897 11.848C17.5897 14.308 16.0537 16 13.2577 16H10.3537V7.72H13.2097ZM13.1497 14.404C14.6137 14.404 15.5257 13.636 15.5257 11.86C15.5257 10.12 14.5537 9.316 13.1497 9.316H12.4057V14.404H13.1497Z"
        />
    </svg>
);

const MessageMenu = ({ message, start, functions }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [menuType, setMenuType] = useState(null);

    const senderItems = [
        {
            name: 'Edit Message',
            icon: editIcon,
            function: functions.editMessage,
        },
        {
            name: 'Pin Message',
            icon: pinIcon,
            function: functions.pinMessage,
        },
        {
            name: 'Reply',
            icon: replyIcon,
            function: functions.replyToMessage,
        },
        {
            name: 'Mark Unread',
            icon: markUnreadIcon,
            function: functions.markUnread,
        },
        {
            name: 'Copy Message Link',
            icon: copyLinkIcon,
            function: functions.copyMessageLink,
        },
        {
            name: 'Delete Message',
            icon: deleteIcon,
            function: functions.deleteMessage,
            type: 'danger',
        },
        {
            name: 'Copy Message ID',
            icon: copyIDIcon,
            function: functions.copyMessageID,
        },
    ];

    const receiverItems = [
        {
            name: 'Pin Message',
            icon: pinIcon,
            function: functions.pinMessage,
        },
        {
            name: 'Reply',
            icon: replyIcon,
            function: functions.replyToMessage,
        },
        {
            name: 'Mark Unread',
            icon: markUnreadIcon,
            function: functions.markUnread,
        },
        {
            name: 'Copy Message Link',
            icon: copyLinkIcon,
            function: functions.copyMessageLink,
        },
        {
            name: 'Copy Message ID',
            icon: copyIDIcon,
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12.2512 2.00309C12.1677 2.00104 12.084 2 12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 11.916 21.999 11.8323 21.9969 11.7488C21.3586 11.9128 20.6895 12 20 12C15.5817 12 12 8.41828 12 4C12 3.31052 12.0872 2.6414 12.2512 2.00309ZM10 8C10 6.896 9.104 6 8 6C6.896 6 6 6.896 6 8C6 9.105 6.896 10 8 10C9.104 10 10 9.105 10 8ZM12 19C15.14 19 18 16.617 18 14V13H6V14C6 16.617 8.86 19 12 19Z"
                            />
                            <path
                                d="M21 3V0H19V3H16V5H19V8H21V5H24V3H21Z"
                                fill="currentColor"
                            />
                        </svg>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z"
                                    fill="currentColor"
                                />
                            </svg>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z"
                                    fill="currentColor"
                                />
                            </svg>
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7 12.001C7 10.8964 6.10457 10.001 5 10.001C3.89543 10.001 3 10.8964 3 12.001C3 13.1055 3.89543 14.001 5 14.001C6.10457 14.001 7 13.1055 7 12.001ZM14 12.001C14 10.8964 13.1046 10.001 12 10.001C10.8954 10.001 10 10.8964 10 12.001C10 13.1055 10.8954 14.001 12 14.001C13.1046 14.001 14 13.1055 14 12.001ZM19 10.001C20.1046 10.001 21 10.8964 21 12.001C21 13.1055 20.1046 14.001 19 14.001C17.8954 14.001 17 13.1055 17 12.001C17 10.8964 17.8954 10.001 19 10.001Z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageMenu;
