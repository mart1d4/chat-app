import { isLoggedIn } from '@/lib/auth';
import Link from 'next/link';

const AuthButton = async ({ link }: { link: string }) => {
    const isLogged = await isLoggedIn();

    return <Link href={link}>{isLogged ? 'Open Chat App' : link === 'register' ? 'Sign up' : 'Login'}</Link>;
};

export default AuthButton;
