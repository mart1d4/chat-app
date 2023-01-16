import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../context/AuthProvider";
import PersistLogin from "../hooks/persistLogin";
import Head from "next/head";

const App = ({ Component, pageProps }) => {
    const getLayout = Component.getLayout || ((page) => page)

    return (
        <>
            <Head>
                <title>Discord | Your Place to Talk and to Hang Out</title>
                <link rel='icon' href='/images/favicon.svg' />
            </Head>
            <AuthProvider>
                <PersistLogin>
                    {getLayout(<Component {...pageProps} />)}
                    <Analytics />
                </PersistLogin>
            </AuthProvider>
        </>
    );
};

export default App;
