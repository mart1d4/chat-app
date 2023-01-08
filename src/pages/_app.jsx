import '../styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '../context/AuthProvider';
import PersistLogin from '../hooks/persistLogin';

const App = ({ Component, pageProps }) => {
    return (
        <AuthProvider>
            <PersistLogin>
                <Component {...pageProps} />
                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App
