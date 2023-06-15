'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Icon } from '@/app/app-components';
import styles from './UserList.module.css';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';
import Image from 'next/image';

const contentData: contentType = {
    all: {
        src: '/assets/add-friend.svg',
        width: 376,
        height: 162,
        description: "Wumpus is waiting on friends. You don't have to though!",
        match: 'friends',
        title: 'All Friends',
    },
    online: {
        src: '/assets/no-online.svg',
        width: 421,
        height: 218,
        description: "No one's around to play with Wumpus.",
        match: 'online friends',
        title: 'Online',
    },
    pending: {
        src: '/assets/no-pending.svg',
        width: 415,
        height: 200,
        description: "There are no pending requests. Here's Wumpus for now.",
        match: 'pending requests',
        title: 'Pending',
    },
    blocked: {
        src: '/assets/no-blocked.svg',
        width: 433,
        height: 232,
        description: "You can't unblock the Wumpus.",
        match: 'blocked users',
        title: 'Blocked',
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

const UserLists = ({ content }: Props): ReactNode => {
    const [search, setSearch] = useState<string>('');
    const [list, setList] = useState<CleanOtherUserType[]>([]);
    const [filteredList, setFilteredList] = useState<CleanOtherUserType[]>([]);

    const { auth }: any = useContextHook({ context: 'auth' });
    const { setFixedLayer }: any = useContextHook({ context: 'layer' });
    const token = auth.accessToken;
    const searchBar = useRef<HTMLInputElement>(null);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        setSearch((prev) => prev + text);
        searchBar.current?.focus();
    };

    useEffect(() => {
        const getList = async () => {
            if (content === 'all' || content === 'online') {
                let friends = auth.user.friends || [];

                if (content === 'online') {
                    if (friends.length) {
                        friends = friends.filter(
                            (user: CleanOtherUserType) => user.status === 'Online'
                        );
                    }
                    setList(friends);
                    return;
                }

                setList(friends);
            } else if (content === 'pending') {
                const sent = auth.user.sentRequests || [];
                const received = auth.user.receivedRequests || [];

                let sentReq = [];
                if (sent.length) {
                    sentReq =
                        sent?.map((user: CleanOtherUserType) => {
                            return { ...user, req: 'Sent' };
                        }) || [];
                }

                let receivedReq = [];
                if (received.length) {
                    receivedReq =
                        received?.map((user: CleanOtherUserType) => {
                            return { ...user, req: 'Received' };
                        }) || [];
                }

                setList(
                    [...sentReq, ...receivedReq].sort((a, b) =>
                        a.username.localeCompare(b.username)
                    )
                );
            } else if (content === 'blocked') {
                const blockedUsers = auth.user.blockedUsers || [];
                setList(blockedUsers);
            }
        };
        getList();
    }, [content]);

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

    const contentComponent = useMemo(
        () => (
            <div className={styles.content}>
                <div className={styles.searchBarContainer}>
                    <div className={styles.searchBarInner}>
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
                                    event: e,
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
                            // @ts-ignore
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

    if (!content) return null;

    return !list?.length ? (
        <div className={styles.content}>
            <div className={styles.noData}>
                <Image
                    src={contentData[content].src}
                    alt='No Data'
                    width={contentData[content].width}
                    height={contentData[content].height}
                    priority
                />

                <div>{contentData[content].description}</div>
            </div>
        </div>
    ) : !filteredList?.length && search?.length ? (
        <div className={styles.content}>
            <div className={styles.searchBarContainer}>
                <div className={styles.searchBarInner}>
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
                Your search for "{search}" did not match any {contentData[content].match}.
            </h2>
        </div>
    ) : (
        contentComponent
    );
};

export default UserLists;
