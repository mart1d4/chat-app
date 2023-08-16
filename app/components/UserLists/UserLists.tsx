'use client';

import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Icon, UserItem } from '@components';
import styles from './UserLists.module.css';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

const contentData: contentType = {
    all: {
        src: 'https://ucarecdn.com/7b76d926-7e1b-4491-84c8-7074c4def321/',
        width: 376,
        height: 162,
        description: "We are waiting on friends. You don't have to though!",
        match: 'friends',
        title: 'All Friends',
    },
    online: {
        src: 'https://ucarecdn.com/11a4ecb1-1c4c-46a5-8a41-ad1a9347af2c/',
        width: 421,
        height: 218,
        description: "No one's around to play with us.",
        match: 'online friends',
        title: 'Online',
    },
    pending: {
        src: 'https://ucarecdn.com/357cdafa-b30c-4074-accb-4316074f1442/',
        width: 415,
        height: 200,
        description: "There are no pending requests. Here's us for now.",
        match: 'pending requests',
        title: 'Pending',
    },
    blocked: {
        src: 'https://ucarecdn.com/86b8a3de-5045-4b0b-8e02-23e701f8850c/',
        width: 433,
        height: 232,
        description: "You can't unblock us.",
        match: 'blocked users',
        title: 'Blocked',
    },
    noSearch: {
        src: 'https://ucarecdn.com/11a4ecb1-1c4c-46a5-8a41-ad1a9347af2c/',
        width: 421,
        height: 218,
        description: "We looked, but couldn't find anyone with that name.",
        match: 'friends',
        title: 'All Friends',
    },
};

type contentType = {
    [key: string]: {
        src: string;
        width: number;
        height: number;
        description: string;
        match: string;
        title: string;
    };
};

type Props = {
    content: string;
};

export const UserLists = ({ content }: Props): ReactElement => {
    const [search, setSearch] = useState<string>('');
    const [list, setList] = useState<TCleanUser[]>([]);
    const [filteredList, setFilteredList] = useState<TCleanUser[]>([]);

    const { setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const searchBar = useRef<HTMLInputElement>(null);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        setSearch((prev) => prev + text);
        searchBar.current?.focus();
    };

    useEffect(() => {
        if (content === 'all' || content === 'online') {
            let friends = auth.user.friends || [];

            if (content === 'online') {
                if (friends.length) {
                    friends = friends.filter((user: TCleanUser) => user.status === 'ONLINE');
                }
                setList(friends);
                return;
            }

            setList(friends);
        } else if (content === 'pending') {
            const sent = auth.user.requestsSent || [];
            const received = auth.user.requestsReceived || [];

            let sentReq = [];
            if (sent.length) {
                sentReq =
                    sent?.map((user: TCleanUser) => {
                        return { ...user, req: 'Sent' };
                    }) || [];
            }

            let receivedReq = [];
            if (received.length) {
                receivedReq =
                    received?.map((user: TCleanUser) => {
                        return { ...user, req: 'Received' };
                    }) || [];
            }

            setList([...sentReq, ...receivedReq].sort((a, b) => a.username.localeCompare(b.username)));
        } else if (content === 'blocked') {
            const blockedUsers = auth.user.blockedUsers || [];
            setList(blockedUsers);
        }
    }, [content, auth.user]);

    useEffect(() => {
        if (search) {
            setFilteredList(
                list?.filter((user) => {
                    return user.username.toLowerCase().includes(search.toLowerCase());
                })
            );
        } else {
            setFilteredList(list);
        }
    }, [list, search]);

    const UserItems = useMemo(
        () => (
            <div className={styles.content}>
                <div className={styles.searchBar}>
                    <div>
                        <input
                            ref={searchBar}
                            placeholder='Search'
                            aria-label='Search'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setFixedLayer({
                                    type: 'menu',
                                    menu: 'INPUT',
                                    event: {
                                        mouseX: e.clientX,
                                        mouseY: e.clientY,
                                    },
                                    input: true,
                                    pasteText,
                                });
                            }}
                        />

                        <div
                            className={styles.inputButton}
                            role='button'
                            style={{ cursor: search.length ? 'pointer' : 'text' }}
                            onClick={() => {
                                setSearch('');
                                searchBar.current?.focus();
                            }}
                        >
                            <Icon
                                name={search.length ? 'cross' : 'search'}
                                size={20}
                            />
                        </div>
                    </div>
                </div>

                <h2 className={styles.title}>
                    {contentData[content]?.title} — {filteredList.length}
                </h2>

                <ul className={styles.listContainer + ' scrollbar'}>
                    {filteredList.length &&
                        filteredList?.map((user) => (
                            <UserItem
                                key={uuidv4()}
                                user={user}
                                content={content}
                            />
                        ))}
                </ul>
            </div>
        ),
        [filteredList]
    );

    if (list.length === 0) {
        return (
            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src={contentData[content].src}
                        alt='No Users'
                        width={contentData[content].width}
                        height={contentData[content].height}
                        priority
                    />

                    <div>{contentData[content].description}</div>
                </div>
            </div>
        );
    }

    if (filteredList.length === 0 && search.length > 0) {
        return (
            <div className={styles.content}>
                <div className={styles.searchBar}>
                    <div>
                        <input
                            ref={searchBar}
                            placeholder='Search'
                            aria-label='Search'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div
                            className={styles.inputButton}
                            role='button'
                            style={{ cursor: search.length ? 'pointer' : 'text' }}
                            onClick={() => {
                                setSearch('');
                                searchBar.current?.focus();
                            }}
                            tabIndex={0}
                        >
                            <Icon
                                name={search.length ? 'cross' : 'search'}
                                size={20}
                            />
                        </div>
                    </div>
                </div>

                <h2 className={styles.title}>
                    {contentData[content]?.title} — {filteredList.length}
                </h2>

                <div className={styles.noData}>
                    <Image
                        src={contentData.noSearch.src}
                        alt='Nobody found with that username'
                        width={contentData.noSearch.width}
                        height={contentData.noSearch.height}
                        priority
                    />

                    <div>{contentData.noSearch.description}</div>
                </div>
            </div>
        );
    }

    return UserItems;
};