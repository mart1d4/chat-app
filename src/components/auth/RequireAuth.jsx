import useAuth from '../../hooks/useAuth';
import { useRouter } from 'next/router';

export default function RequireAuth() {
    const { auth } = useAuth();
    const router = useRouter();

    return (
        !auth?.accessToken && router.push('/login')
    );
}
