import { redirect } from 'next/navigation';
import styles from '../Auth.module.css';
import { isLoggedIn } from '@/lib/auth';
import Form from './Form';

const Register = async () => {
    const isLogged = await isLoggedIn();

    if (isLogged) {
        redirect('/channels/me');
    }

    return (
        <div className={styles.wrapper}>
            <form>
                <div className={styles.loginContainer}>
                    <div className={styles.header}>
                        <h1>Create an account</h1>
                    </div>

                    <Form />
                </div>
            </form>
        </div>
    );
};

export default Register;
