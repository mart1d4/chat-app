import styles from '../../Content.module.css';
import useAuth from '../../../../hooks/useAuth';
import Image from 'next/image';
import { AvatarStatus, Tooltip } from '../../../../../src/components/';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Profiles = ({ setActiveTab }) => {
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
                            onClick={() => setActiveTab('Profiles')}
                        >
                            Edit User Profile
                        </button>
                    </div>

                    <div>
                        <div className={styles.field}>
                            <div>
                                <h3>
                                    Username
                                </h3>
                                <div>
                                    {auth?.user?.username}
                                </div>
                            </div>
                            <button>
                                Edit
                            </button>
                        </div>

                        <div className={styles.field}>
                            <div>
                                <h3>
                                    Email
                                </h3>
                                <div>
                                    {auth?.user?.email || 'Not set'}
                                </div>
                            </div>
                            <button>
                                Edit
                            </button>
                        </div>

                        <div className={styles.field}>
                            <div>
                                <h3>
                                    Phone Number
                                </h3>
                                <div>
                                    {auth?.user?.phone || 'Not set'}
                                </div>
                            </div>
                            <button>
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <h2 className={styles.titleBig}>Password and Authentication</h2>
                </div>

                <button className={styles.passwordButton}>
                    Change Password
                </button>
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

                    <button>
                        Delete Account
                    </button>
                </div>
            </div>
        </>
    );
}

export default Profiles;
