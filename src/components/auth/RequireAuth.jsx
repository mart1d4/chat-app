import { useLocation, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function RequireAuth() {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        !auth?.accessToken &&
            <Navigate
                to={{ pathname: '/login', state: { from: location } }}
            />
    );
}
