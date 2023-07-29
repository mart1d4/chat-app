import styles from './AppNav.module.css';
import NavIcon from './NavIcon';

interface Props {
    user: TCleanUser;
    guilds: TGuild[];
}

const AppNav = ({ user, guilds }: Props) => {
    const chatAppIcon = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M8 9h8' />
            <path d='M8 13h6' />
            <path d='M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z' />
        </svg>
    );

    const addServerIcon = (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
        >
            <path
                fill='currentColor'
                d='M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z'
            />
        </svg>
    );

    const discoverIcon = (
        <svg
            viewBox='0 0 24 24'
            width='24'
            height='24'
        >
            <path
                fill='currentColor'
                d='M12 10.9C11.39 10.9 10.9 11.39 10.9 12C10.9 12.61 11.39 13.1 12 13.1C12.61 13.1 13.1 12.61 13.1 12C13.1 11.39 12.61 10.9 12 10.9ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z'
            />
        </svg>
    );

    return (
        <nav className={styles.nav}>
            <ul className={styles.list}>
                {/* {dmNotifications.map((notification: any) => (
                        <NavIcon
                            key={uuidv4()}
                            name={notification.channel.name}
                            link={`/channels/me/${notification.channel.id}`}
                            src={notification.channel.icon}
                            count={notification.count}
                        />
                    ))} */}

                <NavIcon
                    special={true}
                    name='Direct Messages'
                    link={'/channels/me'}
                    svg={chatAppIcon}
                />

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>

                {guilds?.map((guild: TGuild) => (
                    <NavIcon
                        key={guild.id}
                        name={guild.name}
                        guild={guild}
                        link={`/channels/${guild.id}`}
                        src={guild.icon ? `${process.env.NEXT_PUBLIC_CDN_URL}/${guild.icon}/` : undefined}
                        count={0}
                    />
                ))}

                <NavIcon
                    green={true}
                    name='Add a Server'
                    link={'/channels/add'}
                    svg={addServerIcon}
                    count={0}
                />

                <NavIcon
                    green={true}
                    name='Discover Servers'
                    link={'/channels/discover'}
                    svg={discoverIcon}
                    count={0}
                />
            </ul>
        </nav>
    );
};

export default AppNav;
