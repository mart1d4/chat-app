import Head from 'next/head';
import Calculator from '../components/Calculator';

const Main = () => {
    return (
        <>
            <Head>
                <title>Calculator</title>
                <link rel='icon' href='/favicon.svg' />
            </Head>
            <Calculator />
        </>
    )
}

export default Main