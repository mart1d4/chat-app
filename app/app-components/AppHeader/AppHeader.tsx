'use client';

import { useState, useRef, useMemo, useEffect, ReactElement } from 'react';
import { Icon, Avatar } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import styles from './AppHeader.module.css';
import { v4 as uuidv4 } from 'uuid';

const AppHeader = ({ channel }: { channel?: ChannelType }): ReactElement => {
    const [friend, setFriend] = useState<undefined | CleanOtherUserType>();

    const { auth }: any = useContextHook({ context: 'auth' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { userSettings, setUserSettings }: any = useContextHook({ context: 'settings' });
    const { setUserProfile, fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });

    const requestNumber: number = auth.user.requestReceivedIds.length;

    useEffect(() => {
        if (!channel) return;

        if (channel.type === 'DM') {
            setFriend(
                channel.recipients.find((user: CleanOtherUserType) => user.id !== auth.user.id)
            );
        }
    }, [channel]);

    const tabs = [
        { name: 'Online', func: 'online' },
        { name: 'All', func: 'all' },
        { name: 'Pending', func: 'pending' },
        { name: 'Blocked', func: 'blocked' },
        { name: 'Add Friend', func: 'add' },
    ];

    const toolbarItems = channel
        ? [
              { name: 'Start Voice Call', icon: 'call', func: () => {} },
              { name: 'Start Video Call', icon: 'video', func: () => {} },
              {
                  name: 'Pinned Messages',
                  icon: 'pin',
                  //   @ts-ignore
                  func: (e, element) => {
                      if (fixedLayer?.element === element) {
                          setFixedLayer(null);
                          return;
                      }
                      setFixedLayer({
                          type: 'popout',
                          event: e,
                          firstSide: 'bottom',
                          secondSide: 'left',
                          element: element,
                          gap: 10,
                          channel: channel,
                          pinned: true,
                      });
                  },
              },
              {
                  name: 'Add Friends to DM',
                  icon: 'addUser',
                  //   @ts-ignore
                  func: (e, element) => {
                      if (fixedLayer?.element === element) {
                          setFixedLayer(null);
                      } else {
                          setFixedLayer({
                              type: 'popout',
                              event: e,
                              gap: 10,
                              element: element,
                              firstSide: 'bottom',
                              secondSide: 'right',
                              channel: channel,
                          });
                      }
                  },
              },
              {
                  name:
                      channel?.type === 'DM'
                          ? userSettings?.showUsers
                              ? 'Hide User Profile'
                              : 'Show User Profile'
                          : userSettings?.showUsers
                          ? 'Hide Member List'
                          : 'Show Member List',
                  icon: channel?.type === 'DM' ? 'userProfile' : 'memberList',
                  iconFill: userSettings?.showUsers && 'var(--foreground-1)',
                  func: () =>
                      setUserSettings({ ...userSettings, showUsers: !userSettings?.showUsers }),
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
                                        {tab.name === 'Pending' && requestNumber > 0 && (
                                            <div className={styles.badge}>{requestNumber}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div className={styles.icon}>
                                <Avatar
                                    src={channel.icon as string}
                                    alt={channel.name}
                                    size={24}
                                    status={channel.type === 'DM' ? friend?.status : undefined}
                                />
                            </div>

                            <h1
                                className={styles.titleFriend}
                                onMouseEnter={(e) => {
                                    if (channel.type !== 'DM') return;
                                    setTooltip({
                                        text: channel.name,
                                        element: e.currentTarget,
                                        position: 'bottom',
                                        gap: 5,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    if (channel.type !== 'DM') return;
                                    setUserProfile({ user: friend });
                                }}
                            >
                                {channel.name}
                            </h1>
                        </>
                    )}
                </div>

                <div className={styles.toolbar}>
                    {toolbarItems.map((item) => (
                        <ToolbarIcon
                            key={uuidv4()}
                            item={item}
                        />
                    ))}

                    {!channel ? (
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
                                    fill='var(--foreground-4)'
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
                                position: 'bottom',
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <Icon name='inbox' />
                    </div>
                </div>
            </div>
        ),
        [channel, userSettings]
    );
};

const ToolbarIcon = ({ item }: any) => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const element = useRef(null);

    return (
        <div
            ref={element}
            className={styles.toolbarIcon}
            onMouseEnter={(e) =>
                setTooltip({
                    text: item.name,
                    element: e.currentTarget,
                    position: 'bottom',
                })
            }
            onMouseLeave={() => setTooltip(null)}
            onClick={(e) => item.func(e, element.current)}
        >
            <Icon
                name={item.icon}
                fill={item?.iconFill && item.iconFill}
            />
        </div>
    );
};

export default AppHeader;
