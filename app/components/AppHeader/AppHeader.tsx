'use client';

import { useState, useMemo, useEffect, ReactElement } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { useLayers, useTooltip } from '@/lib/store';
import styles from './AppHeader.module.css';
import { Icon, Avatar } from '@components';

interface Props {
    channel?: TChannel;
    friend?: TCleanUser | null;
}

export const AppHeader = ({ channel, friend }: Props): ReactElement => {
    const [widthLimitPassed, setWidthLimitPassed] = useState<boolean>(false);

    const { userSettings, setUserSettings }: any = useContextHook({ context: 'settings' });
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);

    useEffect(() => {
        const width: number = window.innerWidth;

        if (width >= 1200) setWidthLimitPassed(true);
        else setWidthLimitPassed(false);

        const handleResize = () => {
            const width: number = window.innerWidth;

            if (width >= 1200) setWidthLimitPassed(true);
            else setWidthLimitPassed(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { name: 'Online', func: 'online' },
        { name: 'All', func: 'all' },
        { name: 'Pending', func: 'pending' },
        { name: 'Blocked', func: 'blocked' },
        { name: 'Add Friend', func: 'add' },
    ];

    const badgeCount = 900;

    const toolbarItems = channel
        ? channel?.guildId
            ? [
                  {
                      name: 'Threads',
                      icon: 'threads',
                      func: {},
                  },
                  {
                      name: 'Notification Settings',
                      icon: 'bell',
                      func: {},
                  },
                  {
                      name: 'Pinned Messages',
                      icon: 'pin',
                      func: (e: MouseEvent) => {
                          if (!channel) return;
                          setLayers({
                              settings: {
                                  type: 'POPUP',
                                  element: e.currentTarget,
                                  firstSide: 'BOTTOM',
                                  secondSide: 'LEFT',
                                  gap: 10,
                              },
                              content: {
                                  type: 'PINNED_MESSAGES',
                                  channel: channel,
                              },
                          });
                      },
                  },
                  {
                      name:
                          userSettings.showUsers && widthLimitPassed
                              ? 'Hide User Profile'
                              : `Show ${channel?.type === 0 ? ' User Profile' : 'Member List'}`,
                      icon: channel?.type === 0 ? 'userProfile' : 'memberList',
                      active: userSettings.showUsers,
                      disabled: widthLimitPassed === false,
                      func: () => {
                          if (!channel) return;
                          setUserSettings({ ...userSettings, showUsers: !userSettings?.showUsers });
                      },
                  },
              ]
            : [
                  { name: 'Start Voice Call', icon: 'call', func: () => {} },
                  { name: 'Start Video Call', icon: 'video', func: () => {} },
                  {
                      name: 'Pinned Messages',
                      icon: 'pin',
                      func: (e: MouseEvent) => {
                          if (!channel) return;
                          setLayers({
                              settings: {
                                  type: 'POPUP',
                                  element: e.currentTarget,
                                  firstSide: 'BOTTOM',
                                  secondSide: 'LEFT',
                                  gap: 10,
                              },
                              content: {
                                  type: 'PINNED_MESSAGES',
                                  channel: channel,
                              },
                          });
                      },
                  },
                  {
                      name: 'Add Friends to DM',
                      icon: 'addUser',
                      func: (e: MouseEvent) => {
                          if (!channel) return;
                          setLayers({
                              settings: {
                                  type: 'POPUP',
                                  element: e.currentTarget,
                                  firstSide: 'BOTTOM',
                                  secondSide: 'RIGHT',
                                  gap: 10,
                              },
                              content: {
                                  type: 'CREATE_DM',
                                  channel: channel,
                              },
                          });
                      },
                  },
                  {
                      name:
                          userSettings.showUsers && widthLimitPassed
                              ? 'Hide User Profile'
                              : `Show ${channel?.type === 0 ? ' User Profile' : 'Member List'}`,
                      icon: channel?.type === 0 ? 'userProfile' : 'memberList',
                      active: userSettings.showUsers,
                      disabled: widthLimitPassed === false,
                      func: () => {
                          if (!channel) return;
                          setUserSettings({ ...userSettings, showUsers: !userSettings?.showUsers });
                      },
                  },
              ]
        : [{ name: 'New Group DM', icon: 'newDM', func: () => {} }];

    return useMemo(
        () => (
            <div className={styles.header}>
                <div className={styles.nav}>
                    {!channel ? (
                        <>
                            <div className={styles.icon}>
                                <Icon
                                    name='friends'
                                    fill='var(--foreground-5)'
                                />
                            </div>
                            <h1 className={styles.title}>Friends</h1>
                            <div className={styles.divider}></div>
                            <ul className={styles.list}>
                                {tabs.map((tab, index) => (
                                    <li
                                        key={index}
                                        onClick={() =>
                                            setUserSettings({
                                                ...userSettings,
                                                friendTab: tab.func,
                                            })
                                        }
                                        className={
                                            tab.name === 'Add Friend'
                                                ? userSettings?.friendTab === tab.func
                                                    ? styles.itemAddActive
                                                    : styles.itemAdd
                                                : userSettings?.friendTab === tab.func
                                                ? styles.itemActive
                                                : styles.item
                                        }
                                    >
                                        {tab.name}
                                        {tab.name === 'Pending' && badgeCount > 0 && (
                                            <div className={styles.badge}>{badgeCount}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div className={styles.icon}>
                                {channel?.guildId ? (
                                    <Icon name='hashtag' />
                                ) : (
                                    <Avatar
                                        src={channel.icon || ''}
                                        relativeSrc={!channel}
                                        alt={channel.name || ''}
                                        size={24}
                                        status={friend ? friend.status : undefined}
                                    />
                                )}
                            </div>

                            <h1
                                className={styles.titleFriend}
                                onMouseEnter={(e) => {
                                    if (channel?.guildId) return;
                                    setTooltip({
                                        text: channel.name || '',
                                        element: e.currentTarget,
                                        position: 'BOTTOM',
                                        gap: 5,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    if (channel?.type !== 0) return;
                                    setLayers({
                                        settings: {
                                            type: 'USER_PROFILE',
                                        },
                                        content: {
                                            user: friend,
                                        },
                                    });
                                }}
                                style={{
                                    cursor: channel?.guildId ? 'default' : '',
                                }}
                            >
                                {channel?.name || ''}
                            </h1>
                        </>
                    )}
                </div>

                <div className={styles.toolbar}>
                    {toolbarItems.map((item) => (
                        <ToolbarIcon
                            key={item.name}
                            item={item}
                        />
                    ))}

                    {typeof channel === 'undefined' ? (
                        <div className={styles.divider} />
                    ) : (
                        <div className={styles.search}>
                            <div
                                role='combobox'
                                aria-expanded='false'
                                aria-haspopup='listbox'
                                aria-label='Search'
                                autoCorrect='off'
                            >
                                Search
                            </div>

                            <div>
                                <Icon
                                    name='search'
                                    size={16}
                                />
                            </div>
                        </div>
                    )}

                    <div
                        className={styles.toolbarIcon}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: 'Inbox',
                                element: e.currentTarget,
                                position: 'BOTTOM',
                                gap: 5,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <Icon name='inbox' />
                    </div>

                    <a
                        href='/en-US/support'
                        className={styles.toolbarIcon}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: 'Help',
                                element: e.currentTarget,
                                position: 'BOTTOM',
                                gap: 5,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <Icon name='help' />
                    </a>
                </div>
            </div>
        ),
        [channel, friend, badgeCount, userSettings, widthLimitPassed]
    );
};

const ToolbarIcon = ({ item }: any) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    return (
        <div
            className={`${styles.toolbarIcon} ${item.disabled && styles.disabled}`}
            onMouseEnter={(e) => {
                if (layers?.POPUP?.settings?.element === e.currentTarget) return;
                setTooltip({
                    text: item.disabled ? item.name + ' (Unavailable)' : item.name,
                    element: e.currentTarget,
                    position: 'BOTTOM',
                    gap: 5,
                });
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={(e) => {
                if (item.disabled) return;
                if (layers?.POPUP?.settings?.element === e.currentTarget) {
                    setTooltip({
                        text: item.disabled ? item.name + ' (Unavailable)' : item.name,
                        element: e.currentTarget,
                        position: 'BOTTOM',
                        gap: 5,
                    });
                    setLayers({
                        settings: {
                            type: 'POPUP',
                            setNull: true,
                        },
                    });
                } else {
                    setTooltip(null);
                    item.func(e);
                }
            }}
        >
            <Icon
                name={item.icon}
                fill={item.active && !item.disabled && 'var(--foreground-2)'}
            />
        </div>
    );
};
