import styles from '../../Content.module.css';
import useAuth from '../../../../hooks/useAuth';
import Image from 'next/image';
import { AvatarStatus, Tooltip } from '../../../../../src/components/';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

const MyAccount = ({ setActiveTab }) => {
    const [tooltip, setTooltip] = useState({
        show: false,
        text: 'Copy user ID',
        success: false,
    });

    const { auth } = useAuth();
    const router = useRouter();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(auth?.user?.id);
        setTooltip({
            ...tooltip,
            text: 'Copied!',
            success: true,
        });

        setTimeout(() => {
            setTooltip({
                ...tooltip,
                show: false,
                text: 'Copy user ID',
                success: false,
            });
        }, 2000);
    };

    const fields = [
        { title: 'Username', value: auth?.user?.username },
        { title: 'Email', value: auth?.user?.email || 'Not set' },
        { title: 'Phone Number', value: auth?.user?.phone || 'Not set' },
    ];

    return (
        <>
            <div>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>My Account</h2>
                </div>

                <div className={styles.userCard}>
                    <div
                        className={styles.userCardHeader}
                        style={{
                            backgroundColor: auth?.user?.accentColor,
                        }}
                    />

                    <div className={styles.userCardInfo}>
                        <div className={styles.userAvatar}>
                            <Image
                                src={auth?.user?.avatar}
                                alt="User Avatar"
                                width={80}
                                height={80}
                            />

                            <AvatarStatus
                                status={auth?.user?.status}
                                background="var(--background-2)"
                                mid
                            />
                        </div>

                        <div
                            className={styles.username}
                            onMouseEnter={() => setTooltip({
                                ...tooltip,
                                show: true,
                            })}
                            onMouseLeave={() => setTooltip({
                                ...tooltip,
                                show: false,
                            })}
                            onClick={() => copyToClipboard()}
                        >
                            {auth?.user?.username}

                            <Tooltip
                                show={tooltip?.show}
                                pos="top"
                                background={tooltip?.success ? 'var(--success-light)' : null}
                            >
                                {tooltip?.text}
                            </Tooltip>
                        </div>

                        <button
                            className="blue"
                            onClick={() => setActiveTab('Profiles')}
                        >
                            Edit User Profile
                        </button>
                    </div>

                    <div>
                        {fields.map((field) => (
                            <div className={styles.field} key={uuidv4()}>
                                <div>
                                    <h3>{field.title}</h3>
                                    <div>{field.value}</div>
                                </div>

                                <button className="grey">
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>Password and Authentication</h2>
                </div>

                <button className="red" style={{ marginBottom: "28px" }}>
                    Change Password
                </button>

                <h2 className={styles.titleSmall}>SMS Backup Authentication</h2>
                <div className={styles.accountRemoval}>
                    <div>
                        Add your phone as a backup 2FA method in case you lose your authentication app or backup codes. Your current phone number is 0001.
                    </div>

                    <div className={styles.buttonsContainer}>
                        <button className="blue">
                            Enable SMS Authentication
                        </button>

                        <button className="underline">
                            Change phone number
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleSmall}>Account Removal</h2>
                </div>

                <div className={styles.accountRemoval}>
                    <div>
                        Deleting your account will remove all of your data from our servers. This action is irreversible.
                    </div>

                    <button className="red">
                        Delete Account
                    </button>
                </div>
            </div>
        </>
    );
}

export default MyAccount;
