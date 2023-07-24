'use client';

import { useEffect, useState, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './AddFriend.module.css';
import Image from 'next/image';

const AddFriend = () => {
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [valid, setValid] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const { setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { sendRequest } = useFetchHelper();

    const inputRef = useRef<HTMLInputElement>(null);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        setInput((prev) => prev + text);
        inputRef.current?.focus();
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (error.length > 0) setValid('');
        if (valid.length > 0) setError('');
    }, [error, valid]);

    return (
        <div className={styles.content}>
            <header className={styles.header}>
                <h2>Add Friend</h2>

                <form autoComplete='off'>
                    <div className={styles.description}>You can add friends with their Chat App username.</div>

                    <div
                        className={styles.inputWrapper}
                        style={{
                            outline:
                                error.length > 0
                                    ? '1px solid var(--error-1)'
                                    : valid.length > 0
                                    ? '1px solid var(--success-1)'
                                    : '',
                        }}
                    >
                        <div>
                            <input
                                ref={inputRef}
                                type='text'
                                autoComplete='off'
                                placeholder='You can add friends with their Chat App username.'
                                aria-label='username'
                                minLength={2}
                                maxLength={32}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError('');
                                    setValid('');
                                }}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        if (!input.length || loading) {
                                            inputRef.current?.focus();
                                            return;
                                        }

                                        setLoading(true);

                                        const res = await sendRequest({
                                            query: 'ADD_FRIEND',
                                            params: { username: input },
                                        });

                                        if (!res.success) setError(res.message);
                                        else {
                                            setValid(res.message);
                                            setInput('');
                                        }

                                        setLoading(false);
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setFixedLayer({
                                        type: 'menu',
                                        menu: 'INPUT',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        input: true,
                                        pasteText,
                                    });
                                }}
                            />
                        </div>

                        <button
                            className={input.length > 0 ? 'blue' : 'blue disabled'}
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!input.length || loading) {
                                    inputRef.current?.focus();
                                    return;
                                }

                                setLoading(true);

                                const res = await sendRequest({
                                    query: 'ADD_FRIEND',
                                    params: { username: input },
                                });

                                if (!res.success) setError(res.message);
                                else {
                                    setValid(res.message);
                                    setInput('');
                                }

                                setLoading(false);
                            }}
                        >
                            Send Friend Request
                        </button>
                    </div>

                    {error.length > 0 && <div className={styles.error}>{error}</div>}

                    {valid.length > 0 && <div className={styles.valid}>{valid}</div>}
                </form>
            </header>

            <div className={styles.content}>
                <div className={styles.noData}>
                    <Image
                        src='https://ucarecdn.com/7b76d926-7e1b-4491-84c8-7074c4def321/'
                        alt='Add Friend'
                        width={376}
                        height={162}
                        priority
                    />

                    <div>Wumpus is waiting on friends. You don't have to though!</div>
                </div>
            </div>
        </div>
    );
};

export default AddFriend;
