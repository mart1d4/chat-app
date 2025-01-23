import { Icon, LoadingDots } from "@components";
import styles from "./invite.module.css";
import { jwtVerify } from "jose";
import { db } from "@/lib/db/db";
import Link from "next/link";

const { API_URL, EMAIL_TOKEN_SECRET } = process.env;

const invalid = (
    <div className={styles.container}>
        <div className={styles.logo}></div>

        <div className={styles.card}>
            <img
                alt="Invite Invalid"
                src="/assets/system/poop.svg"
            />

            <h1>Invite Invalid</h1>

            <p>This invite may be expired, or you might not have permission to join.</p>

            <Link
                href="/login"
                className="button blue"
            >
                Continue to Spark
            </Link>

            <Link
                href="/help/invite"
                className={styles.help}
            >
                Why is my invite invalid?
            </Link>
        </div>
    </div>
);

const waiting = (
    <div className={styles.container}>
        <div className={styles.logo}></div>

        <div className={styles.card}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 143 89"
                height="100"
            >
                <g
                    fill="none"
                    fillRule="evenodd"
                >
                    <g fill="#acb0ff">
                        <path d="m28.481 38.062 8.381 6.599-8.381-6.6z" />
                        <path d="m113.2437 40.602-8.657 6.806c-.037.039-.083.065-.125.098l-.6.471-16.168 12.709c-1.019.801-1.018 2.346.003 3.146l16.165 12.67 9.383 7.356c.656.515 1.617.047 1.617-.787v-41.683c0-.834-.962-1.302-1.618-.786m-42.3819 12.5761-37.543 29.428c-1.497 1.173-.667 3.574 1.233 3.574h72.62c1.9 0 2.729-2.401 1.234-3.574zm-42.3828 30.6797 9.383-7.354 16.141-12.652c1.02-.8 1.021-2.344.003-3.145l-16.144-12.713-9.382-7.387c-.31-.244-.686-.263-.999-.133v43.515c.312.13.688.111.998-.131m42.0611-32.8965c.208-.071.436-.071.644 0-.208-.071-.436-.071-.644 0m-31.6783-4.7255 3.099 2.44z" />
                        <path d="m82.835 60.022-11.355-8.901z" />
                    </g>
                    <path
                        d="m28.481 38.061 8.381 6.6v-2.388-10.298c0-.833-.961-1.301-1.617-.787l-6.762 5.301c-.51.4-.511 1.172-.002 1.572m52.0586-27.2041-9.678-7.586-11.058 8.668c-.748.587-.333 1.787.617 1.787h25.401l-3.878-3.039c-.341.435-.968.511-1.404.17m24.3222 31.7314c0 .835.962 1.303 1.618.786l6.761-5.313c.51-.402.509-1.173-.001-1.574l-6.761-5.299c-.657-.514-1.617-.046-1.617.788z"
                        fill="#7b80d6"
                    />
                    <path
                        d="m38.8618 42.2729v3.963l3.099 2.44 14.431 11.364c.724.57 1.745.571 2.471.003l11.382-8.922c.091-.071.191-.124.295-.16.209-.071.436-.071.644 0 .105.036.205.089.295.16l11.356 8.901c.725.568 1.745.567 2.469-.002l17.558-13.801v-30.493h-64z"
                        fill="#fff"
                    />
                    <path
                        d="m26.8618 83.0707v-41.679c0-.439.27-.772.619-.918.314-.13.69-.111 1 .133l9.381 7.387 16.145 12.713c1.018.802 1.016 2.345-.004 3.145l-16.141 12.652-9.383 7.354c-.31.242-.685.261-.998.131-.349-.146-.619-.479-.619-.918zm8.383-51.883c.657-.513 1.617-.046 1.617.787v10.298 2.388l-8.381-6.599v-.001c-.509-.4-.508-1.172.002-1.572zm67.617-15.462v30.493l-17.558 13.801c-.724.57-1.744.571-2.469.002l-11.356-8.901c-.09-.071-.19-.124-.295-.159-.208-.072-.435-.072-.644 0-.104.035-.204.088-.295.159l-11.382 8.922c-.726.568-1.747.567-2.471-.003l-14.431-11.364-3.099-2.44v-3.963-26.547zm3.617 15.462v.001l6.761 5.299c.51.4.511 1.172.001 1.573l-6.761 5.314c-.656.516-1.618.049-1.618-.786v-10.613c0-.834.96-1.301 1.617-.788zm8.383 51.883c0 .834-.961 1.302-1.617.787l-9.383-7.355-16.166-12.67c-1.021-.801-1.021-2.346-.002-3.147l16.168-12.709.6-.47c.042-.034.088-.06.125-.099l8.657-6.806c.656-.515 1.618-.048 1.618.786zm-7.69 3.109h-72.62c-1.9 0-2.73-2.401-1.233-3.574l37.543-29.428 37.544 29.428c1.495 1.173.666 3.574-1.234 3.574zm9.679-48.981c-.002-.035-.008-.067-.013-.102-.017-.089-.044-.172-.082-.253-.012-.025-.02-.05-.034-.074-.058-.1-.134-.188-.224-.263-.008-.006-.011-.015-.019-.022l-11.617-9.105v-12.654c0-.552-.447-1-1-1h-18.041-25.4c-.951 0-1.365-1.2-.618-1.787l11.059-8.668 9.678 7.586c.435.341 1.063.265 1.404-.17.341-.434.265-1.063-.17-1.404l-10.295-8.069c-.362-.285-.872-.285-1.234 0l-14.062 11.021c-1.232.966-2.753 1.491-4.318 1.491h-14.003c-.552 0-1 .448-1 1v8.327c0 2.732-1.255 5.311-3.404 6.996l-8.213 6.436c-.008.007-.011.016-.019.023-.09.074-.166.162-.224.262-.014.024-.021.049-.033.074-.039.081-.066.164-.082.253-.006.035-.012.067-.014.102-.002.025-.011.048-.011.073v49.908c0 .552.448 1 1 1h90c.553 0 1-.448 1-1v-49.908c0-.025-.009-.048-.011-.073zm10.9319-28.4991c.256 0 .512-.098.707-.293l1.183-1.184c.39-.39.39-1.023 0-1.414-.391-.39-1.025-.39-1.414 0l-1.183 1.184c-.391.391-.391 1.024 0 1.414.195.195.451.293.707.293m-5.916 5.916c.256 0 .512-.098.707-.293l1.183-1.183c.39-.39.39-1.023 0-1.414-.391-.39-1.024-.39-1.414 0l-1.183 1.183c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293m6.3916-.2929c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023 0-1.414l-1.183-1.183c-.39-.39-1.023-.39-1.414 0-.39.391-.39 1.024 0 1.414zm-5.916-5.916c.195.195.451.293.707.293s.512-.098.707-.293c.391-.39.391-1.023 0-1.414l-1.183-1.184c-.39-.39-1.023-.39-1.414 0-.39.391-.39 1.024 0 1.414z"
                        fill="#000"
                    />
                    <path
                        d="m1 52.3276c.834 0 1.51.677 1.51 1.51v.001c0 .552.448 1 1 1s1-.448 1-1v-.001c0-.833.676-1.51 1.51-1.51.552 0 1-.447 1-1 0-.552-.448-1-1-1-.834 0-1.51-.676-1.51-1.51 0-.552-.448-1-1-1s-1 .448-1 1c0 .834-.676 1.51-1.51 1.51-.552 0-1 .448-1 1 0 .553.448 1 1 1m124.4898 13.0117c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7"
                        fill="#fff"
                    />
                    <path
                        d="m125.4898 65.3393c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7"
                        fill="#d3d6ed"
                    />
                    <path
                        d="m118.4898 59.3393c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6m0 14c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8"
                        fill="#000"
                    />
                    <path
                        d="m129.652 87.18 6-10.392 6 10.392z"
                        fill="#fff"
                    />
                    <path
                        d="m131.3843 86.1801h8.535l-4.267-7.392zm10.268 2h-12c-.358 0-.688-.19-.867-.5-.178-.31-.178-.69 0-1l6-10.392c.358-.619 1.375-.619 1.733 0l6 10.392c.179.31.179.69 0 1s-.509.5-.866.5z"
                        fill="#000"
                    />
                    <path
                        d="m73.5811 35.391c.397 0 .72-.322.72-.72v-4.802-6.802c0-.398-.323-.72-.72-.72h-6.083c-.397 0-.719.322-.719.72v6.802 4.802c0 .398.322.72.719.72zm.7197 9.8028v-6.082c0-.398-.322-.721-.72-.721h-6.082c-.398 0-.72.323-.72.721v6.082c0 .397.322.72.72.72h6.082c.398 0 .72-.323.72-.72"
                        fill="#72767d"
                    />
                </g>
            </svg>

            <h1>Verifying your email</h1>

            <p>This may take a moment.</p>

            <button
                disabled
                className={`${styles.wait} button`}
            >
                <LoadingDots />
            </button>
        </div>
    </div>
);

