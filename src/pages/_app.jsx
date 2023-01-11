import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../context/AuthProvider";
import PersistLogin from "../hooks/persistLogin";

const App = ({ Component, pageProps }) => {
    const getLayout = Component.getLayout || ((page) => page)

    return (
        <AuthProvider>
            <PersistLogin>
                {getLayout(<Component {...pageProps} />)}
                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App;
