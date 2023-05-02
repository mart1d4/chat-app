'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { useRef, useState, useEffect, ReactElement } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';
import styles from '../Auth.module.css';
import { axiosPrivate } from '../axios';

const USER_REGEX = /^.{2,32}$/;
const PWD_REGEX = /^.{8,256}$/;

const Register = (): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordMatch, setPasswordMatch] = useState<string>('');

    const [usernameError, setUsernameError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const { auth }: any = useContextHook({ context: 'auth' });
    const uidInputRef = useRef<HTMLInputElement>(null);
    const router: AppRouterInstance = useRouter();

    useEffect(() => {
        uidInputRef.current?.focus();
    }, []);

    useEffect(() => {
        uidInputRef.current?.focus();
    }, [usernameError]);

    useEffect(() => {
        setUsernameError('');
    }, [username]);

    useEffect(() => {
        setPasswordError('');
    }, [password, passwordMatch]);

    const handleSubmit = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const v1: boolean = USER_REGEX.test(username);
        const v2: boolean = PWD_REGEX.test(password);

        if (!v1) {
            setUsernameError('Invalid Username');
            setIsLoading(false);
        }
        if (!v2) {
            setPasswordError('Invalid Password');
            setIsLoading(false);
        }
        if (!v1 || !v2) return;

        if (password !== passwordMatch) {
            setPasswordError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const response = await axiosPrivate.post('/auth/register', {
            username: username,
            password: password,
        });

        if (!response.data.success) {
            if (response.data.message.includes('Username')) {
                setUsernameError(response.data.message);
            } else if (response.data.message.includes('Password')) {
                setPasswordError(response.data.message);
            } else {
                setUsernameError(response.data.message);
                setPasswordError(response.data.message);
            }
            setIsLoading(false);
        } else {
            setUsername('');
            setPassword('');
            setPasswordMatch('');
            setIsLoading(false);
            router.push('/login');
        }
    };

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor='uid'
                    style={{
                        color: usernameError.length
                            ? 'var(--error-light)'
                            : 'var(--foreground-3)',
                    }}
                >
                    Username
                    {usernameError.length > 0 && (
                        <span className={styles.errorLabel}>
                            - {usernameError}
                        </span>
                    )}
                </label>
                <div className={styles.inputContainer}>
                    <input
                        ref={uidInputRef}
                        id='uid'
                        type='text'
                        name='username'
                        aria-label='Username'
                        autoCapitalize='off'
                        autoComplete='off'
                        autoCorrect='off'
                        minLength={2}
                        maxLength={32}
                        spellCheck='false'
                        aria-labelledby='uid'
                        aria-describedby='uid'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor='password'
                    style={{
                        color: passwordError.length
                            ? 'var(--error-light)'
                            : 'var(--foreground-3)',
                    }}
                >
                    Password
                    {passwordError.length > 0 && (
                        <span className={styles.errorLabel}>
                            - {passwordError}
                        </span>
                    )}
                </label>
                <div className={styles.inputContainer}>
                    <input
                        id='password'
                        type='password'
                        name='password'
                        aria-label='Password'
                        autoCapitalize='off'
                        autoComplete='off'
                        autoCorrect='off'
                        maxLength={256}
                        spellCheck='false'
                        aria-labelledby='password'
                        aria-describedby='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor='password-match'
                    style={{
                        color: passwordError.length
                            ? 'var(--error-light)'
                            : 'var(--foreground-3)',
                    }}
                >
                    Password Match
                    {passwordError.length > 0 && (
                        <span className={styles.errorLabel}>
                            - {passwordError}
                        </span>
                    )}
                </label>
                <div className={styles.inputContainer}>
                    <input
                        id='password-match'
                        type='password'
                        name='password-match'
                        aria-label='Password Match'
                        autoCapitalize='off'
                        autoComplete='off'
                        autoCorrect='off'
                        maxLength={256}
                        spellCheck='false'
                        aria-labelledby='password-match'
                        aria-describedby='password-match'
                        value={passwordMatch}
                        onChange={(e) => setPasswordMatch(e.target.value)}
                    />
                </div>
            </div>

            <button
                type='submit'
                className={styles.buttonSubmit}
                onClick={() => handleSubmit}
            >
                <div className={isLoading ? styles.loading : ''}>
                    {!isLoading && 'Register'}
                </div>
            </button>

            <div className={styles.bottomText}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        router.push('/login');
                    }}
                >
                    Already have an account?
                </button>
            </div>
        </div>
    );
};

export default Register;