import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../context/AuthProvider";
import { UserDataProvider } from "../context/UserDataProvider";
import { ComponentsProvider } from "../context/ComponentsProvider";
import PersistLogin from "../hooks/persistLogin";
import Head from "next/head";
import { useRouter } from "next/router";

const App = ({ Component, pageProps }) => {
    const getLayout = Component.getLayout || ((page) => page);
    const router = useRouter();

    return (
        <AuthProvider>
            <PersistLogin>
                <Head>
                    <title>Unthrust</title>
                    <link rel='icon' href='/assets/favicon.ico' />
                </Head>

                <UserDataProvider>
                    <ComponentsProvider>
                        {getLayout(
                            <Component
                                {...pageProps}
                                key={router.asPath}
                            />
                        )}
                    </ComponentsProvider>
                </UserDataProvider>

                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App;
