import styles from '../Auth.module.css';
import { ReactElement } from 'react';
import Form from './Form';

const LoginPage = (): ReactElement => {
    return (
        <div className={styles.wrapper}>
            <img
                src='/assets/auth-background.svg'
                alt=''
                draggable='false'
            />

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
