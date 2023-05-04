// @ts-nocheck

'use client';

import useContextHook from '@/hooks/useContextHook';
import { ReactElement } from 'react';
import Link from 'next/link';

const AuthButton = ({ link }: { link: string }): ReactElement => {
    const { auth } = useContextHook({ context: 'auth' });

    return (
        <Link href={link}>
            {auth?.accessToken
                ? 'Open Chat App'
                : link === 'register'
                ? 'Sign up'
                : 'Login'}
        </Link>
    );
};

export default AuthButton;
