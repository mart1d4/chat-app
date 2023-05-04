import styles from '../Auth.module.css';
import { ReactElement } from 'react';
import Form from './Form';

const Register = (): ReactElement => {
    return (
        <div className={styles.wrapper + ' ' + styles.wrapperRegister}>
            <img
                src='/assets/auth-background.svg'
                alt=''
                draggable='false'
            />

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
