import { redirect } from 'next/navigation';
import styles from '../Auth.module.css';
import { isLoggedIn } from '@/lib/auth';
import Form from './Form';

const LoginPage = async () => {
    const isLogged = await isLoggedIn();

    if (isLogged) {
        redirect('/channels/me');
    }

    return (
        <div className={styles.wrapper}>
            <form>
                <div className={styles.loginContainer}>
                    <div className={styles.header}>
                        <h1>Welcome back!</h1>
                        <div>We're so excited to see you again!</div>
                    </div>

                    <Form />
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
