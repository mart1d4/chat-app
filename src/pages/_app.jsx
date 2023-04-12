import "../styles/global.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "../context/AuthProvider";
import { UserDataProvider } from "../context/UserDataProvider";
import { ComponentsProvider } from "../context/ComponentsProvider";
import { UserSettingsProvider } from "../context/UserSettingsProvider";
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
                    <title>Discord</title>
                    <link rel='icon' href='/assets/favicon.ico' />
                </Head>

                <UserSettingsProvider>
                    <UserDataProvider>
                        <ComponentsProvider>
                            {getLayout(
                                <Component
                                    {...pageProps}
                                // key={router.asPath}
                                />
                            )}
                        </ComponentsProvider>
                    </UserDataProvider>
                </UserSettingsProvider>

                <Analytics />
            </PersistLogin>
        </AuthProvider>
    );
};

export default App;
