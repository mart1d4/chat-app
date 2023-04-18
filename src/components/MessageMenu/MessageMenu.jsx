import styles from './MessageMenu.module.css';
import { Tooltip, Icon } from '../';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import useAuth from '../../hooks/useAuth';
import useComponents from '../../hooks/useComponents';

const MessageMenu = ({ message, start, functions }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [menuType, setMenuType] = useState(null);

    const { auth } = useAuth();
    const { setFixedLayer, fixedLayer } = useComponents();
    const menuButtonRef = useRef(null);

    useEffect(() => {
        if (
            message?.author?._id.toString()
            === auth?.user?._id.toString()
        ) {
            setMenuType('sender');
        } else {
            setMenuType('receiver');
        }
    }, [message]);

    return (
        <div className={styles.buttonContainer}>
            <div
                className={styles.buttonWrapper}
                style={{ top: start ? '-16px' : '-25px' }}
            >
                <div className={styles.buttons}>
                    <div
                        role="button"
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <Tooltip
                            show={showTooltip === 1}
                            dist={5}
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
                            onClick={() => functions.editMessage()}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                                dist={5}
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
                            onClick={() => functions.replyToMessage()}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                                dist={5}
                            >
                                Reply
                            </Tooltip>
                            <Icon name="reply" />
                        </div>
                    )}

                    <div
                        ref={menuButtonRef}
                        role="button"
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (fixedLayer?.element === menuButtonRef.current) {
                                setFixedLayer(null);
                            } else {
                                setFixedLayer({
                                    type: 'menu',
                                    event: e,
                                    firstSide: 'left',
                                    element: menuButtonRef.current,
                                    gap: 5,
                                    message: message,
                                    deletePopup: functions.deletePopup,
                                    deleteMessage: functions.deleteMessage,
                                    pinPopup: functions.pinPopup,
                                    pinMessage: functions.pinMessage,
                                    unpinPopup: functions.unpinPopup,
                                    unpinMessage: functions.unpinMessage,
                                    editMessage: functions.editMessage,
                                    replyToMessage: functions.replyToMessage,
                                });
                                setShowTooltip(null);
                            }
                        }}
                    >
                        <Tooltip
                            show={showTooltip === 3}
                            dist={5}
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