export default async function AcceptInvitePage({
    searchParams,
}: {
    searchParams: Promise<{ code: string }>;
}) {
    const { code } = await searchParams;

    if (!code) return invalid;

    try {
        const user = null;

        if (!user) return invalid;

        const secret = new TextEncoder().encode(EMAIL_TOKEN_SECRET);
        const url = API_URL;

        const {
            payload,
        }: {
            payload: { id: number; type?: string; email?: string };
        } = await jwtVerify(user.emailVerificationToken || "", secret, {
            issuer: url,
            audience: url,
        });

        if (payload.type !== "verify-email-link" || !payload.email) {
            return invalid;
        }

        await db
            .updateTable("users")
            .set({
                email: payload.email,
                emailVerificationToken: null,
            })
            .where("id", "=", payload.id)
            .execute();
    } catch (error) {
        console.error(error);
        return invalid;
    }

    return (
        <div className={styles.container}>
            <div className={styles.logo}></div>

            <div className={styles.card}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 143 89"
                    height="100"
                >
                    <g
                        fill="none"
                        fillRule="evenodd"
                    >
                        <path
                            d="m113.2445 40.602-8.658 6.806c-.036.039-.082.065-.125.098l-.6.471-16.168 12.709c-1.019.801-1.018 2.346.003 3.146l16.165 12.67 9.384 7.356c.656.515 1.616.047 1.616-.787v-41.683c0-.834-.962-1.302-1.617-.786m-42.3828 12.5761-37.543 29.428c-1.496 1.173-.667 3.574 1.233 3.574h72.62c1.901 0 2.73-2.401 1.234-3.574zm-43.0760419 31.8652352 9.8973647-7.7571374 17.0258301-13.3455674c1.0759152-.843855 1.0780248-2.4724952.0031645-3.3174051l-17.0289946-13.4099113-9.895255-7.7919464c-.3280487-.2573757-.7246606-.2774173-1.0548188-.1402909v45.9004397c.3291034.1371265.7257153.1170849 1.0527091-.1381812"
                            fill="#acb0ff"
                        />
                        <path
                            d="m28.4808 38.061 8.381 6.6v-2.388-10.298c0-.833-.96-1.301-1.616-.787l-6.763 5.301c-.51.4-.511 1.172-.002 1.572m52.0586-27.2041-9.678-7.586-11.058 8.668c-.747.587-.333 1.787.617 1.787h25.401l-3.878-3.039c-.341.435-.968.511-1.404.17m24.3223 31.7314c0 .835.962 1.303 1.618.786l6.761-5.313c.51-.402.509-1.173-.001-1.574l-6.761-5.299c-.656-.514-1.617-.046-1.617.788z"
                            fill="#7b80d6"
                        />
                        <path
                            d="m38.8617 42.2729v3.963l3.1 2.44 14.43 11.364c.725.57 1.745.571 2.471.003l11.382-8.922c.091-.071.19-.124.295-.16.209-.071.436-.071.644 0 .105.036.205.089.295.16l11.357 8.901c.724.568 1.744.567 2.468-.002l17.558-13.801v-30.493h-64z"
                            fill="#fff"
                        />
                        <path
                            d="m26.8617 83.0707v-41.679c0-.439.271-.772.619-.918.314-.13.69-.111 1 .133l9.381 7.387 16.145 12.713c1.018.802 1.016 2.345-.003 3.145l-16.142 12.652-9.383 7.354c-.309.242-.685.261-.998.131-.348-.146-.619-.479-.619-.918zm8.384-51.883c.656-.513 1.616-.046 1.616.787v10.298 2.388l-8.381-6.599v-.001c-.509-.4-.508-1.172.002-1.572zm67.616-15.462v30.493l-17.558 13.801c-.724.57-1.744.571-2.468.002h-.001l-11.356-8.901c-.09-.071-.19-.124-.295-.159-.208-.072-.435-.072-.644 0-.105.035-.204.088-.295.159l-11.382 8.922c-.726.568-1.746.567-2.471-.003l-14.43-11.364-3.1-2.44v-3.963-26.547zm3.617 15.462v.001l6.761 5.299c.51.4.511 1.172.001 1.573l-6.761 5.314c-.656.516-1.618.049-1.618-.786v-10.613c0-.834.961-1.301 1.617-.788zm8.383 51.883c0 .834-.96 1.302-1.616.787l-9.384-7.355-16.165-12.67c-1.022-.801-1.022-2.346-.003-3.147l16.168-12.709.6-.47c.043-.034.088-.06.125-.099l8.658-6.806c.655-.515 1.617-.048 1.617.786zm-7.69 3.109h-72.62c-1.9 0-2.729-2.401-1.233-3.574l37.543-29.428 37.544 29.428c1.496 1.173.667 3.574-1.234 3.574zm9.68-48.981c-.003-.035-.009-.067-.014-.102-.017-.089-.043-.172-.082-.253-.012-.025-.02-.05-.034-.074-.058-.1-.133-.188-.224-.263-.008-.006-.011-.015-.019-.022l-11.617-9.105v-12.654c0-.552-.447-1-1-1h-18.04-25.401c-.951 0-1.365-1.2-.618-1.787l11.059-8.668 9.678 7.586c.435.341 1.063.265 1.404-.17.341-.434.265-1.063-.17-1.404l-10.295-8.069c-.362-.285-.872-.285-1.234 0l-14.062 11.021c-1.232.966-2.753 1.491-4.318 1.491h-14.003c-.552 0-1 .448-1 1v8.327c0 2.732-1.255 5.311-3.404 6.996l-8.213 6.436c-.008.007-.011.016-.019.023-.09.074-.166.162-.223.262-.015.024-.022.049-.034.074-.039.081-.066.164-.082.253-.006.035-.011.067-.014.102-.002.025-.011.048-.011.073v49.908c0 .552.448 1 1 1h90c.553 0 1-.448 1-1v-49.908c0-.025-.008-.048-.01-.073zm10.9309-28.4991c.256 0 .512-.098.707-.293l1.183-1.184c.39-.39.39-1.023 0-1.414-.391-.39-1.025-.39-1.414 0l-1.183 1.184c-.391.391-.391 1.024 0 1.414.195.195.451.293.707.293m-5.916 5.916c.256 0 .512-.098.707-.293l1.183-1.183c.39-.39.39-1.023 0-1.414-.391-.39-1.024-.39-1.414 0l-1.183 1.183c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293m6.3915-.2929c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023 0-1.414l-1.183-1.183c-.39-.39-1.023-.39-1.414 0-.39.391-.39 1.024 0 1.414zm-5.916-5.916c.195.195.451.293.707.293s.512-.098.707-.293c.391-.39.391-1.023 0-1.414l-1.183-1.184c-.39-.39-1.023-.39-1.414 0-.39.391-.39 1.024 0 1.414z"
                            fill="#000"
                        />
                        <path
                            d="m1.0003 52.3276c.833 0 1.51.677 1.51 1.51v.001c0 .552.447 1 1 1 .552 0 1-.448 1-1v-.001c0-.833.676-1.51 1.51-1.51.552 0 1-.447 1-1 0-.552-.448-1-1-1-.834 0-1.51-.676-1.51-1.51 0-.552-.448-1-1-1-.553 0-1 .448-1 1 0 .834-.677 1.51-1.51 1.51-.553 0-1 .448-1 1 0 .553.447 1 1 1m124.4893 13.0117c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7"
                            fill="#fff"
                        />
                        <path
                            d="m125.4896 65.3393c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7"
                            fill="#d3d6ed"
                        />
                        <path
                            d="m118.4896 59.3393c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6m0 14c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8"
                            fill="#000"
                        />
                        <path
                            d="m129.652 87.18 6-10.392 6 10.392z"
                            fill="#fff"
                        />
                        <path
                            d="m131.3841 86.1801h8.535l-4.267-7.392zm10.268 2h-12c-.358 0-.688-.19-.867-.5-.178-.31-.178-.69 0-1l6-10.392c.358-.619 1.375-.619 1.733 0l6 10.392c.179.31.179.69 0 1s-.509.5-.866.5z"
                            fill="#000"
                        />
                        <path
                            d="m62.5609 39.5688 4.812 4.811c.28.281.735.281 1.016 0l4.811-4.811 5.319-5.319 4.811-4.811c.28-.281.28-.736 0-1.016l-4.303-4.303c-.28-.28-.736-.28-1.017 0l-4.81 4.81-4.811 4.812c-.281.28-.736.28-1.016 0l-4.303-4.303c-.281-.281-.737-.281-1.017 0l-4.303 4.303c-.28.28-.28.735 0 1.016z"
                            fill="#62c483"
                        />
                    </g>
                </svg>

                <h1>Email Verified!</h1>

                <Link
                    draggable={false}
                    href="/channels/me"
                    className="button blue"
                >
                    Continue to Spark
                </Link>
            </div>
        </div>
    );
}
