'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { useRef, useState, useEffect, ReactElement, MouseEvent } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { LoadingDots } from '../app-components';
import { useRouter } from 'next/navigation';
import styles from '../Auth.module.css';
import Link from 'next/link';

const USER_REGEX = /^.{2,32}$/;
const PWD_REGEX = /^.{8,256}$/;

const Register = (): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordMatch, setPasswordMatch] = useState<string>('');

    const [usernameError, setUsernameError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');

    const uidInputRef = useRef<HTMLInputElement>(null);
    const router: AppRouterInstance = useRouter();
    const { auth, loading }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (loading) return;
        if (auth?.accessToken) {
            router.push('/channels/me');
        }
    }, [loading]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                handleSubmit(e as unknown as MouseEvent);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [username, password, passwordMatch, isLoading]);

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

        if (isLoading || !username || !password || !passwordMatch) return;
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

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        }).then((res) => res.json());

        if (!response.success) {
            if (response.message.includes('Username')) {
                setUsernameError(response.message);
            } else if (response.message.includes('Password')) {
                setPasswordError(response.message);
            } else {
                setUsernameError(response.message);
                setPasswordError(response.message);
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
                        color: usernameError.length ? 'var(--error-light)' : 'var(--foreground-3)',
                    }}
                >
                    Username
                    {usernameError.length > 0 && (
                        <span className={styles.errorLabel}>- {usernameError}</span>
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
                        color: passwordError.length ? 'var(--error-light)' : 'var(--foreground-3)',
                    }}
                >
                    Password
                    {passwordError.length > 0 && (
                        <span className={styles.errorLabel}>- {passwordError}</span>
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
                        color: passwordError.length ? 'var(--error-light)' : 'var(--foreground-3)',
                    }}
                >
                    Password Match
                    {passwordError.length > 0 && (
                        <span className={styles.errorLabel}>- {passwordError}</span>
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
                onClick={(e) => handleSubmit(e)}
            >
                {isLoading ? <LoadingDots /> : 'Register'}
            </button>

            <div className={styles.bottomText}>
                <Link href='/login'>Already have an account?</Link>
            </div>
        </div>
    );
};

export default Register;
