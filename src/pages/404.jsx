import Link from 'next/link';

const Custom404 = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>

            <p>
                <Link href="/dashboard">
                    Go back home
                </Link>
            </p>
        </div>
    );
}

export default Custom404;
