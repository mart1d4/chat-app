'use client';

import { FixedMessage, Icon, Avatar } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import { useEffect, useState, useRef } from 'react';
import useFetchHelper from '@/hooks/useFetchHelper';
import { useRouter } from 'next/navigation';
import styles from './Popout.module.css';
import { v4 as uuidv4 } from 'uuid';

const Popout = ({ content }: any) => {
    const [filteredList, setFilteredList] = useState<TCleanUser[]>([]);
    const [search, setSearch] = useState<string>('');
    const [chosen, setChosen] = useState<TCleanUser[]>([]);
    const [copied, setCopied] = useState<boolean>(false);
    const [placesLeft, setPlacesLeft] = useState<number>(9);
    const [friends, setFriends] = useState<TCleanUser[]>([]);
    const [pinned, setPinned] = useState<TMessage[]>([]);

    const { setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();
    const token = auth.accessToken;

    const inputRef = useRef<HTMLInputElement>(null);
    const inputLinkRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (content?.pinned) {
            const fetchPinned = async () => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/channels/${content.channel.id}/messages/pinned`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ).then((res) => res.json());

                setPinned(response.pinned);
            };

            fetchPinned();
        } else {
            const friendList = auth.user.friends || [];
            setFriends(friendList);

            if (content?.channel) {
                const filteredFriends = friendList.filter((friend: any) => {
                    return !content.channel.recipientIds.includes(friend.id);
                });

                setFilteredList(filteredFriends);
                setPlacesLeft(10 - content.channel.recipientIds.length);
            } else {
                setFilteredList(friendList);
                setPlacesLeft(9);
            }
        }
    }, [content]);

    useEffect(() => {
        if (content?.pinned) return;

        if (content?.channel) {
            if (chosen?.length === 0) {
                setPlacesLeft(10 - content.channel.recipientIds.length);
            } else {
                setPlacesLeft(10 - content.channel.recipientIds.length - chosen.length);
            }
        } else {
            if (chosen?.length === 0) setPlacesLeft(9);
            else setPlacesLeft(9 - chosen.length);
        }
    }, [chosen]);

    useEffect(() => {
        if (content?.pinned || !friends) return;

        if (content?.channel) {
            const filteredFriends = friends?.filter((friend: any) => {
                return !content?.channel.recipientIds.includes(friend.id);
            });

            if (search) {
                setFilteredList(
                    filteredFriends?.filter((user: any) => {
                        return user.username.toLowerCase().includes(search.toLowerCase());
                    })
                );
            } else {
                setFilteredList(filteredFriends);
            }
        } else {
            if (search) {
                setFilteredList(
                    friends?.filter((user: any) => {
                        return user.username.toLowerCase().includes(search.toLowerCase());
                    })
                );
            } else {
                setFilteredList(friends);
            }
        }
    }, [search, friends]);

    const createChan = async () => {
        const recipients = chosen.map((user) => user.id);

        if (content?.channel) {
            if (content.channel.type === 'DM') {
                const currentRecipient = content.channel.recipientIds.find(
                    (recipient: string) => recipient !== auth.user.id
                );

                sendRequest({
                    query: 'CHANNEL_CREATE',
                    data: {
                        recipients: [currentRecipient, ...recipients],
                    },
                });
            } else if (content.channel.type === 'GROUP_DM') {
                const channelExists = (recipients: string[]) => {
                    const channel = auth.user.channels.find((channel: TChannel) => {
                        return (
                            channel.recipients.length === recipients.length &&
                            channel.recipientIds.every((recipient: string) => recipients.includes(recipient))
                        );
                    });

                    if (channel) return channel;
                };

                const addUsers = () => {
                    recipients.forEach((recipient) => {
                        sendRequest({
                            query: 'CHANNEL_RECIPIENT_ADD',
                            params: {
                                channelId: content?.channel.id,
                                recipientId: recipient,
                            },
                        });
                    });
                };

                const channel = channelExists([...content.channel.recipientIds, ...recipients]);

                if (channel) {
                    setPopup({
                        type: 'CHANNEL_EXISTS',
                        channel: channel,
                        addUsers: addUsers,
                    });
                } else {
                    addUsers();
                }
            }
        } else {
            sendRequest({
                query: 'CHANNEL_CREATE',
                data: {
                    recipients: recipients,
                },
            });
        }
    };

    if (content?.pinned) {
        return (
            <div
                className={styles.pinContainer}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div>
                    <h1>Pinned Messages</h1>
                </div>

                <div className='scrollbar'>
                    {!pinned || pinned.length === 0 ? (
                        <div className={styles.noPinnedContent}>
                            <div />

                            <div>
                                This direct message doesn't have <br />
                                any pinned messages... yet.
                            </div>
                        </div>
                    ) : (
                        pinned.map((message) => (
                            <div
                                key={uuidv4()}
                                className={styles.messageContainer}
                            >
                                <FixedMessage
                                    message={message}
                                    pinned={true}
                                />
                            </div>
                        ))
                    )}
                </div>

                {(!pinned || pinned.length === 0) && (
                    <div className={styles.noPinnedBottom}>
                        <div>
                            <div>Protip:</div>

                            <div>You and {} can pin a message from its cog content.</div>
                        </div>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div
                className={styles.popup}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className={styles.header}>
                    <h1>Select Friends</h1>
                    {friends.length > 0 && (
                        <>
                            <div>
                                {placesLeft > 0
                                    ? `You can add ${placesLeft} more friend${placesLeft > 1 ? 's' : ''}.`
                                    : 'This group has a 10 member limit.'}
                            </div>

                            <div className={styles.input}>
                                <div>
                                    <div>
                                        {chosen?.map((friend) => (
                                            <div
                                                key={uuidv4()}
                                                className={styles.friendChip}
                                                onClick={() => {
                                                    setChosen(chosen?.filter((user) => user.id !== friend.id));
                                                }}
                                            >
                                                {friend.username}
                                                <Icon
                                                    name='close'
                                                    size={12}
                                                />
                                            </div>
                                        ))}

                                        <input
                                            ref={inputRef}
                                            type='text'
                                            placeholder={
                                                chosen?.length
                                                    ? 'Find or start a conversation'
                                                    : 'Type the username of a friend'
                                            }
                                            value={search || ''}
                                            spellCheck='false'
                                            role='combobox'
                                            aria-autocomplete='list'
                                            aria-expanded='true'
                                            aria-haspopup='true'
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !search) {
                                                    setChosen(chosen?.slice(0, -1));
                                                }
                                            }}
                                        />

                                        <div></div>
                                    </div>
                                </div>

                                {content?.channel?.type === 'GROUP_DM' && (
                                    <div className={styles.addButton}>
                                        <button
                                            className={chosen?.length ? 'blue' : 'blue disabled'}
                                            onClick={() => {
                                                if (chosen?.length) {
                                                    createChan();
                                                    setFixedLayer(null);
                                                }
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <button onClick={() => setFixedLayer(null)}>
                        <svg
                            viewBox='0 0 24 24'
                            width='24'
                            height='24'
                            role='image'
                        >
                            <path
                                fill='currentColor'
                                d='M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'
                            />
                        </svg>
                    </button>
                </div>

                {friends.length > 0 && filteredList.length > 0 && (
                    <>
                        <div className={styles.scroller + ' scrollbar'}>
                            {filteredList.map((friend) => (
                                <div
                                    key={uuidv4()}
                                    className={styles.friend}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (chosen.includes(friend)) {
                                            setChosen(chosen?.filter((user) => user.id !== friend.id));
                                        } else {
                                            if (placesLeft > 0) {
                                                setChosen([...chosen, friend]);
                                                setSearch('');
                                            }
                                        }
                                    }}
                                >
                                    <div>
                                        <div className={styles.friendAvatar}>
                                            <Avatar
                                                src={friend.avatar}
                                                alt={friend.username}
                                                size={32}
                                                status={friend.status}
                                            />
                                        </div>

                                        <div className={styles.friendUsername}>{friend.username}</div>

                                        <div className={styles.friendCheck}>
                                            <div>
                                                {chosen?.includes(friend) && (
                                                    <Icon
                                                        name='accept'
                                                        size={16}
                                                        fill='var(--accent-1)'
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.separator} />

                        {content?.channel?.type === 'GROUP_DM' ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type='text'
                                            readOnly
                                            value={`https://chat-app.mart1d4.com/${content?.channel.id}`}
                                            onClick={() => inputLinkRef.current?.select()}
                                        />
                                    </div>

                                    <button
                                        className={copied ? 'green' : 'blue'}
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `https://chat-app.mart1d4.com/${content?.channel.id}`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }}
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>

                                <div>Your invite link expires in 24 hours.</div>
                            </div>
                        ) : (
                            <div className={styles.footer}>
                                <button
                                    className={'blue ' + (content?.channel && !chosen.length ? 'disabled' : '')}
                                    onClick={() => {
                                        if (content?.channel && !chosen.length) return;
                                        setFixedLayer(null);
                                        createChan();
                                    }}
                                >
                                    Create DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {friends.length > 0 && filteredList.length === 0 && (
                    <>
                        <div
                            className={styles.noFriends}
                            style={{
                                padding: '0 20px',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    backgroundImage: `url(/assets/nothing-found.svg)`,
                                    width: '85px',
                                    height: '85px',
                                }}
                            />

                            <div>No friends found that are not already in this DM.</div>
                        </div>

                        <div className={styles.separator} />

                        {content?.channel?.type === 1 ? (
                            <div className={styles.footer}>
                                <h1>Or, send an invite link to a friend!</h1>

                                <div>
                                    <div>
                                        <input
                                            ref={inputLinkRef}
                                            type='text'
                                            readOnly
                                            value={`https://chat-app.mart1d4.com/${content?.channel.id}`}
                                            onClick={() => inputLinkRef.current?.select()}
                                        />
                                    </div>

                                    <button
                                        className={copied ? 'green' : 'blue'}
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `https://chat-app.mart1d4.com/${content?.channel.id}`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1000);
                                        }}
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>

                                <div>Your invite link expires in 24 hours.</div>
                            </div>
                        ) : (
                            <div className={styles.footer}>
                                <button
                                    className='blue'
                                    onClick={() => {
                                        if (chosen?.length) {
                                            setFixedLayer(null);
                                            createChan();
                                        }
                                    }}
                                >
                                    Create DM
                                </button>
                            </div>
                        )}
                    </>
                )}

                {friends.length === 0 && (
                    <div className={styles.noFriends}>
                        <div
                            style={{
                                backgroundImage: `url(/assets/app/no-friends-popout.svg)`,
                                width: '171px',
                                height: '86px',
                            }}
                        />

                        <div>You don't have any friends to add!</div>

                        <button
                            className='green'
                            onClick={() => {
                                setFixedLayer(null);
                                localStorage.setItem('friends-tab', 'add');
                                router.push('/channels/me');
                            }}
                        >
                            Add Friend
                        </button>
                    </div>
                )}
            </div>
        );
    }
};

export default Popout;
