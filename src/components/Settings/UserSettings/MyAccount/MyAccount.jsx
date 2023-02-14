import styles from './MyAccount.module.css';
import mainStyles from '../../Content.module.css';

const MyAccount = () => {
    return (
        <>
            <div>
                <div className={mainStyles.sectionTitle}>
                    <h2 className={mainStyles.titleBig}>My Account</h2>
                </div>
            </div>

            <div className={mainStyles.divider} />

            <div className={mainStyles.section}>
                <div className={mainStyles.sectionTitle}>
                    <h2 className={mainStyles.titleBig}>Password and Authentication</h2>
                </div>
            </div>

            <div className={mainStyles.divider} />

            <div className={mainStyles.section}>
                <div className={mainStyles.sectionTitle}>
                    <h2 className={mainStyles.titleSmall}>Account Removal</h2>
                </div>
            </div>
        </>
    );
}

export default MyAccount;
