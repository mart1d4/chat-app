'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { useRef, useState, useEffect, ReactElement, MouseEvent } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';
import { axiosPrivate } from '../axios';
import styles from '../Auth.module.css';

const Form = (): ReactElement => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [uid, setUID] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const uidInputRef = useRef<HTMLInputElement>(null);
    const router: AppRouterInstance = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                handleSubmit(e as unknown as MouseEvent);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [uid, password, isLoading]);

    useEffect(() => {
        if (auth?.accessToken) router.push('/channels/@me');
    }, [auth]);

    useEffect(() => {
        uidInputRef.current?.focus();
    }, []);

    useEffect(() => {
        setError('');
    }, [uid, password]);

    const handleSubmit = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();

        if (isLoading || !uid || !password) return;
        setIsLoading(true);

        const response = await axiosPrivate.post('/auth/login', {
            uid: uid,
            password: password,
        });

        if (!response.data.success) {
            setError(response.data.message || 'An error occurred');
            setIsLoading(false);
        } else {
            setAuth({
                accessToken: response.data.accessToken,
                user: response.data.user,
            });

            setUID('');
            setPassword('');
            setIsLoading(false);
            router.push('/channels/@me');
        }
    };

    return (
        <div className={styles.loginBlock}>
            <div>
                <label
                    htmlFor='uid'
                    style={{
                        color: error.length
                            ? 'var(--error-light)'
                            : 'var(--foreground-3)',
                    }}
                >
                    Email or Username
                    {error.length ? (
                        <span className={styles.errorLabel}>- {error}</span>
                    ) : (
                        <span>*</span>
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
                        spellCheck='false'
                        aria-labelledby='uid'
                        aria-describedby='uid'
                        value={uid}
                        onChange={(e) => setUID(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ marginBottom: 0 }}>
                <label
                    htmlFor='password'
                    style={{
                        color: error.length
                            ? 'var(--error-light)'
                            : 'var(--foreground-3)',
                    }}
                >
                    Password
                    {error.length ? (
                        <span className={styles.errorLabel}>- {error}</span>
                    ) : (
                        <span>*</span>
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
                        spellCheck='false'
                        aria-labelledby='password'
                        aria-describedby='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button
                className={styles.passwordForgot}
                onClick={(e) => {
                    e.preventDefault();
                    router.push('/forgot-password');
                }}
            >
                Forgot your password?
            </button>
            <button
                type='submit'
                className={styles.buttonSubmit}
                onClick={(e) => handleSubmit(e)}
            >
                <div className={isLoading ? styles.loading : ''}>
                    {!isLoading && 'Log In'}
                </div>
            </button>

            <div className={styles.bottomText}>
                <span>Need an account?</span>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        router.push('/register');
                    }}
                >
                    Register
                </button>
            </div>
        </div>
    );
};

export default Form;
